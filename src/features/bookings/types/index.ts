import type { Room } from "@/features/rooms"
import type { Guest } from "@/features/guests"

export type { Guest }

export interface Booking {
  booking_id: string
  guest: number | string
  guest_details: Guest
  room: number | string
  room_details: Room
  check_in: string
  check_out: string
  adults: number
  children: number
  total_price: string | number
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED'
  created_at: string
  updated_at: string
}
