"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsQuerySchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
    roomId: zod_1.z.string().min(1, 'Room ID is required'),
    userName: zod_1.z.string().min(1, 'User name is required'),
    startTime: zod_1.z.string().datetime('Invalid start time format'),
    endTime: zod_1.z.string().datetime('Invalid end time format'),
}).refine((data) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return start < end;
}, {
    message: 'Start time must be before end time',
    path: ['endTime'],
}).refine((data) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return hours <= 12;
}, {
    message: 'Booking duration cannot exceed 12 hours',
    path: ['endTime'],
});
exports.analyticsQuerySchema = zod_1.z.object({
    from: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
    to: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format. Use YYYY-MM-DD'),
}).refine((data) => {
    const from = new Date(data.from);
    const to = new Date(data.to);
    return from <= to;
}, {
    message: 'From date must be before or equal to to date',
    path: ['to'],
});
