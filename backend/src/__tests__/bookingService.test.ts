import { BookingService } from '../services/bookingService';
import { BookingModel } from '../models/Booking';
import { RoomModel } from '../models/Room';
import { calculatePrice } from '../utils/pricing';

jest.mock('../models/Booking');
jest.mock('../models/Room');
jest.mock('../utils/pricing');

describe('BookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const mockRoom = {
        id: 'room-1',
        name: 'Conference Room A',
        baseHourlyRate: 100,
        capacity: 10,
      };

      const mockBooking = {
        id: 'b123',
        roomId: 'room-1',
        userName: 'John Doe',
        startTime: new Date('2024-12-31T10:00:00Z'),
        endTime: new Date('2024-12-31T12:00:00Z'),
        totalPrice: 200,
        status: 'CONFIRMED' as const,
      };

      (RoomModel.findById as jest.Mock).mockResolvedValue(mockRoom);
      (BookingModel.findConflictingBookings as jest.Mock).mockResolvedValue([]);
      (calculatePrice as jest.Mock).mockReturnValue(200);
      (BookingModel.create as jest.Mock).mockResolvedValue(mockBooking);

      const result = await BookingService.createBooking({
        roomId: 'room-1',
        userName: 'John Doe',
        startTime: new Date('2024-12-31T10:00:00Z'),
        endTime: new Date('2024-12-31T12:00:00Z'),
      });

      expect(result.booking).toEqual(mockBooking);
      expect(result.error).toBeUndefined();
      expect(RoomModel.findById).toHaveBeenCalledWith('room-1');
      expect(BookingModel.findConflictingBookings).toHaveBeenCalled();
      expect(BookingModel.create).toHaveBeenCalled();
    });

    it('should return error when room not found', async () => {
      (RoomModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await BookingService.createBooking({
        roomId: 'invalid-room',
        userName: 'John Doe',
        startTime: new Date('2024-12-31T10:00:00Z'),
        endTime: new Date('2024-12-31T12:00:00Z'),
      });

      expect(result.booking).toBeNull();
      expect(result.error).toBe('Room not found');
    });

    it('should return error when there is a booking conflict', async () => {
      const mockRoom = {
        id: 'room-1',
        name: 'Conference Room A',
        baseHourlyRate: 100,
        capacity: 10,
      };

      const conflictingBooking = {
        id: 'b456',
        roomId: 'room-1',
        startTime: new Date('2024-12-31T11:00:00Z'),
        endTime: new Date('2024-12-31T13:00:00Z'),
      };

      (RoomModel.findById as jest.Mock).mockResolvedValue(mockRoom);
      (BookingModel.findConflictingBookings as jest.Mock).mockResolvedValue([
        conflictingBooking,
      ]);

      const result = await BookingService.createBooking({
        roomId: 'room-1',
        userName: 'John Doe',
        startTime: new Date('2024-12-31T10:00:00Z'),
        endTime: new Date('2024-12-31T12:00:00Z'),
      });

      expect(result.booking).toBeNull();
      expect(result.error).toContain('Room already booked');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking successfully', async () => {
      const mockBooking = {
        id: 'b123',
        roomId: 'room-1',
        userName: 'John Doe',
        startTime: new Date('2025-01-01T10:00:00Z'), // Future date
        endTime: new Date('2025-01-01T12:00:00Z'),
        totalPrice: 200,
        status: 'CONFIRMED' as const,
      };

      const cancelledBooking = {
        ...mockBooking,
        status: 'CANCELLED' as const,
      };

      (BookingModel.findById as jest.Mock).mockResolvedValue(mockBooking);
      (BookingModel.cancel as jest.Mock).mockResolvedValue(cancelledBooking);

      // Mock Date.now to return a time before the booking
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-12-31T00:00:00Z').getTime());

      const result = await BookingService.cancelBooking('b123');

      expect(result.booking).toEqual(cancelledBooking);
      expect(result.error).toBeUndefined();
      expect(BookingModel.findById).toHaveBeenCalledWith('b123');
      expect(BookingModel.cancel).toHaveBeenCalledWith('b123');

      jest.restoreAllMocks();
    });

    it('should return error when booking not found', async () => {
      (BookingModel.findById as jest.Mock).mockResolvedValue(null);

      const result = await BookingService.cancelBooking('invalid-id');

      expect(result.booking).toBeNull();
      expect(result.error).toBe('Booking not found');
    });

    it('should return error when booking is already cancelled', async () => {
      const mockBooking = {
        id: 'b123',
        status: 'CANCELLED' as const,
      };

      (BookingModel.findById as jest.Mock).mockResolvedValue(mockBooking);

      const result = await BookingService.cancelBooking('b123');

      expect(result.booking).toBeNull();
      expect(result.error).toBe('Booking is already cancelled');
    });

    it('should return error when cancellation is too close to start time', async () => {
      const mockBooking = {
        id: 'b123',
        startTime: new Date('2024-12-31T10:00:00Z'),
        status: 'CONFIRMED' as const,
      };

      (BookingModel.findById as jest.Mock).mockResolvedValue(mockBooking);

      // Mock Date.now to return a time less than 2 hours before booking
      jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-12-31T09:30:00Z').getTime());

      const result = await BookingService.cancelBooking('b123');

      expect(result.booking).toBeNull();
      expect(result.error).toContain('Cancellation is only allowed more than 2 hours');

      jest.restoreAllMocks();
    });
  });
});

