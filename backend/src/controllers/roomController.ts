import { Request, Response } from 'express';
import { RoomModel } from '../models/Room';

export class RoomController {
  static async getAllRooms(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await RoomModel.findAll();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  }
}

