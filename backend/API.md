# Sunrise Hotel Management System - API Documentation

This API documentation outlines all the REST endpoints provided by the Django REST Framework backend for the Sunrise Hotel Management System.

All request/response payloads use standard JSON formatting. Authenticated endpoints require a Bearer token in the `Authorization` header.

---

## Authentication & Authorization

Standard JWT (JSON Web Token) authentication is used. Pass the access token in HTTP header as:
`Authorization: Bearer <access_token>`

### 1. Obtain JWT Token (Login)
Retrieve a fresh access/refresh token pair.
* **Endpoint**: `/api/auth/token/`
* **Method**: `POST`
* **Request Payload**:
  ```json
  {
    "email": "receptionist@sunrise.com",
    "password": "receptionistpassword"
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "refresh": "eyJhbGciOiJIUzI1NiIsIn...",
    "access": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

### 2. Refresh JWT Token
Get a new access token using a valid refresh token.
* **Endpoint**: `/api/auth/token/refresh/`
* **Method**: `POST`
* **Request Payload**:
  ```json
  {
    "refresh": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```
* **Success Response (200 OK)**:
  ```json
  {
    "access": "eyJhbGciOiJIUzI1NiIsIn..."
  }
  ```

### 3. Get / Update User Profile
Retrieve or edit details of the currently authenticated staff member.
* **Endpoint**: `/api/auth/me/`
* **Method**: `GET`, `PUT`, `PATCH`
* **Success Response (200 OK)**:
  ```json
  {
    "id": "e4b52b2b-47e0-4a87-83eb-563b7e77a28e",
    "email": "receptionist@sunrise.com",
    "first_name": "Sarah",
    "last_name": "Receptionist",
    "role": "RECEPTIONIST",
    "is_active": true,
    "date_joined": "2026-07-14T02:18:32.481Z"
  }
  ```

### 4. Register New Staff (Admins Only)
Create new staff members.
* **Endpoint**: `/api/auth/register-staff/`
* **Method**: `POST`
* **Request Payload**:
  ```json
  {
    "email": "new.staff@sunrise.com",
    "password": "securepassword123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "RECEPTIONIST"
  }
  ```
* **Success Response (211 Created)**:
  ```json
  {
    "id": "c8d0e722-e421-49b0-bb2f-f463cbcd9101",
    "email": "new.staff@sunrise.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "RECEPTIONIST",
    "is_active": true,
    "date_joined": "2026-07-14T02:22:15Z"
  }
  ```

---

## Room Management

Endpoints for reading, adding, updating, and removing rooms.
* **Base Endpoint**: `/api/rooms/`
* **Permissions**: Authenticated staff (Admin/Receptionist).

### 1. List Rooms
* **Method**: `GET`
* **Query Parameters** (optional): `status` (AVAILABLE, OCCUPIED, MAINTENANCE), `room_type` (SINGLE, DOUBLE, SUITE, DELUXE), `floor`, `search` (searches room number).
* **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "room_number": "101",
      "room_type": "SINGLE",
      "floor": 1,
      "capacity": 1,
      "price_per_night": "80.00",
      "status": "AVAILABLE",
      "created_at": "2026-07-14T02:20:00Z",
      "updated_at": "2026-07-14T02:20:00Z"
    }
  ]
  ```

### 2. Create Room (Admin Recommended)
* **Method**: `POST`
* **Request Payload**:
  ```json
  {
    "room_number": "106",
    "room_type": "DOUBLE",
    "floor": 1,
    "capacity": 2,
    "price_per_night": "130.00",
    "status": "AVAILABLE"
  }
  ```

---

## Guest Management

Endpoints for managing guest database.
* **Base Endpoint**: `/api/guests/`
* **Permissions**: Authenticated staff (Admin/Receptionist).

### 1. List Guests
* **Method**: `GET`
* **Query Parameters** (optional): `search` (searches full name, phone number, CNIC/passport, or email).
* **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "full_name": "John Doe",
      "phone_number": "+15550199",
      "email": "john.doe@gmail.com",
      "document_number": "US-9823412",
      "address": "123 Elm St, NY"
    }
  ]
  ```

### 2. Create Guest
* **Method**: `POST`
* **Request Payload**:
  ```json
  {
    "full_name": "Alice Cooper",
    "phone_number": "+15559812",
    "email": "alice@cooper.net",
    "document_number": "US-449102",
    "address": "789 Pine Rd, Seattle"
  }
  ```

---

## Booking Management

Endpoints for booking rooms, verifying dates, checking in and checking out.
* **Base Endpoint**: `/api/bookings/`
* **Permissions**: Authenticated staff (Admin/Receptionist).

### 1. List Bookings
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  [
    {
      "booking_id": "890f9122-c31a-429a-ae18-c2b4c10a1122",
      "guest": 1,
      "guest_details": {
        "id": 1,
        "full_name": "John Doe",
        "phone_number": "+15550199"
      },
      "room": 3,
      "room_details": {
        "id": 3,
        "room_number": "103",
        "room_type": "DOUBLE",
        "price_per_night": "120.00"
      },
      "check_in": "2026-07-12",
      "check_out": "2026-07-16",
      "adults": 2,
      "children": 0,
      "total_price": "480.00",
      "status": "CHECKED_IN"
    }
  ]
  ```

