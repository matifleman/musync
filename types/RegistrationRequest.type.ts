// export type RegistrationRequest = {
//   firstName:              string,
//   lastName:               string,
//   username:               string,
//   BornDate:               string,
//   email:                  string,
//   password:               string,
//   favoriteInstrumentsIds: number[]
//   favoriteGenresIds:      number[]
// };

import { registrationSchema } from "@/schemas/registrationSchema";
import { z } from "zod";

export type RegistrationRequest = z.infer<typeof registrationSchema>;