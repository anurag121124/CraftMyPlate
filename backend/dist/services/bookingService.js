"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const Booking_1 = require("../models/Booking");
const Room_1 = require("../models/Room");
const pricing_1 = require("../utils/pricing");
const uuid_1 = require("uuid");
class BookingService {
    static async createBooking(data) {
        const room = await Room_1.RoomModel.findById(data.roomId);
        if (!room) {
            return { booking: null, error: 'Room not found' };
        }
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const conflicts = await Booking_1.BookingModel.findConflictingBookings(data.roomId, startTime, endTime);
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
        const totalPrice = (0, pricing_1.calculatePrice)(room.baseHourlyRate, startTime, endTime);
        const bookingId = `b${(0, uuid_1.v4)().split('-')[0]}`;
        const booking = await Booking_1.BookingModel.create({
            id: bookingId,
            ...data,
            startTime,
            endTime,
            totalPrice,
            status: 'CONFIRMED',
        });
        return { booking };
    }
    static async cancelBooking(id) {
        const booking = await Booking_1.BookingModel.findById(id);
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
        const cancelledBooking = await Booking_1.BookingModel.cancel(id);
        return { booking: cancelledBooking };
    }
    static async updateBooking(id, data) {
        const booking = await Booking_1.BookingModel.findById(id);
        if (!booking) {
            return { booking: null, error: 'Booking not found' };
        }
        if (booking.status === 'CANCELLED') {
            return { booking: null, error: 'Cannot update a cancelled booking' };
        }
        const updateData = {};
        if (data.userName) {
            updateData.userName = data.userName;
        }
        if (data.startTime || data.endTime) {
            const startTime = data.startTime ? new Date(data.startTime) : new Date(booking.startTime);
            const endTime = data.endTime ? new Date(data.endTime) : new Date(booking.endTime);
            // Check for conflicts (excluding current booking)
            const conflicts = await Booking_1.BookingModel.findConflictingBookings(booking.roomId, startTime, endTime, id);
            if (conflicts.length > 0) {
                return { booking: null, error: 'Room is already booked for the selected time' };
            }
            updateData.startTime = startTime;
            updateData.endTime = endTime;
            // Recalculate price if time changed
            const room = await Room_1.RoomModel.findById(booking.roomId);
            if (room) {
                updateData.totalPrice = (0, pricing_1.calculatePrice)(room.baseHourlyRate, startTime, endTime);
            }
        }
        const updatedBooking = await Booking_1.BookingModel.update(id, updateData);
        return { booking: updatedBooking };
    }
}
exports.BookingService = BookingService;
