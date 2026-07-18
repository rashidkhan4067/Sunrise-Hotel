import { z } from "zod"

export const roomFormSchema = z.object({
  room_number: z.string().min(1, "Room number is required"),
  room_type: z.enum(["SINGLE", "DOUBLE", "TWIN", "DELUXE", "SUITE", "FAMILY"]),
  floor: z.coerce.number().int().min(0, "Floor must be 0 or higher"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  price_per_night: z.coerce.number().min(1, "Price must be at least 1"),
  status: z.enum(["AVAILABLE", "OCCUPIED", "CLEANING", "MAINTENANCE"]),
  description: z.string().optional().nullable(),
  amenities: z.string().optional().nullable(),
})

export type RoomFormValues = z.infer<typeof roomFormSchema>
