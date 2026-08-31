/**
 * Demo Mode — Centralized Mock Data
 * Used when VITE_DEMO_MODE=true to replace all backend API calls.
 */

// ─── Demo Users (Auth) ────────────────────────────────────────────────────────

export const DEMO_USERS_AUTH = [
  {
    id: "demo-admin-001",
    email: "admin@sunrise.com",
    password: "demo1234",
    fullName: "Ahmad Hassan",
    firstName: "Ahmad",
    lastName: "Hassan",
    imageUrl: "",
    role: "org:admin" as const,
  },
  {
    id: "demo-receptionist-001",
    email: "receptionist@sunrise.com",
    password: "demo1234",
    fullName: "Sara Malik",
    firstName: "Sara",
    lastName: "Malik",
    imageUrl: "",
    role: "receptionist" as const,
  },
  {
    id: "demo-guest-001",
    email: "guest@sunrise.com",
    password: "demo1234",
    fullName: "Usman Farooq",
    firstName: "Usman",
    lastName: "Farooq",
    imageUrl: "",
    role: "org:member" as const,
  },
]

// ─── Staff Users (for Users Management Panel) ─────────────────────────────────

export const DEMO_STAFF_USERS = [
  {
    id: 1,
    name: "Ahmad Hassan",
    email: "admin@sunrise.com",
    role: "Admin",
    status: "Active",
    joinedDate: "2024-01-10",
    lastLogin: "2026-08-05",
    avatar: "",
  },
  {
    id: 2,
    name: "Sara Malik",
    email: "receptionist@sunrise.com",
    role: "Receptionist",
    status: "Active",
    joinedDate: "2024-03-15",
    lastLogin: "2026-08-04",
    avatar: "",
  },
  {
    id: 3,
    name: "Bilal Ahmed",
    email: "bilal.ahmed@sunrise.com",
    role: "Receptionist",
    status: "Active",
    joinedDate: "2024-06-01",
    lastLogin: "2026-08-03",
    avatar: "",
  },
  {
    id: 4,
    name: "Fatima Noor",
    email: "fatima.noor@sunrise.com",
    role: "Receptionist",
    status: "Inactive",
    joinedDate: "2024-09-20",
    lastLogin: "2026-07-28",
    avatar: "",
  },
]

// ─── Guests ───────────────────────────────────────────────────────────────────

