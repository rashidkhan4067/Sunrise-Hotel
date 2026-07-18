import { z } from "zod"

export const guestFormSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  phone_number: z.string().min(5, "Phone number must be at least 5 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  document_number: z.string().min(2, "Document number (CNIC/Passport) is required"),
  address: z.string().optional(),
})

export type GuestFormValues = z.infer<typeof guestFormSchema>
