"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controllers/bookingController");
const router = (0, express_1.Router)();
router.post('/', bookingController_1.BookingController.createBooking);
router.get('/', bookingController_1.BookingController.getAllBookings);
router.post('/:id/cancel', bookingController_1.BookingController.cancelBooking);
exports.default = router;
