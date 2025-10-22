// export type LoginRequest = {
//   email:    string;
//   password: string;
// };  

import { loginSchema } from "@/schemas/loginSchema";
import { z } from "zod";

export type LoginRequest = z.infer<typeof loginSchema>;