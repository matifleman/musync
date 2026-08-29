import type { components } from './api'
import type { Defined } from './apiTypeHelpers'
import { CurrentUser } from "./User.type";

export type AuthResponse = Defined<Omit<components["schemas"]["AuthResponse"], "user">> & {
  user: CurrentUser;
};
