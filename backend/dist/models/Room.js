"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomModel = exports.Room = void 0;
const database_1 = require("../config/database");
const Room_1 = require("../entities/Room");
Object.defineProperty(exports, "Room", { enumerable: true, get: function () { return Room_1.Room; } });
class RoomModel {
    static getRepository() {
        return database_1.AppDataSource.getRepository(Room_1.Room);
    }
    static async findAll() {
        return this.getRepository().find({
            order: { name: 'ASC' },
        });
    }
    static async findById(id) {
        return this.getRepository().findOne({ where: { id } });
    }
}
exports.RoomModel = RoomModel;
