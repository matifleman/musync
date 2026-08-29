import * as authStore from "@/auth/authStore";
import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useSignUpMutation } from "@/hooks/useSignUpMutation";
import { AuthResponse } from "@/types/AuthResponse.type";
import { LoginRequest } from "@/types/LoginRequest.type";
import { RegistrationRequest } from "@/types/RegistrationRequest.type";
import { User } from "@/types/User.type";
import { useRouter } from "expo-router";
import { createContext, use, useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import Toast from "react-native-toast-message";

const AuthContext = createContext<{
  signIn: (loginRequest: LoginRequest) => Promise<void>;
  signUp: (registrationRequest: RegistrationRequest) => Promise<void>;
  signOut: () => void;
  updateCurrentUser: (user: User) => void;
  currentUser: User | null;
  isBootstrapping: boolean;
}>({
  signIn: async () => {},
  signUp: async () => {},
  signOut: () => {},
  updateCurrentUser: () => {},
  currentUser: null,
  isBootstrapping: true,
});

export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

function persistAuthResponse(authResponse: AuthResponse): Promise<void> {
  authStore.setAccessToken(authResponse.accessToken);
  return authStore.setRefreshCredentials({
    userId: authResponse.user.id,
    refreshToken: authResponse.refreshToken,
  });
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const loginMutation = useLoginMutation();
  const signUpMutation = useSignUpMutation();
  const router = useRouter();

  // A refresh attempt that fails for a previously-stored session (expired/revoked
  // refresh token) is reported here by authStore, regardless of whether it happened
  // during launch-time bootstrap or an API call's 401 retry.
  useEffect(() => {
    return authStore.onUnauthorized(() => {
      setCurrentUser(null);
      router.replace("/sign-in");
    });
  }, [router]);

  // Silently exchange a stored refresh token for a new access token before the
  // authenticated part of the app is allowed to render.
  useEffect(() => {
    (async () => {
      const refreshed = await authStore.refreshSession();
      if (refreshed) setCurrentUser(refreshed.user);
      setIsBootstrapping(false);
    })();
  }, []);

  const signIn = useCallback(async (loginRequest: LoginRequest): Promise<void> => {
    try {
      const authResponse: AuthResponse = await loginMutation.mutateAsync(loginRequest);
      await persistAuthResponse(authResponse);
      setCurrentUser(authResponse.user);
      Toast.show({
        type: "success",
        text1: "Login successfull"
      });
    } catch (err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Login failed',
        text2: err instanceof Error ? err.message : 'Try again',
      });
      throw err;
    }
  }, [loginMutation]);

  const signUp = useCallback(async (registrationRequest: RegistrationRequest): Promise<void> => {
    try {
      const authResponse: AuthResponse = await signUpMutation.mutateAsync(registrationRequest);
      await persistAuthResponse(authResponse);
      setCurrentUser(authResponse.user);
      Toast.show({
        type: "success",
        text1: "Registration successfull"
      });
    } catch (err) {
      console.log(err);
      Toast.show({
        type: 'error',
        text1: 'Registration failed',
        text2: err instanceof Error ? err.message : 'Try again',
      });
      throw err;
    }
  }, [signUpMutation]);

  const signOut = useCallback(() => {
    void authStore.signOut();
    setCurrentUser(null);
    router.replace("/sign-in");
  }, [router]);

  // Guards against setting a user while signed out — only signIn/signUp may
  // establish a session; this only ever updates an already-signed-in user.
  const updateCurrentUser = useCallback((user: User) => {
    setCurrentUser(prev => (prev ? user : prev));
  }, []);

  const value = useMemo(() => ({
    signIn,
    signUp,
    signOut,
    updateCurrentUser,
    currentUser,
    isBootstrapping,
  }), [signIn, signUp, signOut, updateCurrentUser, currentUser, isBootstrapping]);

  return (
    <AuthContext value={value}>
      {children}
    </AuthContext>
  );
}
