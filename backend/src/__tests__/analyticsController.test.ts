import { Request, Response } from 'express';
import { AnalyticsController } from '../controllers/analyticsController';
import { BookingModel } from '../models/Booking';

jest.mock('../models/Booking');

describe('AnalyticsController', () => {
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

  describe('getAnalytics', () => {
    it('should return analytics data', async () => {
      const mockAnalytics = [
        {
          roomId: 'room-1',
          roomName: 'Conference Room A',
          totalHours: '10.5',
          totalRevenue: '1050.00',
        },
      ];

      (BookingModel.getAnalytics as jest.Mock).mockResolvedValue(mockAnalytics);

      mockRequest = {
        query: {
          from: '2024-01-01',
          to: '2024-01-31',
        },
      };

      await AnalyticsController.getAnalytics(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(BookingModel.getAnalytics).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith([
        {
          roomId: 'room-1',
          roomName: 'Conference Room A',
          totalHours: 10.5,
          totalRevenue: 1050.0,
        },
      ]);
    });

    it('should return 400 for invalid date range', async () => {
      mockRequest = {
        query: {
          from: 'invalid-date',
          to: '2024-01-31',
        },
      };

      await AnalyticsController.getAnalytics(
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

    it('should return 500 on error', async () => {
      (RoomModel.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      mockRequest = {
        query: {
          from: '2024-01-01',
          to: '2024-01-31',
        },
      };

      await AnalyticsController.getAnalytics(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to fetch analytics' });
    });
  });
});

