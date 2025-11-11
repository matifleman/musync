import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useReducer } from 'react';
import { Platform } from 'react-native';

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return useReducer(
    (state: [boolean, T | null], action: T | null = null): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === 'web') {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}

export function useStorageState<T = string>(key: string): UseStateHook<T> {
  // Public
  const [state, setState] = useAsyncState<T>();

  // Get
  useEffect(() => {
    const applyValue = (valueStr: string | null) => {
      if (valueStr == null) {
        setState(null);
        return;
      }

      try {
        const parsed = JSON.parse(valueStr);
        setState(parsed as unknown as T);
      } catch {
        // fallback to raw string if JSON.parse fails
        setState(valueStr as unknown as T);
      }
    };

    if (Platform.OS === 'web') {
      try {
        if (typeof localStorage !== 'undefined') {
          applyValue(localStorage.getItem(key));
        }
      } catch (e) {
        console.error('Local storage is unavailable:', e);
      }
    } else {
      SecureStore.getItemAsync(key).then(value => {
        applyValue(value);
      });
    }
  }, [key, setState]);

  // Set
  const setValue = useCallback(
    (value: T | null) => {
      // update local state
      setState(value);
      const toStore = value == null ? null : JSON.stringify(value);
      setStorageItemAsync(key, toStore);
    },
    [key, setState]
  );

  return [state, setValue];
}
