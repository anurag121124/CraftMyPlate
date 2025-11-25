"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const bookingService_1 = require("../services/bookingService");
const Booking_1 = require("../models/Booking");
const validation_1 = require("../utils/validation");
class BookingController {
    static async createBooking(req, res) {
        try {
            const validationResult = validation_1.createBookingSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({ error: validationResult.error.errors[0].message });
                return;
            }
            const bookingData = {
                roomId: validationResult.data.roomId,
                userName: validationResult.data.userName,
                startTime: new Date(validationResult.data.startTime),
                endTime: new Date(validationResult.data.endTime),
            };
            const result = await bookingService_1.BookingService.createBooking(bookingData);
            if (result.error || !result.booking) {
                res.status(400).json({ error: result.error || 'Failed to create booking' });
                return;
            }
            res.status(201).json({
                bookingId: result.booking.id,
                roomId: result.booking.roomId,
                userName: result.booking.userName,
                totalPrice: result.booking.totalPrice,
                status: result.booking.status,
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create booking' });
        }
    }
    static async cancelBooking(req, res) {
        try {
            const { id } = req.params;
            const result = await bookingService_1.BookingService.cancelBooking(id);
            if (result.error || !result.booking) {
                res.status(400).json({ error: result.error || 'Failed to cancel booking' });
                return;
            }
            res.json({ message: 'Booking cancelled successfully', booking: result.booking });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to cancel booking' });
        }
    }
    static async getAllBookings(req, res) {
        try {
            const bookings = await Booking_1.BookingModel.findAll();
            res.json(bookings);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch bookings' });
        }
    }
    static async updateBooking(req, res) {
        try {
            const { id } = req.params;
            const validationResult = validation_1.updateBookingSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({ error: validationResult.error.errors[0].message });
                return;
            }
            const updateData = {};
            if (validationResult.data.userName) {
                updateData.userName = validationResult.data.userName;
            }
            if (validationResult.data.startTime) {
                updateData.startTime = new Date(validationResult.data.startTime);
            }
            if (validationResult.data.endTime) {
                updateData.endTime = new Date(validationResult.data.endTime);
            }
            const result = await bookingService_1.BookingService.updateBooking(id, updateData);
            if (result.error || !result.booking) {
                res.status(400).json({ error: result.error || 'Failed to update booking' });
                return;
            }
            res.json({ message: 'Booking updated successfully', booking: result.booking });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update booking' });
        }
    }
}
exports.BookingController = BookingController;
