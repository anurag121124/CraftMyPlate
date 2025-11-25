"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const analyticsController_1 = require("../controllers/analyticsController");
const Booking_1 = require("../models/Booking");
jest.mock('../models/Booking');
describe('AnalyticsController', () => {
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
            Booking_1.BookingModel.getAnalytics.mockResolvedValue(mockAnalytics);
            mockRequest = {
                query: {
                    from: '2024-01-01',
                    to: '2024-01-31',
                },
            };
            await analyticsController_1.AnalyticsController.getAnalytics(mockRequest, mockResponse);
            expect(Booking_1.BookingModel.getAnalytics).toHaveBeenCalled();
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
            await analyticsController_1.AnalyticsController.getAnalytics(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.any(String),
            }));
        });
        it('should return 500 on error', async () => {
            RoomModel.findAll.mockRejectedValue(new Error('Database error'));
            mockRequest = {
                query: {
                    from: '2024-01-01',
                    to: '2024-01-31',
                },
            };
            await analyticsController_1.AnalyticsController.getAnalytics(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to fetch analytics' });
        });
    });
});
