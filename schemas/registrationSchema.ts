import { z } from "zod";

export const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(6, "Username must be at least 6 characters"),
  bornDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  favoriteInstrumentsIds: z.array(z.number()).optional(),
  favoriteGenresIds: z.array(z.number()).optional(),
});

export const basicRegistrationInfoSchema = registrationSchema.pick({
  firstName: true,
  lastName: true,
  username: true,
  bornDate: true,
  email: true,
  password: true,
});

export const interestsSchema = registrationSchema.pick({
  favoriteInstrumentsIds: true,
  favoriteGenresIds: true,
});