export const DEMO_GUESTS = [
  { id: 1, full_name: "Usman Farooq", phone_number: "+92-300-1234567", email: "usman.farooq@email.com", document_number: "35202-1234567-1", address: "House 12, Street 4, F-8/3, Islamabad", is_active: true, created_at: "2025-11-10T08:00:00Z", updated_at: "2026-08-01T10:00:00Z" },
  { id: 2, full_name: "Ayesha Siddiqui", phone_number: "+92-321-7654321", email: "ayesha.s@email.com", document_number: "42201-7654321-2", address: "Flat 5A, Block C, Gulshan-e-Iqbal, Karachi", is_active: true, created_at: "2025-12-01T09:00:00Z", updated_at: "2026-07-15T11:00:00Z" },
  { id: 3, full_name: "Kamran Akhtar", phone_number: "+92-333-9988776", email: "kamran.akhtar@gmail.com", document_number: "31201-9988776-3", address: "62-B, Model Town, Lahore", is_active: true, created_at: "2026-01-05T10:00:00Z", updated_at: "2026-08-02T12:00:00Z" },
  { id: 4, full_name: "Nadia Rehman", phone_number: "+92-345-5566778", email: "nadia.rehman@email.com", document_number: "61101-5566778-4", address: "Plot 22, Sector B, DHA Phase 2, Islamabad", is_active: true, created_at: "2026-02-14T08:30:00Z", updated_at: "2026-07-20T09:00:00Z" },
  { id: 5, full_name: "Tariq Mehmood", phone_number: "+92-311-4433221", email: "tariq.mehmood@gmail.com", document_number: "38401-4433221-5", address: "House 7, Street 9, Hayatabad, Peshawar", is_active: true, created_at: "2026-03-22T07:00:00Z", updated_at: "2026-08-04T14:00:00Z" },
  { id: 6, full_name: "Sobia Iqbal", phone_number: "+92-300-8877665", email: "sobia.iqbal@email.com", document_number: "35501-8877665-6", address: "Flat 3, Block 14, Clifton, Karachi", is_active: true, created_at: "2026-04-01T11:00:00Z", updated_at: "2026-08-01T16:00:00Z" },
  { id: 7, full_name: "Faisal Khan", phone_number: "+92-322-1122334", email: "faisal.khan@email.com", document_number: "17301-1122334-7", address: "House 45, Street 3, Wapda Town, Lahore", is_active: true, created_at: "2026-04-15T09:30:00Z", updated_at: "2026-07-30T10:00:00Z" },
  { id: 8, full_name: "Hina Qureshi", phone_number: "+92-334-9900112", email: "hina.qureshi@email.com", document_number: "44102-9900112-8", address: "Office 2B, Blue Area, Islamabad", is_active: false, created_at: "2026-05-10T08:00:00Z", updated_at: "2026-06-20T09:00:00Z" },
  { id: 9, full_name: "Zubair Shah", phone_number: "+92-315-3344556", email: "zubair.shah@gmail.com", document_number: "21102-3344556-9", address: "House 19, Street 7, G-9/4, Islamabad", is_active: true, created_at: "2026-05-22T10:00:00Z", updated_at: "2026-08-03T11:00:00Z" },
  { id: 10, full_name: "Madiha Asif", phone_number: "+92-301-6677889", email: "madiha.asif@email.com", document_number: "36501-6677889-0", address: "Plot 8, Block H, Phase 3, DHA Karachi", is_active: true, created_at: "2026-06-01T09:00:00Z", updated_at: "2026-08-04T13:00:00Z" },
  { id: 11, full_name: "Omar Siddiqui", phone_number: "+92-345-1234560", email: "omar.siddiqui@email.com", document_number: "42101-1234560-1", address: "House 33, Johar Town, Lahore", is_active: true, created_at: "2026-06-15T08:30:00Z", updated_at: "2026-08-02T15:00:00Z" },
  { id: 12, full_name: "Rabia Tahir", phone_number: "+92-303-5544332", email: "rabia.tahir@email.com", document_number: "35202-5544332-2", address: "Street 12, Bahria Town, Rawalpindi", is_active: true, created_at: "2026-07-01T10:00:00Z", updated_at: "2026-08-05T08:00:00Z" },
]

// ─── Rooms ────────────────────────────────────────────────────────────────────

