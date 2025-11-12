import { setStorageItemAsync } from '@/hooks/useStorageState';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

async function readSessionRaw(key = 'session'): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    } catch (e) {
      console.error('Local storage is unavailable:', e);
      return null;
    }
  }

  return await SecureStore.getItemAsync(key);
}

export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const sessionRaw = await readSessionRaw();
  let parsedSession: any = null;
  let token: string | null = null;
  if (sessionRaw) {
    try {
      parsedSession = JSON.parse(sessionRaw);
      token = parsedSession?.accessToken ?? null;
    } catch {
      // if stored value is not JSON, ignore
      parsedSession = null;
      token = null;
    }
  }

  const makeFetch = async (bearer: string | null) => {
    const headers = new Headers(init?.headers ?? ({} as HeadersInit));
    if (bearer) headers.set('Authorization', `Bearer ${bearer}`);

    const finalInit: RequestInit = {
      ...init,
      headers,
    };

    return fetch(input, finalInit);
  };

  // first attempt with current token (if any)
  const res = await makeFetch(token);

  if (res.status !== 401) return res;

  // if 401 and we have refreshToken + userId, try to refresh
  const refreshToken = parsedSession?.refreshToken;
  const userId = parsedSession?.user?.id;
  if (!refreshToken || !userId) {
    return res; // can't refresh
  }

  try {
    const refreshRes = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, refreshToken }),
    });

    if (!refreshRes.ok) {
      // refresh failed: clear stored session
      await setStorageItemAsync('session', null);
      return res;
    }

    const newAuth = await refreshRes.json();
    console.log("Refreshed auth:", newAuth);

    // persist new auth response (secure store / localStorage)
    await setStorageItemAsync('session', JSON.stringify(newAuth));

    // retry original request with new token
    const retryRes = await makeFetch(newAuth.accessToken ?? null);
    return retryRes;
  } catch {
    // on error, clear stored session and return original 401
    await setStorageItemAsync('session', null);
    return res;
  }
}

export default apiFetch;
