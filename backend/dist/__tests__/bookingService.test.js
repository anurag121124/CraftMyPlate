"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bookingService_1 = require("../services/bookingService");
const Booking_1 = require("../models/Booking");
const Room_1 = require("../models/Room");
const pricing_1 = require("../utils/pricing");
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
                status: 'CONFIRMED',
            };
            Room_1.RoomModel.findById.mockResolvedValue(mockRoom);
            Booking_1.BookingModel.findConflictingBookings.mockResolvedValue([]);
            pricing_1.calculatePrice.mockReturnValue(200);
            Booking_1.BookingModel.create.mockResolvedValue(mockBooking);
            const result = await bookingService_1.BookingService.createBooking({
                roomId: 'room-1',
                userName: 'John Doe',
                startTime: new Date('2024-12-31T10:00:00Z'),
                endTime: new Date('2024-12-31T12:00:00Z'),
            });
            expect(result.booking).toEqual(mockBooking);
            expect(result.error).toBeUndefined();
            expect(Room_1.RoomModel.findById).toHaveBeenCalledWith('room-1');
            expect(Booking_1.BookingModel.findConflictingBookings).toHaveBeenCalled();
            expect(Booking_1.BookingModel.create).toHaveBeenCalled();
        });
        it('should return error when room not found', async () => {
            Room_1.RoomModel.findById.mockResolvedValue(null);
            const result = await bookingService_1.BookingService.createBooking({
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
            Room_1.RoomModel.findById.mockResolvedValue(mockRoom);
            Booking_1.BookingModel.findConflictingBookings.mockResolvedValue([
                conflictingBooking,
            ]);
            const result = await bookingService_1.BookingService.createBooking({
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
                status: 'CONFIRMED',
            };
            const cancelledBooking = {
                ...mockBooking,
                status: 'CANCELLED',
            };
            Booking_1.BookingModel.findById.mockResolvedValue(mockBooking);
            Booking_1.BookingModel.cancel.mockResolvedValue(cancelledBooking);
            // Mock Date.now to return a time before the booking
            jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-12-31T00:00:00Z').getTime());
            const result = await bookingService_1.BookingService.cancelBooking('b123');
            expect(result.booking).toEqual(cancelledBooking);
            expect(result.error).toBeUndefined();
            expect(Booking_1.BookingModel.findById).toHaveBeenCalledWith('b123');
            expect(Booking_1.BookingModel.cancel).toHaveBeenCalledWith('b123');
            jest.restoreAllMocks();
        });
        it('should return error when booking not found', async () => {
            Booking_1.BookingModel.findById.mockResolvedValue(null);
            const result = await bookingService_1.BookingService.cancelBooking('invalid-id');
            expect(result.booking).toBeNull();
            expect(result.error).toBe('Booking not found');
        });
        it('should return error when booking is already cancelled', async () => {
            const mockBooking = {
                id: 'b123',
                status: 'CANCELLED',
            };
            Booking_1.BookingModel.findById.mockResolvedValue(mockBooking);
            const result = await bookingService_1.BookingService.cancelBooking('b123');
            expect(result.booking).toBeNull();
            expect(result.error).toBe('Booking is already cancelled');
        });
        it('should return error when cancellation is too close to start time', async () => {
            const mockBooking = {
                id: 'b123',
                startTime: new Date('2024-12-31T10:00:00Z'),
                status: 'CONFIRMED',
            };
            Booking_1.BookingModel.findById.mockResolvedValue(mockBooking);
            // Mock Date.now to return a time less than 2 hours before booking
            jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-12-31T09:30:00Z').getTime());
            const result = await bookingService_1.BookingService.cancelBooking('b123');
            expect(result.booking).toBeNull();
            expect(result.error).toContain('Cancellation is only allowed more than 2 hours');
            jest.restoreAllMocks();
        });
    });
});
