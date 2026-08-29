import { z } from "zod";

export const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(6, "Username must be at least 6 characters"),
  bornDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  email: z.string().email("Invalid email address"),
  password: z.string().min(10, "Password must be at least 10 characters"),
});

