# Architecture Documentation

## System Overview

CraftMyPlate is a workspace booking system built with a clean, modular architecture following separation of concerns principles. The system is divided into backend (Node.js/Express/TypeORM) and frontend (React/Vite) layers.

## Data Model

### Room Entity
```typescript
{
  id: string (Primary Key)
  name: string
  baseHourlyRate: number (decimal)
  capacity: number
  createdAt: timestamp
}
```

### Booking Entity
```typescript
{
  id: string (Primary Key)
  roomId: string (Foreign Key -> Room.id)
  userName: string
  startTime: timestamp
  endTime: timestamp
  totalPrice: number (decimal)
  status: 'CONFIRMED' | 'CANCELLED'
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Database Schema
- **rooms** table with indexes on `id`
- **bookings** table with indexes on `roomId`, `startTime`, `endTime`, and `status`
- Foreign key constraint: `bookings.room_id` references `rooms.id` with CASCADE delete

## Backend Architecture

### Layer Structure

```
Routes → Controllers → Services → Models → Entities (TypeORM)
```

1. **Routes Layer** (`src/routes/`)
   - Defines HTTP endpoints
   - Maps URLs to controller methods
   - Minimal logic, pure routing

2. **Controllers Layer** (`src/controllers/`)
   - Handles HTTP request/response
   - Input validation using Zod schemas
   - Error handling and status codes
   - Calls service layer

3. **Services Layer** (`src/services/`)
   - Business logic implementation
   - Conflict detection
   - Price calculation orchestration
   - Transaction management

4. **Models Layer** (`src/models/`)
   - Data access abstraction
   - TypeORM repository wrappers
   - Query building
   - Data transformation

5. **Entities Layer** (`src/entities/`)
   - TypeORM entity definitions
   - Database schema mapping
   - Relationships (OneToMany, ManyToOne)

### Conflict Detection Logic

The system prevents overlapping bookings using a time-range overlap algorithm:

```typescript
// Two time ranges overlap if:
// range1.start < range2.end AND range1.end > range2.start

