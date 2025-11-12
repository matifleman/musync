import { AuthResponse } from "@/types/AuthResponse.type";
import { RegistrationRequest } from "@/types/RegistrationRequest.type";
import { useMutation } from "@tanstack/react-query";

export function useSignUpMutation() {
  const signUp = async function(registrationRequest: RegistrationRequest): Promise<AuthResponse> {
    const response: Response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/register`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(registrationRequest)
    });
    
    if (!response.ok) {
      const errorBody = await response.json();
      console.log('Registration error:', errorBody);
      const firstError =
        errorBody.errors && typeof errorBody.errors === "object"
          ? Object.values(errorBody.errors).flat()[0]
          : errorBody.title || "Something went wrong";

      throw new Error(firstError);
    }
    
    const data: AuthResponse = await response.json();
    return data;
  }
  
  return useMutation({
    mutationFn: signUp,
  })
}