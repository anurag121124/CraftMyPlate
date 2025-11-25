import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';

const router = Router();

router.post('/', BookingController.createBooking);
router.get('/', BookingController.getAllBookings);
router.post('/:id/cancel', BookingController.cancelBooking);
router.patch('/:id', BookingController.updateBooking);

export default router;

