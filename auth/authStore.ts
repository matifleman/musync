import { AuthResponse } from '@/types/AuthResponse.type'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const REFRESH_CREDENTIALS_KEY = 'refreshCredentials'
const LEGACY_SESSION_KEY = 'session'

type RefreshCredentials = {
  userId: number
  refreshToken: string
}

async function readStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null
    } catch (e) {
      console.error('Local storage is unavailable:', e)
      return null
    }
  }
  return SecureStore.getItemAsync(key)
}

async function writeStorageItem(key: string, value: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    } catch (e) {
      console.error('Local storage is unavailable:', e)
    }
    return
  }
  if (value === null) await SecureStore.deleteItemAsync(key)
  else await SecureStore.setItemAsync(key, value)
}

// Access token never touches storage — it only ever lives in this module-level variable.
let accessToken: string | null = null
let unauthorizedListeners: Array<() => void> = []
let legacyCleanupDone = false

// Older builds persisted the whole session (including the access token) under this key.
// Wipe it once so it can't be read as a fallback and force a one-time re-login.
async function cleanupLegacySessionKey(): Promise<void> {
  if (legacyCleanupDone) return
  legacyCleanupDone = true
  const legacy = await readStorageItem(LEGACY_SESSION_KEY)
  if (legacy != null) await writeStorageItem(LEGACY_SESSION_KEY, null)
}

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export async function getRefreshCredentials(): Promise<RefreshCredentials | null> {
  await cleanupLegacySessionKey()
  const raw = await readStorageItem(REFRESH_CREDENTIALS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as RefreshCredentials
  } catch {
    return null
  }
}

export async function setRefreshCredentials(credentials: RefreshCredentials): Promise<void> {
  await writeStorageItem(REFRESH_CREDENTIALS_KEY, JSON.stringify(credentials))
}

export async function clearRefreshCredentials(): Promise<void> {
  await writeStorageItem(REFRESH_CREDENTIALS_KEY, null)
}

// Registers a callback fired when a refresh attempt fails for a session that
// actually had stored credentials (as opposed to "never logged in"). AuthContext
// wires this to its own signOut() so a dead refresh token forces navigation to
// sign-in without authStore needing to know about React or expo-router.
export function onUnauthorized(listener: () => void): () => void {
  unauthorizedListeners.push(listener)
  return () => {
    unauthorizedListeners = unauthorizedListeners.filter(l => l !== listener)
  }
}

function notifyUnauthorized(): void {
  unauthorizedListeners.forEach(listener => listener())
}

async function clearSession(): Promise<void> {
  accessToken = null
  await clearRefreshCredentials()
}

export async function signOutLocally(): Promise<void> {
  await clearSession()
}

type RefreshOutcome = {
  authResponse: AuthResponse | null
  hadCredentials: boolean
}

async function performRefresh(): Promise<RefreshOutcome> {
  const credentials = await getRefreshCredentials()
  if (!credentials) return { authResponse: null, hadCredentials: false }

  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: credentials.userId, refreshToken: credentials.refreshToken }),
    })

    if (!response.ok) return { authResponse: null, hadCredentials: true }

    const authResponse: AuthResponse = await response.json()
    accessToken = authResponse.accessToken
    await setRefreshCredentials({ userId: authResponse.user.id, refreshToken: authResponse.refreshToken })
    return { authResponse, hadCredentials: true }
  } catch (err) {
    console.error('Token refresh failed:', err)
    return { authResponse: null, hadCredentials: true }
  }
}

let inFlightRefresh: Promise<RefreshOutcome> | null = null

// Single implementation of "use the stored refresh token to get a new access
// token", shared by AuthContext's launch-time bootstrap and apiFetch's 401
// handler. Concurrent callers share one in-flight request/promise, so a burst
// of 401s from parallel requests triggers exactly one call to /auth/refresh.
export async function refreshSession(): Promise<AuthResponse | null> {
  if (!inFlightRefresh) {
    inFlightRefresh = performRefresh().finally(() => {
      inFlightRefresh = null
    })
  }

  const { authResponse, hadCredentials } = await inFlightRefresh
  if (!authResponse) {
    await clearSession()
    if (hadCredentials) notifyUnauthorized()
  }
  return authResponse
}
