import { z } from "zod"

export const bookingFormSchema = z.object({
  guest: z.union([z.string(), z.number()]).refine(val => val !== "", "Guest selection is required"),
  room: z.union([z.string(), z.number()]).refine(val => val !== "", "Room selection is required"),
  check_in: z.string().min(1, "Check-in date is required"),
  check_out: z.string().min(1, "Check-out date is required"),
  adults: z.coerce.number().int().min(1, "At least 1 adult is required"),
  children: z.coerce.number().int().min(0, "Children count must be 0 or higher"),
  special_requests: z.string().optional().nullable(),
  status: z.enum(["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"]).default("PENDING"),
}).refine((data) => {
  const start = new Date(data.check_in)
  const end = new Date(data.check_out)
  return end > start
}, {
  message: "Check-out date must be after check-in date",
  path: ["check_out"],
})

export type BookingFormValues = z.infer<typeof bookingFormSchema>
