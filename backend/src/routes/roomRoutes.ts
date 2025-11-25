import { Router } from 'express';
import { RoomController } from '../controllers/roomController';

const router = Router();

router.get('/', RoomController.getAllRooms);

export default router;