// For booking conflict:
// newBooking.startTime < existingBooking.endTime AND
// newBooking.endTime > existingBooking.startTime
```

**Implementation**: `BookingModel.findConflictingBookings()` uses TypeORM QueryBuilder to find confirmed bookings that overlap with the requested time range.

**Edge Cases Handled**:
- End time equals start time of next booking (allowed, not a conflict)
- Only checks CONFIRMED bookings (cancelled bookings don't block)
- Timezone-aware comparisons using PostgreSQL timestamp types

### Dynamic Pricing Algorithm

**Peak Hours Definition**:
- Monday to Friday (dayOfWeek 1-5)
- 10:00 AM - 1:00 PM (10:00-13:00)
- 4:00 PM - 7:00 PM (16:00-19:00)

**Calculation Method**:
1. Iterate through each hour slot in the booking duration
2. Check if the hour falls in peak time and weekday
3. Apply multiplier: `peakRate = baseRate × 1.5`
4. Calculate price for partial hours proportionally
5. Sum all hour slots

**Implementation**: `utils/pricing.ts` - `calculatePrice()` function

**Example**:
- Base rate: ₹500/hour
- Booking: 10:00 AM - 12:00 PM (2 hours) on Monday
- Hour 1 (10-11 AM): Peak → ₹500 × 1.5 = ₹750
- Hour 2 (11 AM-12 PM): Peak → ₹500 × 1.5 = ₹750
- Total: ₹1,500

### Cancellation Policy

**Rule**: Cancellation allowed only if more than 2 hours before booking start time.

**Implementation**:
```typescript
const hoursUntilStart = (startTime - currentTime) / (1000 * 60 * 60);
if (hoursUntilStart <= 2) {
  return error;
}
```

**Business Logic**:
- Prevents last-minute cancellations
- Allows sufficient time for re-booking
- Updates booking status to 'CANCELLED'
- Cancelled bookings excluded from analytics

### Analytics Query

**Data Aggregation**:
- Groups by room
- Filters by date range
- Only includes CONFIRMED bookings
- Calculates:
  - Total hours: `SUM(EXTRACT(EPOCH FROM (end_time - start_time)) / 3600)`
  - Total revenue: `SUM(total_price)`

**Implementation**: `BookingModel.getAnalytics()` uses TypeORM QueryBuilder with LEFT JOIN to include rooms with zero bookings.

## Frontend Architecture

### Component Structure

```
App (Router)
├── RoomsPage
├── BookingPage
└── AdminPage
```

### State Management

1. **TanStack Query** (React Query)
   - Server state management
   - Caching and refetching
   - Optimistic updates

2. **Zustand**
   - Client-side global state
   - Room and booking lists
   - Lightweight store

### API Integration Pattern

```
Component → Actions → Request Utility → API
```

1. **API URL Config** (`config/api-url.ts`)
   - Centralized endpoint definitions
   - Environment-based base URL

2. **Request Utility** (`utils/request.ts`)
   - Axios instance with interceptors
   - Default headers
   - Error handling

3. **Actions** (`actions/*.ts`)
   - Business logic for API calls
   - Type-safe request/response
   - Imported by components

### Form Handling

- **React Hook Form** for form state
- **Zod** for client-side validation
- Schema matching backend validation
- Real-time error display

## Error Handling

### Backend
- Validation errors: 400 Bad Request with message
- Not found: 404 with descriptive message
- Server errors: 500 with generic message (no stack traces in production)
- Conflict errors: 400 with specific time range

### Frontend
- API errors displayed in UI
- Network errors handled gracefully
- Form validation errors inline
- Loading states for async operations

## Security Considerations

1. **Input Validation**: Zod schemas on both client and server
2. **SQL Injection**: TypeORM parameterized queries
3. **CORS**: Configured for frontend origin
4. **Environment Variables**: Sensitive config in `.env`

## Scalability Considerations

### Database
- Indexes on frequently queried columns
- Foreign key constraints for data integrity
- Connection pooling via TypeORM DataSource

### Backend
- Stateless API design (scales horizontally)
- Service layer separation (easy to add caching)
- Repository pattern (easy to swap data sources)

### Frontend
- Code splitting (Vite automatic)
- Query caching (TanStack Query)
- Optimistic updates for better UX

### Potential Improvements
1. **Caching**: Redis for frequently accessed rooms/bookings
2. **Queue System**: Bull/BullMQ for async booking processing
3. **Rate Limiting**: Express-rate-limit for API protection
4. **Database Replication**: Read replicas for analytics queries
5. **CDN**: Static assets for frontend
6. **Monitoring**: APM tools (New Relic, Datadog)
7. **Logging**: Structured logging (Winston, Pino)

## AI Usage Notes

This project was developed with assistance from AI tools (Cursor, ChatGPT) for:
- Initial project structure setup
- TypeORM entity definitions
- React component scaffolding
- Tailwind CSS configuration

**Human Contributions**:
- Business logic implementation (pricing, conflict detection)
- Architecture decisions and layer separation
- Error handling strategies
- Code review and refactoring for clarity
- Documentation writing

The codebase was reviewed and refactored to ensure:
- Clean, readable code
- Proper separation of concerns
- Meaningful variable names
- Production-ready quality (no console.logs, no commented code)

## Testing Strategy (Future)

1. **Unit Tests**: Jest for services and utilities
2. **Integration Tests**: Supertest for API endpoints
3. **E2E Tests**: Playwright for critical user flows
4. **Database Tests**: Test containers for isolated DB tests

## Deployment Architecture

```
Frontend (Netlify/Vercel)
    ↓ HTTPS
Backend API (Render/Railway)
    ↓ Connection Pool
PostgreSQL Database
```

**Environment Variables**:
- Backend: `DATABASE_URL`, `NODE_ENV`, `PORT`
- Frontend: `VITE_API_BASE_URL`

## Performance Optimizations

1. **Database Queries**: Indexed columns for fast lookups
2. **Frontend**: React Query caching reduces API calls
3. **Bundle Size**: Tree-shaking with Vite
4. **Images**: Optimized assets (if added)

## Future Enhancements

1. User authentication and authorization
2. Email notifications for bookings
3. Calendar view for room availability
4. Recurring bookings
5. Waitlist for fully booked rooms
6. Mobile app (React Native)
7. Real-time updates (WebSockets)
8. Advanced analytics (charts, trends)

