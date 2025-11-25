"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const Room_1 = require("../entities/Room");
async function migrate() {
    try {
        await database_1.AppDataSource.initialize();
        await database_1.AppDataSource.synchronize();
        const roomRepository = database_1.AppDataSource.getRepository(Room_1.Room);
        const seedRooms = [
            { id: '101', name: 'Cabin 1', baseHourlyRate: 500, capacity: 4 },
            { id: '102', name: 'Cabin 2', baseHourlyRate: 600, capacity: 6 },
            { id: '103', name: 'Conference Hall', baseHourlyRate: 1000, capacity: 20 },
            { id: '104', name: 'Meeting Room A', baseHourlyRate: 750, capacity: 8 },
            { id: '105', name: 'Meeting Room B', baseHourlyRate: 800, capacity: 10 },
        ];
        for (const roomData of seedRooms) {
            const existingRoom = await roomRepository.findOne({ where: { id: roomData.id } });
            if (!existingRoom) {
                const room = roomRepository.create(roomData);
                await roomRepository.save(room);
            }
        }
        console.log('Migration completed successfully');
        await database_1.AppDataSource.destroy();
        process.exit(0);
    }
    catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}
migrate();
