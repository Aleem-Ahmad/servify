# Servify MVP - Setup Instructions 🚀

Welcome to the **Servify** pilot/MVP version. This platform is built for speed, scalability, and a premium user experience.

## 🛠️ Tech Stack
- **Next.js 16** (App Router + Turbopack)
- **JavaScript (ES6+)**
- **MongoDB** (via Mongoose)
- **Tailwind CSS** for premium styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Resend** for email OTPs
- **Cloudinary** for image storage

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have Node.js 18+ and a MongoDB instance (Local or Atlas) ready.

### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in your credentials:
```bash
cp .env.example .env.local
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Seeding Data (Optional)
To populate the database with dummy providers and services for testing:
```bash
npm run seed
```

## 📂 Project Structure
- `src/app`: App router pages and API routes.
- `src/components`: UI components (Shared, Public, Protected).
- `src/lib/actions`: Server actions for database operations.
- `src/models`: Mongoose schemas.
- `src/context`: React Context for Auth, Theme, and Language.

## 📍 Key Features in MVP
- [x] Multi-step Provider Onboarding
- [x] OTP-based Authentication (Resend)
- [x] Cloudinary Image Uploads
- [x] Admin Dashboard with Stats
- [x] Server Actions for Bookings
- [x] Bilingual Support (EN/UR)
- [x] Premium Glassmorphism UI

---
Built with ❤️ for the Servify Final Year Project.
