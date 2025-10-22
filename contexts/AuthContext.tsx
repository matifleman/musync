import { useLoginMutation } from "@/hooks/useLoginMutation";
import { useSignUpMutation } from "@/hooks/useSignUpMutation";
import { useStorageState } from "@/hooks/useStorageState";
import { AuthResponse } from "@/types/AuthResponse.type";
import { LoginRequest } from "@/types/LoginRequest.type";
import { RegistrationRequest } from "@/types/RegistrationRequest.type";
import { useRouter } from "expo-router";
import { createContext, use, type PropsWithChildren } from 'react';
import Toast from "react-native-toast-message";

const AuthContext = createContext<{
  signIn: (loginRequest: LoginRequest) => Promise<void>;
  signUp: (registrationRequest: RegistrationRequest) => Promise<void>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: async (loginRequest: LoginRequest) => Promise.resolve(),
  signUp: async (registrationRequest: RegistrationRequest) => Promise.resolve(),
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
  const signUpMutation = useSignUpMutation();
  const router = useRouter();

  return (
    <AuthContext
      value={{
        signIn: async (loginRequest: LoginRequest): Promise<void> => {
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
              text1: 'Login failed',
              text2: err instanceof Error ? err.message : 'Try again',
            });
            throw(err);
          }
        },
        signUp: async (registrationRequest: RegistrationRequest): Promise<void> => {
          try{
            const authResponse: AuthResponse = await signUpMutation.mutateAsync(registrationRequest);
            console.log(JSON.stringify(authResponse));
            setSession(JSON.stringify(authResponse));
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
        },
        signOut: () => {
          setSession(null);
          router.replace("/sign-in");
        },
        session,
        isLoading,
      }}>
      {children}
    </AuthContext>
  );
}
