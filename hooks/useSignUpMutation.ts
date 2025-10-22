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
    
    if (!response.ok) 
      throw new Error('Registration failed');
    
    const data: AuthResponse = await response.json();
    return data;
  }
  
  return useMutation({
    mutationFn: signUp,
  })
}