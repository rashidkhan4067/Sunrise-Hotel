# Product Requirements Document (PRD)

# Hotel Management System (MVP)

---

## Document Information

| Field | Value |
|--------|-------|
| Project Name | Hotel Management System |
| Version | 1.0 |
| Document Type | Product Requirements Document (PRD) |
| Project Type | Full Stack Web Application |
| Status | Planning |
| Frontend | React + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Django REST Framework |
| Database | PostgreSQL |

---

# 1. Project Overview

## Purpose

The Hotel Management System is a modern web application designed to streamline hotel operations by managing rooms, guests, and bookings from a centralized dashboard.

The system replaces manual record-keeping with an efficient digital workflow, helping hotel staff improve productivity and customer experience.

---

# 2. Problem Statement

The hotel currently manages operations using:

- Paper registers
- Phone calls
- Excel sheets

This creates several problems:

- Double room bookings
- Manual check-in/check-out process
- Difficult guest management
- No real-time room availability
- Time-consuming reporting
- Poor operational visibility

---

# 3. Project Goal

Develop a modern Hotel Management System that enables hotel staff to:

- Manage hotel rooms
- Manage guests
- Create bookings
- Track room availability
- Monitor hotel performance
- Generate operational reports

---

# 4. Objectives

- Simplify booking management
- Improve guest record management
- Reduce booking conflicts
- Track room occupancy
- Improve administrative efficiency
- Provide business insights through dashboards

---

# 5. Target Users

## Admin

Responsible for:

- Managing rooms
- Managing guests
- Managing bookings
- Viewing reports
- Managing users
- Updating settings

---

## Receptionist

Responsible for:

- Creating bookings
- Checking guests in
- Checking guests out
- Managing guest information
- Viewing room availability

---

# 6. Scope

## Included

- Authentication
- Dashboard
- Room Management
- Guest Management
- Booking Management
- Reports
- Settings

## Excluded (Future Version)

- Online payments
- Multi-hotel support
- Email notifications
- SMS notifications
- Housekeeping module
- Restaurant module
- Inventory module

---

# 7. User Roles

## Admin

Permissions

- Full system access
- Manage rooms
- Manage guests
- Manage bookings
- View reports
- Configure settings

---

## Receptionist

Permissions

- View dashboard
- Manage bookings
- Manage guests
- Check-in
- Check-out

---

# 8. Functional Requirements

## Authentication

### Features

- Login
- Logout
- Change Password
- Protected Routes
- Role-Based Authorization

---

## Dashboard

Display:

- Total Rooms
- Available Rooms
- Occupied Rooms
- Today's Bookings
- Today's Check-ins
- Today's Check-outs
- Total Guests

Quick Actions:

- Add Room
- Add Guest
- Create Booking

---

## Room Management

### Features

- View Rooms
- Add Room
- Edit Room
- Delete Room
- Search Rooms
- Filter Rooms

### Room Information

- Room Number
- Room Type
- Floor
- Capacity
- Price Per Night
- Status

### Room Status

- Available
- Occupied
- Maintenance

---

## Guest Management

### Features

- View Guests
- Add Guest
- Edit Guest
- Delete Guest
- Search Guests

### Guest Information

- Full Name
- Phone Number
- Email
- CNIC / Passport
- Address

---

## Booking Management

### Features

- Create Booking
- Edit Booking
- Cancel Booking
- Check-In
- Check-Out
- View Booking History

### Booking Information

- Booking ID
- Guest
- Room
- Check-In Date
- Check-Out Date
- Adults
- Children
- Total Price
- Booking Status

### Booking Status

- Pending
- Confirmed
- Checked In
- Checked Out
- Cancelled

### Business Rules

- Prevent double booking.
- Room must be available before booking.
- Booking dates must be valid.
- Check-out date must be after check-in date.

---

## Reports

Generate reports for:

- Room Occupancy
- Daily Bookings
- Revenue Overview
- Guest Statistics

---

## Settings

Manage:

- Hotel Information
- User Profile
- Password
- System Preferences

---

# 9. Dashboard KPIs

- Total Rooms
- Available Rooms
- Occupied Rooms
- Total Guests
- Today's Bookings
- Today's Revenue

---

# 10. Non-Functional Requirements

## Performance

- Fast page loading
- Optimized API requests

## Security

- JWT Authentication
- Password hashing
- Role-based permissions
- Protected APIs

## Usability

- Responsive design
- Minimal interface
- Easy navigation

## Reliability

- Form validation
- Error handling
- Loading states
- Empty states

---

# 11. Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Router
- React Hook Form
- Zod

---

## Backend

- Django
- Django REST Framework
- PostgreSQL

---

# 12. Database Entities

- Users
- Rooms
- Guests
- Bookings

---

# 13. Success Criteria

The project is considered successful when:

- Users can securely log in.
- Rooms can be managed.
- Guests can be managed.
- Bookings can be created without conflicts.
- Check-in and check-out workflows function correctly.
- Dashboard displays accurate statistics.
- Reports generate correct information.
- Application is responsive across desktop and mobile devices.

---

# 14. Milestones

## Milestone 1
Project Setup & Authentication

---

## Milestone 2
Dashboard

---

## Milestone 3
Room Management

---

## Milestone 4
Guest Management

---

## Milestone 5
Booking Management

---

## Milestone 6
Reports

---

## Milestone 7
Settings

---

## Milestone 8
Testing & Deployment

---

# 15. Future Enhancements

- Multi-Hotel Support
- Online Payments
- Email Notifications
- SMS Notifications
- Housekeeping Management
- Restaurant Management
- Inventory Management
- Customer Portal
- Analytics Dashboard
- Mobile Application

---

# 16. Conclusion

The Hotel Management System MVP focuses on delivering the essential functionality required for managing hotel operations efficiently. It provides a scalable foundation that can be extended with additional hospitality modules in future releases while maintaining a clean architecture and modern user experience.