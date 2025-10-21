import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useStorageState } from "@/hooks/useStorageState";
import { AuthResponse } from "@/types/AuthResponse.type";
import { LoginRequest } from "@/types/LoginRequest.type";
import { createContext, use, type PropsWithChildren } from 'react';
import Toast from "react-native-toast-message";

const AuthContext = createContext<{
  signIn: (loginRequest: LoginRequest) => void;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const loginMutation = useLoginMutation();

  return (
    <AuthContext
      value={{
        signIn: async (loginRequest: LoginRequest) => {
          try {
            const authResponse: AuthResponse = await loginMutation.mutateAsync(loginRequest)
            console.log(JSON.stringify(authResponse));
            setSession(JSON.stringify(authResponse));
            Toast.show({
              type: "success",
              text1: "Login successfull"
            });
          } catch (err) {
            console.log(err);
            Toast.show({
              type: 'error',
              text1: 'Error while signing in',
              text2: err instanceof Error ? err.message : 'Try again',
            });
          }
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}>
      {children}
    </AuthContext>
  );
}
