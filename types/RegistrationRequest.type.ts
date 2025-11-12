import { registrationSchema } from "@/schemas/registrationSchema";
import { z } from "zod";

export type RegistrationRequest = z.infer<typeof registrationSchema>;