### 2. Create Booking
* **Method**: `POST`
* **Request Payload**:
  ```json
  {
    "guest": 1,
    "room": 2,
    "check_in": "2026-07-15",
    "check_out": "2026-07-17",
    "adults": 1,
    "children": 0
  }
  ```
  *(Note: `total_price` is calculated automatically from room rate over dates, and check-in date rules/overlap checks are validated).*

### 3. Check-In Booking
* **Method**: `POST`
* **Endpoint**: `/api/bookings/<booking_id>/check-in/`
* **Action**: Sets booking status to `CHECKED_IN`, sets room status to `OCCUPIED`.
* **Response (200 OK)**: Returns the updated booking serializer payload.

### 4. Check-Out Booking
* **Method**: `POST`
* **Endpoint**: `/api/bookings/<booking_id>/check-out/`
* **Action**: Sets booking status to `CHECKED_OUT`, sets room status to `AVAILABLE`.
* **Response (200 OK)**: Returns the updated booking serializer payload.

### 5. Cancel Booking
* **Method**: `POST`
* **Endpoint**: `/api/bookings/<booking_id>/cancel/`
* **Action**: Sets booking status to `CANCELLED`. If booking was checked in, sets room status back to `AVAILABLE`.
* **Response (200 OK)**: Returns the updated booking serializer payload.

---

## Analytics & Reports

Dashboard metrics aggregation endpoints.
* **Permissions**: Authenticated staff (Admin/Receptionist).

### 1. Dashboard KPIs
Provides totals, occupancy rates, and today's statuses.
* **Endpoint**: `/api/reports/kpi/`
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  {
    "total_rooms": 11,
    "available_rooms": 8,
    "occupied_rooms": 2,
    "maintenance_rooms": 1,
    "today_bookings": 0,
    "today_check_ins": 0,
    "today_check_outs": 0,
    "total_guests": 5,
    "today_revenue": 0.0,
    "occupancy_rate": 18.18
  }
  ```

### 2. Analytics Trends (30 Days)
Occupancy trends and daily revenue stats.
* **Endpoint**: `/api/reports/trends/`
* **Method**: `GET`
* **Response (200 OK)**:
  ```json
  [
    {
      "date": "2026-06-14",
      "revenue": 0.0,
      "bookings": 0,
      "occupancy_rate": 40.0
    },
    {
      "date": "2026-06-15",
      "revenue": 480.0,
      "bookings": 1,
      "occupancy_rate": 55.0
    }
  ]
  ```
