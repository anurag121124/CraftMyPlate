import { Request, Response } from 'express';
import { BookingService } from '../services/bookingService';
import { BookingModel, BookingCreateInput } from '../models/Booking';
import { createBookingSchema, analyticsQuerySchema } from '../utils/validation';

export class BookingController {
  static async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = createBookingSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({ error: validationResult.error.errors[0].message });
        return;
      }

      const bookingData: BookingCreateInput = {
        roomId: validationResult.data.roomId,
        userName: validationResult.data.userName,
        startTime: new Date(validationResult.data.startTime),
        endTime: new Date(validationResult.data.endTime),
      };

      const result = await BookingService.createBooking(bookingData);
      if (result.error || !result.booking) {
        res.status(400).json({ error: result.error || 'Failed to create booking' });
        return;
      }

      res.status(201).json({
        bookingId: result.booking.id,
        roomId: result.booking.roomId,
        userName: result.booking.userName,
        totalPrice: result.booking.totalPrice,
        status: result.booking.status,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create booking' });
    }
  }

  static async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await BookingService.cancelBooking(id);
      if (result.error || !result.booking) {
        res.status(400).json({ error: result.error || 'Failed to cancel booking' });
        return;
      }
      res.json({ message: 'Booking cancelled successfully', booking: result.booking });
    } catch (error) {
      res.status(500).json({ error: 'Failed to cancel booking' });
    }
  }

  static async getAllBookings(req: Request, res: Response): Promise<void> {
    try {
      const bookings = await BookingModel.findAll();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  }
}

