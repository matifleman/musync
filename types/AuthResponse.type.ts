import { User } from "./User.type";

export type AuthResponse = {
  user:         User;
  accessToken:  string;
  refreshToken: string;
};