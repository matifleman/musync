import { AuthResponse } from "@/types/AuthResponse.type";
import { LoginRequest } from "@/types/LoginRequest.type";
import { useMutation } from "@tanstack/react-query";

export function useLoginMutation() {
  const login = async function(loginRequest: LoginRequest): Promise<AuthResponse> {
    const response: Response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(loginRequest)
    });
  
    const data: AuthResponse = await response.json();
    return data;
  }
  
  return useMutation({
    mutationFn: login,
  })
}