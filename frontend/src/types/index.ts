export interface Room {
  id: string;
  name: string;
  baseHourlyRate: number;
  capacity: number;
  createdAt?: string;
}

export type BookingStatus = 'CONFIRMED' | 'CANCELLED';

export interface Booking {
  id: string;
  roomId: string;
  userName: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBookingRequest {
  roomId: string;
  userName: string;
  startTime: string;
  endTime: string;
}

export interface CreateBookingResponse {
  bookingId: string;
  roomId: string;
  userName: string;
  totalPrice: number;
  status: BookingStatus;
}

export interface AnalyticsItem {
  roomId: string;
  roomName: string;
  totalHours: number;
  totalRevenue: number;
}

export interface AnalyticsQuery {
  from: string;
  to: string;
}

