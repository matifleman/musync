import type { components } from './api'
import type { Defined } from './apiTypeHelpers'
import { User } from "./User.type";

export type AuthResponse = Defined<Omit<components["schemas"]["AuthResponse"], "user">> & {
  user: User;
};
