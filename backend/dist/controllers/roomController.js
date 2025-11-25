"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomController = void 0;
const Room_1 = require("../models/Room");
class RoomController {
    static async getAllRooms(req, res) {
        try {
            const rooms = await Room_1.RoomModel.findAll();
            res.json(rooms);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch rooms' });
        }
    }
}
exports.RoomController = RoomController;
