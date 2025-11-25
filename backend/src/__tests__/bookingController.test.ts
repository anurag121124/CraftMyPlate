import { Request, Response } from 'express';
import { BookingController } from '../controllers/bookingController';
import { BookingService } from '../services/bookingService';
import { BookingModel } from '../models/Booking';

jest.mock('../services/bookingService');
jest.mock('../models/Booking');

describe('BookingController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const mockBooking = {
        id: 'b123',
        roomId: 'room-1',
        userName: 'John Doe',
        startTime: new Date('2024-01-01T10:00:00Z'),
        endTime: new Date('2024-01-01T12:00:00Z'),
        totalPrice: 200,
        status: 'CONFIRMED' as const,
      };

      (BookingService.createBooking as jest.Mock).mockResolvedValue({
        booking: mockBooking,
      });

      mockRequest = {
        body: {
          roomId: 'room-1',
          userName: 'John Doe',
          startTime: '2024-01-01T10:00:00Z',
          endTime: '2024-01-01T12:00:00Z',
        },
      };

      await BookingController.createBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(BookingService.createBooking).toHaveBeenCalled();
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        bookingId: mockBooking.id,
        roomId: mockBooking.roomId,
        userName: mockBooking.userName,
        totalPrice: mockBooking.totalPrice,
        status: mockBooking.status,
      });
    });

    it('should return 400 for invalid input', async () => {
      mockRequest = {
        body: {
          roomId: '',
          userName: 'John Doe',
        },
      };

      await BookingController.createBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
    });

    it('should return 400 when booking service returns error', async () => {
      (BookingService.createBooking as jest.Mock).mockResolvedValue({
        booking: null,
        error: 'Room not found',
      });

      mockRequest = {
        body: {
          roomId: 'invalid-room',
          userName: 'John Doe',
          startTime: '2024-01-01T10:00:00Z',
          endTime: '2024-01-01T12:00:00Z',
        },
      };

      await BookingController.createBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Room not found' });
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking successfully', async () => {
      const mockBooking = {
        id: 'b123',
        roomId: 'room-1',
        userName: 'John Doe',
        startTime: new Date('2024-12-31T10:00:00Z'),
        endTime: new Date('2024-12-31T12:00:00Z'),
        totalPrice: 200,
        status: 'CANCELLED' as const,
      };

      (BookingService.cancelBooking as jest.Mock).mockResolvedValue({
        booking: mockBooking,
      });

      mockRequest = {
        params: { id: 'b123' },
      };

      await BookingController.cancelBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(BookingService.cancelBooking).toHaveBeenCalledWith('b123');
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Booking cancelled successfully',
        booking: mockBooking,
      });
    });

    it('should return 400 when booking not found', async () => {
      (BookingService.cancelBooking as jest.Mock).mockResolvedValue({
        booking: null,
        error: 'Booking not found',
      });

      mockRequest = {
        params: { id: 'invalid-id' },
      };

      await BookingController.cancelBooking(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Booking not found' });
    });
  });

  describe('getAllBookings', () => {
    it('should return all bookings', async () => {
      const mockBookings = [
        {
          id: 'b123',
          roomId: 'room-1',
          userName: 'John Doe',
          startTime: new Date('2024-01-01T10:00:00Z'),
          endTime: new Date('2024-01-01T12:00:00Z'),
          totalPrice: 200,
          status: 'CONFIRMED' as const,
        },
      ];

      (BookingModel.findAll as jest.Mock).mockResolvedValue(mockBookings);

      mockRequest = {};

      await BookingController.getAllBookings(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(BookingModel.findAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockBookings);
    });

    it('should return 500 on error', async () => {
      (BookingModel.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      mockRequest = {};

      await BookingController.getAllBookings(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to fetch bookings' });
    });
  });
});

