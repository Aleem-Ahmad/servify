# Servify Full-Stack Backend Implementation Plan

This document outlines the plan to convert the "Servify" frontend-only application into a complete full-stack application with a persistent database, secure authentication, and robust API logic.

## 🏗️ Technology Stack
- **Framework**: Next.js (App Router)
- **Database**: SQLite (Zero-config, single-file database for easy portability)
- **ORM**: Prisma (Type-safe database client)
- **Auth**: JWT-based authentication (simulating NextAuth for simplicity and speed)
- **Encryption**: `bcryptjs` for secure password hashing.

## 🗄️ Database Schema (Prisma)

### Models
1.  **User**: Core identity (Customer, Provider, Admin).
2.  **ProviderDetail**: Extended profile for service providers (Experience, Category, Verification Status).
3.  **Service**: Categorized service list.
4.  **Booking**: Transactions between Customers and Providers.
5.  **Complaint**: Issue tracking system.
6.  **Review**: Feedback and rating system.

## 📂 Folder Structure Update
```text
src/
├── app/
│   └── api/             # API Route Handlers
├── lib/
│   ├── prisma.js        # Prisma Client initialization
│   ├── auth-utils.js    # JWT & Password utility functions
│   └── data/            # (Optional) Seed data
├── prisma/
│   ├── schema.prisma    # DB Schema definition
│   └── dev.db           # SQLite Database file
```

## 🔐 Authentication Flow
- **Registration**: Validate input -> Hash password -> Store in DB.
- **Login**: Check email -> Compare hashes -> Generate Token -> Set Cookie.
- **Middleware**: Verify token on protected paths.

## 🚀 API Endpoints Polish
- All endpoints will be updated to interact with the database instead of returning mock JSON.
- Input validation on all POST/PUT requests.

## 📅 Timeline
1.  **Phase 1**: Environment setup (Prisma & SQLite).
2.  **Phase 2**: Database schema implementation & seeding.
3.  **Phase 3**: Authentication logic (Login/Signup/Profile).
4.  **Phase 4**: Core Business Logic (Bookings & Complaints).
5.  **Phase 5**: Integration with existing UI components.
