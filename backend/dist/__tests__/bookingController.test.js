"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bookingController_1 = require("../controllers/bookingController");
const bookingService_1 = require("../services/bookingService");
const Booking_1 = require("../models/Booking");
jest.mock('../services/bookingService');
jest.mock('../models/Booking');
describe('BookingController', () => {
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
    describe('createBooking', () => {
        it('should create a booking successfully', async () => {
            const mockBooking = {
                id: 'b123',
                roomId: 'room-1',
                userName: 'John Doe',
                startTime: new Date('2024-01-01T10:00:00Z'),
                endTime: new Date('2024-01-01T12:00:00Z'),
                totalPrice: 200,
                status: 'CONFIRMED',
            };
            bookingService_1.BookingService.createBooking.mockResolvedValue({
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
            await bookingController_1.BookingController.createBooking(mockRequest, mockResponse);
            expect(bookingService_1.BookingService.createBooking).toHaveBeenCalled();
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
            await bookingController_1.BookingController.createBooking(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.any(String),
            }));
        });
        it('should return 400 when booking service returns error', async () => {
            bookingService_1.BookingService.createBooking.mockResolvedValue({
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
            await bookingController_1.BookingController.createBooking(mockRequest, mockResponse);
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
                status: 'CANCELLED',
            };
            bookingService_1.BookingService.cancelBooking.mockResolvedValue({
                booking: mockBooking,
            });
            mockRequest = {
                params: { id: 'b123' },
            };
            await bookingController_1.BookingController.cancelBooking(mockRequest, mockResponse);
            expect(bookingService_1.BookingService.cancelBooking).toHaveBeenCalledWith('b123');
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Booking cancelled successfully',
                booking: mockBooking,
            });
        });
        it('should return 400 when booking not found', async () => {
            bookingService_1.BookingService.cancelBooking.mockResolvedValue({
                booking: null,
                error: 'Booking not found',
            });
            mockRequest = {
                params: { id: 'invalid-id' },
            };
            await bookingController_1.BookingController.cancelBooking(mockRequest, mockResponse);
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
                    status: 'CONFIRMED',
                },
            ];
            Booking_1.BookingModel.findAll.mockResolvedValue(mockBookings);
            mockRequest = {};
            await bookingController_1.BookingController.getAllBookings(mockRequest, mockResponse);
            expect(Booking_1.BookingModel.findAll).toHaveBeenCalled();
            expect(mockJson).toHaveBeenCalledWith(mockBookings);
        });
        it('should return 500 on error', async () => {
            Booking_1.BookingModel.findAll.mockRejectedValue(new Error('Database error'));
            mockRequest = {};
            await bookingController_1.BookingController.getAllBookings(mockRequest, mockResponse);
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to fetch bookings' });
        });
    });
});