export const DEMO_ROOMS = [
  { id: 1, room_number: "101", room_type: "SINGLE" as const, floor: 1, capacity: 1, price_per_night: 8500, status: "AVAILABLE" as const, description: "Cozy single room with city view", amenities: "WiFi, AC, TV, Mini-fridge", is_clean: true, is_inspected: true, is_archived: false },
  { id: 2, room_number: "102", room_type: "SINGLE" as const, floor: 1, capacity: 1, price_per_night: 8500, status: "OCCUPIED" as const, description: "Compact single room with garden view", amenities: "WiFi, AC, TV", is_clean: false, is_inspected: false, is_archived: false, current_booking: { id: "BK-0002", check_in: "2026-08-03", check_out: "2026-08-07", status: "CHECKED_IN", guest: { id: 2, name: "Ayesha Siddiqui", phone: "+92-321-7654321", email: "ayesha.s@email.com" } } },
  { id: 3, room_number: "103", room_type: "DOUBLE" as const, floor: 1, capacity: 2, price_per_night: 14000, status: "CLEANING" as const, description: "Spacious double room with balcony", amenities: "WiFi, AC, TV, Balcony, Mini-fridge", is_clean: false, is_inspected: false, is_archived: false },
  { id: 4, room_number: "104", room_type: "DOUBLE" as const, floor: 1, capacity: 2, price_per_night: 14000, status: "AVAILABLE" as const, description: "Double room with city view", amenities: "WiFi, AC, TV, Safe", is_clean: true, is_inspected: true, is_archived: false },
  { id: 5, room_number: "201", room_type: "TWIN" as const, floor: 2, capacity: 2, price_per_night: 15500, status: "AVAILABLE" as const, description: "Twin room with two single beds", amenities: "WiFi, AC, TV, Wardrobe", is_clean: true, is_inspected: true, is_archived: false },
  { id: 6, room_number: "202", room_type: "TWIN" as const, floor: 2, capacity: 2, price_per_night: 15500, status: "OCCUPIED" as const, description: "Twin room with mountain view", amenities: "WiFi, AC, TV, Desk", is_clean: false, is_inspected: false, is_archived: false, current_booking: { id: "BK-0005", check_in: "2026-08-02", check_out: "2026-08-06", status: "CHECKED_IN", guest: { id: 5, name: "Tariq Mehmood", phone: "+92-311-4433221", email: "tariq.mehmood@gmail.com" } } },
  { id: 7, room_number: "203", room_type: "DOUBLE" as const, floor: 2, capacity: 2, price_per_night: 14500, status: "MAINTENANCE" as const, description: "Double room undergoing renovation", amenities: "WiFi, AC, TV", is_clean: false, is_inspected: false, is_archived: false },
  { id: 8, room_number: "204", room_type: "DOUBLE" as const, floor: 2, capacity: 2, price_per_night: 14500, status: "AVAILABLE" as const, description: "Corner double room with panoramic view", amenities: "WiFi, AC, TV, Balcony, Bathtub", is_clean: true, is_inspected: true, is_archived: false },
  { id: 9, room_number: "301", room_type: "DELUXE" as const, floor: 3, capacity: 2, price_per_night: 22000, status: "OCCUPIED" as const, description: "Deluxe room with premium furnishings", amenities: "WiFi, AC, Smart TV, Mini-bar, Safe, Jacuzzi", is_clean: false, is_inspected: false, is_archived: false, current_booking: { id: "BK-0009", check_in: "2026-08-01", check_out: "2026-08-08", status: "CHECKED_IN", guest: { id: 9, name: "Zubair Shah", phone: "+92-315-3344556", email: "zubair.shah@gmail.com" } } },
  { id: 10, room_number: "302", room_type: "DELUXE" as const, floor: 3, capacity: 2, price_per_night: 22000, status: "AVAILABLE" as const, description: "Deluxe room with king bed", amenities: "WiFi, AC, Smart TV, Mini-bar, Bathtub", is_clean: true, is_inspected: true, is_archived: false },
  { id: 11, room_number: "303", room_type: "DELUXE" as const, floor: 3, capacity: 3, price_per_night: 24000, status: "CLEANING" as const, description: "Premium deluxe room with sofa", amenities: "WiFi, AC, Smart TV, Mini-bar, Safe, Balcony", is_clean: false, is_inspected: false, is_archived: false },
  { id: 12, room_number: "304", room_type: "DELUXE" as const, floor: 3, capacity: 2, price_per_night: 22000, status: "AVAILABLE" as const, description: "Deluxe room with pool view", amenities: "WiFi, AC, Smart TV, Mini-bar, Bathtub, Pool View", is_clean: true, is_inspected: false, is_archived: false },
  { id: 13, room_number: "401", room_type: "SUITE" as const, floor: 4, capacity: 4, price_per_night: 45000, status: "OCCUPIED" as const, description: "Presidential Suite with separate living area", amenities: "WiFi, AC, Smart TV, Full Kitchen, Jacuzzi, Butler Service, Balcony", is_clean: false, is_inspected: false, is_archived: false, current_booking: { id: "BK-0010", check_in: "2026-08-04", check_out: "2026-08-09", status: "CHECKED_IN", guest: { id: 10, name: "Madiha Asif", phone: "+92-301-6677889", email: "madiha.asif@email.com" } } },
  { id: 14, room_number: "402", room_type: "SUITE" as const, floor: 4, capacity: 4, price_per_night: 42000, status: "AVAILABLE" as const, description: "Royal Suite with panoramic view", amenities: "WiFi, AC, Smart TV, Mini-bar, Jacuzzi, Balcony, Safe", is_clean: true, is_inspected: true, is_archived: false },
  { id: 15, room_number: "403", room_type: "SUITE" as const, floor: 4, capacity: 4, price_per_night: 48000, status: "MAINTENANCE" as const, description: "Ambassador Suite under renovation", amenities: "WiFi, AC, Smart TV, Full Kitchen, Jacuzzi", is_clean: false, is_inspected: false, is_archived: false },
  { id: 16, room_number: "501", room_type: "FAMILY" as const, floor: 5, capacity: 6, price_per_night: 32000, status: "AVAILABLE" as const, description: "Spacious family room with bunk beds", amenities: "WiFi, AC, Smart TV, Mini-fridge, Sofa, Kids Area", is_clean: true, is_inspected: true, is_archived: false },
  { id: 17, room_number: "502", room_type: "FAMILY" as const, floor: 5, capacity: 6, price_per_night: 32000, status: "OCCUPIED" as const, description: "Family room with separate kids bedroom", amenities: "WiFi, AC, Smart TV, Full Kitchen, Washing Machine", is_clean: false, is_inspected: false, is_archived: false, current_booking: { id: "BK-0007", check_in: "2026-08-01", check_out: "2026-08-10", status: "CHECKED_IN", guest: { id: 7, name: "Faisal Khan", phone: "+92-322-1122334", email: "faisal.khan@email.com" } } },
  { id: 18, room_number: "503", room_type: "FAMILY" as const, floor: 5, capacity: 5, price_per_night: 29000, status: "CLEANING" as const, description: "Family suite with mountain view", amenities: "WiFi, AC, Smart TV, Mini-fridge, Sofa Bed", is_clean: false, is_inspected: false, is_archived: false },
  { id: 19, room_number: "601", room_type: "SINGLE" as const, floor: 6, capacity: 1, price_per_night: 9500, status: "AVAILABLE" as const, description: "Premium single room with skyline view", amenities: "WiFi, AC, Smart TV, Mini-fridge, Work Desk", is_clean: true, is_inspected: true, is_archived: false },
  { id: 20, room_number: "602", room_type: "DOUBLE" as const, floor: 6, capacity: 2, price_per_night: 16000, status: "AVAILABLE" as const, description: "Top floor double room with sunset view", amenities: "WiFi, AC, Smart TV, Mini-bar, Bathtub, Balcony", is_clean: true, is_inspected: true, is_archived: false },
]

