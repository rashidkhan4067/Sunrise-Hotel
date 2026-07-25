export interface ActiveGuest {
  id: number | string
  name: string
  phone: string
  email: string
}

export interface ActiveBooking {
  id: string
  check_in: string
  check_out: string
  status: string
  guest: ActiveGuest
}

export interface BookingHistoryItem {
  id: string
  check_in: string
  check_out: string
  status: string
  guest_name: string
  total_price: number
}

export interface Room {
  id: number | string
  room_number: string
  room_type: 'SINGLE' | 'DOUBLE' | 'TWIN' | 'DELUXE' | 'SUITE' | 'FAMILY'
  floor: number
  capacity: number
  price_per_night: number
  status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'MAINTENANCE'
  description?: string | null
  amenities?: string | null
  is_archived?: boolean
  is_clean?: boolean
  is_inspected?: boolean
  
  // Optional enriched fields
  current_booking?: ActiveBooking | null
  booking_history?: BookingHistoryItem[]
}
