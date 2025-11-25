"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const roomController_1 = require("../controllers/roomController");
const Room_1 = require("../models/Room");
jest.mock('../models/Room');
describe('RoomController', () => {
    let mockRequest;
    let mockResponse;
    let mockJson;
    let mockStatus;
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
            Room_1.RoomModel.findAll.mockResolvedValue(mockRooms);
            mockRequest = {};
            await roomController_1.RoomController.getAllRooms(mockRequest, mockResponse);
            expect(Room_1.RoomModel.findAll).toHaveBeenCalled();
            expect(mockJson).toHaveBeenCalledWith(mockRooms);
        });
        it('should return 500 on error', async () => {
            Room_1.RoomModel.findAll.mockRejectedValue(new Error('Database error'));
            mockRequest = {};
            await roomController_1.RoomController.getAllRooms(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to fetch rooms' });
        });
    });
});