// ─── Rooms Summary ────────────────────────────────────────────────────────────

export const DEMO_ROOMS_SUMMARY = {
  total: 20,
  available: 9,
  occupied: 6,
  cleaning: 3,
  maintenance: 2,
  dirty: 8,
  uninspected: 6,
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const DEMO_BOOKINGS = [
  {
    booking_id: "BK-0001",
    guest: 1,
    guest_details: DEMO_GUESTS[0],
    room: 1,
    room_details: DEMO_ROOMS[0],
    check_in: "2026-08-10",
    check_out: "2026-08-14",
    adults: 1,
    children: 0,
    total_price: "34000.00",
    status: "CONFIRMED" as const,
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-01T10:00:00Z",
  },
  {
    booking_id: "BK-0002",
    guest: 2,
    guest_details: DEMO_GUESTS[1],
    room: 2,
    room_details: DEMO_ROOMS[1],
    check_in: "2026-08-03",
    check_out: "2026-08-07",
    adults: 1,
    children: 0,
    total_price: "34000.00",
    status: "CHECKED_IN" as const,
    created_at: "2026-07-28T09:00:00Z",
    updated_at: "2026-08-03T14:00:00Z",
  },
  {
    booking_id: "BK-0003",
    guest: 3,
    guest_details: DEMO_GUESTS[2],
    room: 4,
    room_details: DEMO_ROOMS[3],
    check_in: "2026-08-12",
    check_out: "2026-08-16",
    adults: 2,
    children: 0,
    total_price: "56000.00",
    status: "PENDING" as const,
    created_at: "2026-08-04T11:00:00Z",
    updated_at: "2026-08-04T11:00:00Z",
  },
  {
    booking_id: "BK-0004",
    guest: 4,
    guest_details: DEMO_GUESTS[3],
    room: 5,
    room_details: DEMO_ROOMS[4],
    check_in: "2026-07-25",
    check_out: "2026-07-30",
    adults: 2,
    children: 0,
    total_price: "77500.00",
    status: "CHECKED_OUT" as const,
    created_at: "2026-07-20T08:00:00Z",
    updated_at: "2026-07-30T12:00:00Z",
  },
  {
    booking_id: "BK-0005",
    guest: 5,
    guest_details: DEMO_GUESTS[4],
    room: 6,
    room_details: DEMO_ROOMS[5],
    check_in: "2026-08-02",
    check_out: "2026-08-06",
    adults: 2,
    children: 1,
    total_price: "62000.00",
    status: "CHECKED_IN" as const,
    created_at: "2026-07-30T10:30:00Z",
    updated_at: "2026-08-02T15:00:00Z",
  },
  {
    booking_id: "BK-0006",
    guest: 6,
    guest_details: DEMO_GUESTS[5],
    room: 8,
    room_details: DEMO_ROOMS[7],
    check_in: "2026-08-15",
    check_out: "2026-08-20",
    adults: 2,
    children: 0,
    total_price: "72500.00",
    status: "CONFIRMED" as const,
    created_at: "2026-08-02T12:00:00Z",
    updated_at: "2026-08-02T12:00:00Z",
  },
  {
    booking_id: "BK-0007",
    guest: 7,
    guest_details: DEMO_GUESTS[6],
    room: 17,
    room_details: DEMO_ROOMS[16],
    check_in: "2026-08-01",
    check_out: "2026-08-10",
    adults: 2,
    children: 3,
    total_price: "288000.00",
    status: "CHECKED_IN" as const,
    created_at: "2026-07-25T09:00:00Z",
    updated_at: "2026-08-01T14:00:00Z",
  },
  {
    booking_id: "BK-0008",
    guest: 8,
    guest_details: DEMO_GUESTS[7],
    room: 10,
    room_details: DEMO_ROOMS[9],
    check_in: "2026-07-15",
    check_out: "2026-07-18",
    adults: 2,
    children: 0,
    total_price: "66000.00",
    status: "CANCELLED" as const,
    created_at: "2026-07-10T08:00:00Z",
    updated_at: "2026-07-12T11:00:00Z",
  },
  {
    booking_id: "BK-0009",
    guest: 9,
    guest_details: DEMO_GUESTS[8],
    room: 9,
    room_details: DEMO_ROOMS[8],
    check_in: "2026-08-01",
    check_out: "2026-08-08",
    adults: 2,
    children: 0,
    total_price: "154000.00",
    status: "CHECKED_IN" as const,
    created_at: "2026-07-28T10:00:00Z",
    updated_at: "2026-08-01T13:00:00Z",
  },
  {
    booking_id: "BK-0010",
    guest: 10,
    guest_details: DEMO_GUESTS[9],
    room: 13,
    room_details: DEMO_ROOMS[12],
    check_in: "2026-08-04",
    check_out: "2026-08-09",
    adults: 2,
    children: 2,
    total_price: "225000.00",
    status: "CHECKED_IN" as const,
    created_at: "2026-07-30T11:00:00Z",
    updated_at: "2026-08-04T14:00:00Z",
  },
  {
    booking_id: "BK-0011",
    guest: 11,
    guest_details: DEMO_GUESTS[10],
    room: 14,
    room_details: DEMO_ROOMS[13],
    check_in: "2026-08-20",
    check_out: "2026-08-25",
    adults: 2,
    children: 0,
    total_price: "210000.00",
    status: "CONFIRMED" as const,
    created_at: "2026-08-03T09:00:00Z",
    updated_at: "2026-08-03T09:00:00Z",
  },
  {
    booking_id: "BK-0012",
    guest: 12,
    guest_details: DEMO_GUESTS[11],
    room: 16,
    room_details: DEMO_ROOMS[15],
    check_in: "2026-08-08",
    check_out: "2026-08-12",
    adults: 2,
    children: 2,
    total_price: "128000.00",
    status: "CONFIRMED" as const,
    created_at: "2026-08-04T08:00:00Z",
    updated_at: "2026-08-04T08:00:00Z",
  },
  {
    booking_id: "BK-0013",
    guest: 1,
    guest_details: DEMO_GUESTS[0],
    room: 19,
    room_details: DEMO_ROOMS[18],
    check_in: "2026-07-01",
    check_out: "2026-07-05",
    adults: 1,
    children: 0,
    total_price: "38000.00",
    status: "CHECKED_OUT" as const,
    created_at: "2026-06-25T10:00:00Z",
    updated_at: "2026-07-05T11:00:00Z",
  },
  {
    booking_id: "BK-0014",
    guest: 3,
    guest_details: DEMO_GUESTS[2],
    room: 20,
    room_details: DEMO_ROOMS[19],
    check_in: "2026-08-18",
    check_out: "2026-08-22",
    adults: 2,
    children: 0,
    total_price: "64000.00",
    status: "PENDING" as const,
    created_at: "2026-08-05T07:00:00Z",
    updated_at: "2026-08-05T07:00:00Z",
  },
  {
    booking_id: "BK-0015",
    guest: 6,
    guest_details: DEMO_GUESTS[5],
    room: 12,
    room_details: DEMO_ROOMS[11],
    check_in: "2026-06-10",
    check_out: "2026-06-14",
    adults: 2,
    children: 0,
    total_price: "88000.00",
    status: "CHECKED_OUT" as const,
    created_at: "2026-06-05T09:00:00Z",
    updated_at: "2026-06-14T12:00:00Z",
  },
]

// ─── Demo Folio (for booking detail view) ─────────────────────────────────────

export function getDemoFolio(bookingId: string) {
  const booking = DEMO_BOOKINGS.find(b => b.booking_id === bookingId)
  if (!booking) return null
  return {
    id: parseInt(bookingId.replace("BK-", ""), 10),
    booking: bookingId,
    total_amount: booking.total_price,
    items: [
      { id: 1, item_type: "ROOM", description: `Room ${booking.room_details.room_number} — ${booking.room_details.room_type}`, amount: Number(booking.total_price) * 0.85 },
      { id: 2, item_type: "TAX", description: "GST 16%", amount: Number(booking.total_price) * 0.15 },
    ],
  }
}

// ─── Helper: simulate async delay ─────────────────────────────────────────────

export function demoDelay<T>(value: T, ms = 400): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms))
}

const rawClerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || ""
export const IS_DEMO_MODE =
  import.meta.env.VITE_DEMO_MODE === "true" ||
  !rawClerkKey ||
  !rawClerkKey.startsWith("pk_") ||
  rawClerkKey.includes("placeholder")
