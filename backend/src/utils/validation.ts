import { z } from 'zod';

export const createBookingSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  userName: z.string().min(1, 'User name is required'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
}).refine((data: { startTime: string; endTime: string }) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return start < end;
}, {
  message: 'Start time must be before end time',
  path: ['endTime'],
}).refine((data: { startTime: string; endTime: string }) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return hours <= 12;
}, {
  message: 'Booking duration cannot exceed 12 hours',
  path: ['endTime'],
});

export const analyticsQuerySchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
}).refine((data: { from: string; to: string }) => {
  const from = new Date(data.from);
  const to = new Date(data.to);
  return from <= to;
}, {
  message: 'From date must be before or equal to to date',
  path: ['to'],
});

