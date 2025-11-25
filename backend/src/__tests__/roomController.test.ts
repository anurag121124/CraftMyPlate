import { Request, Response } from 'express';
import { RoomController } from '../controllers/roomController';
import { RoomModel } from '../models/Room';

jest.mock('../models/Room');

describe('RoomController', () => {
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

  describe('getAllRooms', () => {
    it('should return all rooms', async () => {
      const mockRooms = [
        {
          id: 'room-1',
          name: 'Conference Room A',
          baseHourlyRate: 100,
          capacity: 10,
        },
        {
          id: 'room-2',
          name: 'Workspace B',
          baseHourlyRate: 150,
          capacity: 5,
        },
      ];

      (RoomModel.findAll as jest.Mock).mockResolvedValue(mockRooms);

      mockRequest = {};

      await RoomController.getAllRooms(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(RoomModel.findAll).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith(mockRooms);
    });

    it('should return 500 on error', async () => {
      (RoomModel.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      mockRequest = {};

      await RoomController.getAllRooms(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to fetch rooms' });
    });
  });
});

