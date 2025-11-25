import { BookingModel, BookingCreateInput, BookingStatus, Booking } from '../models/Booking';
import { RoomModel } from '../models/Room';
import { calculatePrice } from '../utils/pricing';
import { v4 as uuidv4 } from 'uuid';

export class BookingService {
  static async createBooking(data: BookingCreateInput): Promise<{ booking: Booking | null; error?: string }> {
    const room = await RoomModel.findById(data.roomId);
    if (!room) {
      return { booking: null, error: 'Room not found' };
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    const conflicts = await BookingModel.findConflictingBookings(data.roomId, startTime, endTime);
    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      const conflictStart = new Date(conflict.startTime).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const conflictEnd = new Date(conflict.endTime).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return {
        booking: null,
        error: `Room already booked from ${conflictStart} to ${conflictEnd}`,
      };
    }

    const totalPrice = calculatePrice(room.baseHourlyRate, startTime, endTime);
    const bookingId = `b${uuidv4().split('-')[0]}`;

    const booking = await BookingModel.create({
      id: bookingId,
      ...data,
      startTime,
      endTime,
      totalPrice,
      status: 'CONFIRMED' as BookingStatus,
    });

    return { booking };
  }

  static async cancelBooking(id: string): Promise<{ booking: Booking | null; error?: string }> {
    const booking = await BookingModel.findById(id);
    if (!booking) {
      return { booking: null, error: 'Booking not found' };
    }

    if (booking.status === 'CANCELLED') {
      return { booking: null, error: 'Booking is already cancelled' };
    }

    const now = new Date();
    const startTime = new Date(booking.startTime);
    const hoursUntilStart = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilStart <= 2) {
      return {
        booking: null,
        error: 'Cancellation is only allowed more than 2 hours before the booking start time',
      };
    }

    const cancelledBooking = await BookingModel.cancel(id);
    return { booking: cancelledBooking };
  }

  static async updateBooking(
    id: string,
    data: Partial<{ userName: string; startTime: Date; endTime: Date }>
  ): Promise<{ booking: Booking | null; error?: string }> {
    const booking = await BookingModel.findById(id);
    if (!booking) {
      return { booking: null, error: 'Booking not found' };
    }

    if (booking.status === 'CANCELLED') {
      return { booking: null, error: 'Cannot update a cancelled booking' };
    }

    const updateData: Partial<{ userName: string; startTime: Date; endTime: Date; totalPrice: number }> = {};

    if (data.userName) {
      updateData.userName = data.userName;
    }

    if (data.startTime || data.endTime) {
      const startTime = data.startTime ? new Date(data.startTime) : new Date(booking.startTime);
      const endTime = data.endTime ? new Date(data.endTime) : new Date(booking.endTime);

      // Check for conflicts (excluding current booking)
      const conflicts = await BookingModel.findConflictingBookings(
        booking.roomId,
        startTime,
        endTime,
        id
      );

      if (conflicts.length > 0) {
        return { booking: null, error: 'Room is already booked for the selected time' };
      }

      updateData.startTime = startTime;
      updateData.endTime = endTime;

      // Recalculate price if time changed
      const room = await RoomModel.findById(booking.roomId);
      if (room) {
        updateData.totalPrice = calculatePrice(room.baseHourlyRate, startTime, endTime);
      }
    }

    const updatedBooking = await BookingModel.update(id, updateData);
    return { booking: updatedBooking };
  }
}

