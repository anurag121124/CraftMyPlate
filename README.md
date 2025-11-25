# CraftMyPlate - Workspace Booking System

A full-stack workspace booking system that allows users to book meeting rooms by the hour with features like conflict prevention, dynamic pricing, cancellation policies, and admin analytics.

## Tech Stack

### Backend
- Node.js + TypeScript
- Express.js
- TypeORM
- PostgreSQL
- Zod (validation)

### Frontend
- React + TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Tailwind CSS
- React Hook Form
- shadcn/ui components

## Project Structure

```
CraftMyPlate/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── roomController.ts
│   │   │   ├── bookingController.ts
│   │   │   └── analyticsController.ts
│   │   ├── entities/
│   │   │   ├── Room.ts
│   │   │   └── Booking.ts
│   │   ├── models/
│   │   │   ├── Room.ts
│   │   │   └── Booking.ts
│   │   ├── routes/
│   │   │   ├── roomRoutes.ts
│   │   │   ├── bookingRoutes.ts
│   │   │   └── analyticsRoutes.ts
│   │   ├── services/
│   │   │   └── bookingService.ts
│   │   ├── utils/
│   │   │   ├── pricing.ts
│   │   │   └── validation.ts
│   │   ├── database/
│   │   │   ├── schema.sql
│   │   │   └── migrate.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── actions/
│   │   │   ├── roomActions.ts
│   │   │   ├── bookingActions.ts
│   │   │   └── analyticsActions.ts
│   │   ├── components/
│   │   │   └── ui/
│   │   ├── config/
│   │   │   └── api-url.ts
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── RoomsPage.tsx
│   │   │   ├── BookingPage.tsx
│   │   │   └── AdminPage.tsx
│   │   ├── store/
│   │   │   └── useStore.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   └── request.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── ARCHITECTURE.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=3000
DATABASE_URL=postgresql://username:password@localhost:5432/workspace_booking
NODE_ENV=development
```

4. Create the PostgreSQL database:
```bash
createdb workspace_booking
```

5. Run migrations to create tables and seed data:
```bash
npm run migrate
```

6. Start the development server:
```bash
npm run dev
```

The backend will be running on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:3000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be running on `http://localhost:5173`

## API Endpoints

### Rooms
- `GET /api/rooms` - Get all available rooms

### Bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings/:id/cancel` - Cancel a booking

### Analytics
- `GET /api/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD` - Get analytics for date range

## API Examples

### Create Booking
```bash
POST /api/bookings
Content-Type: application/json

{
  "roomId": "101",
  "userName": "Priya",
  "startTime": "2025-11-20T10:00:00.000Z",
  "endTime": "2025-11-20T12:30:00.000Z"
}
```

Response:
```json
{
  "bookingId": "b123",
  "roomId": "101",
  "userName": "Priya",
  "totalPrice": 975,
  "status": "CONFIRMED"
}
```

### Get Analytics
```bash
GET /api/analytics?from=2025-11-01&to=2025-11-30
```

Response:
```json
[
  {
    "roomId": "101",
    "roomName": "Cabin 1",
    "totalHours": 15.5,
    "totalRevenue": 5250
  }
]
```

## Features

### Booking System
- **Conflict Prevention**: Prevents overlapping bookings for the same room
- **Dynamic Pricing**: 
  - Peak hours (10 AM-1 PM, 4 PM-7 PM, Mon-Fri): 1.5× base rate
  - Off-peak: Base rate
- **Duration Limit**: Maximum 12 hours per booking
- **Cancellation Policy**: Cancellation allowed only if > 2 hours before start time

### Admin Features
- View all bookings
- Cancel bookings
- Analytics dashboard with revenue and utilization metrics

## Deployment

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables:
   - `DATABASE_URL`
   - `NODE_ENV=production`
   - `PORT` (usually auto-assigned)
3. Build command: `pnpm build`
4. Pre-Deploy command: `pnpm migrate` (runs database migrations)
5. Start command: `pnpm start`

### Frontend (Netlify/Vercel)
1. Connect your GitHub repository
2. Set environment variables:
   - `VITE_API_BASE_URL` (your backend URL)
3. Build command: `npm run build`
4. Publish directory: `dist`

## Timezone
All times are handled in Asia/Kolkata (IST) timezone.

## License
ISC

