"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingModel = exports.Booking = void 0;
const database_1 = require("../config/database");
const Booking_1 = require("../entities/Booking");
Object.defineProperty(exports, "Booking", { enumerable: true, get: function () { return Booking_1.Booking; } });
class BookingModel {
    static getRepository() {
        return database_1.AppDataSource.getRepository(Booking_1.Booking);
    }
    static async create(data) {
        const repository = this.getRepository();
        const booking = repository.create(data);
        return repository.save(booking);
    }
    static async findById(id) {
        return this.getRepository().findOne({ where: { id } });
    }
    static async findConflictingBookings(roomId, startTime, endTime, excludeId) {
        const queryBuilder = this.getRepository()
            .createQueryBuilder('booking')
            .where('booking.roomId = :roomId', { roomId })
            .andWhere('booking.status = :status', { status: 'CONFIRMED' })
            .andWhere('booking.startTime < :endTime', { endTime })
            .andWhere('booking.endTime > :startTime', { startTime });
        if (excludeId) {
            queryBuilder.andWhere('booking.id != :excludeId', { excludeId });
        }
        return queryBuilder.getMany();
    }
    static async cancel(id) {
        const repository = this.getRepository();
        await repository.update(id, { status: 'CANCELLED' });
        return repository.findOne({ where: { id } });
    }
    static async findAll() {
        return this.getRepository().find({
            order: { createdAt: 'DESC' },
        });
    }
    static async getAnalytics(fromDate, toDate) {
        return this.getRepository()
            .createQueryBuilder('booking')
            .select('room.id', 'roomId')
            .addSelect('room.name', 'roomName')
            .addSelect('COALESCE(SUM(EXTRACT(EPOCH FROM (booking.endTime - booking.startTime)) / 3600), 0)', 'totalHours')
            .addSelect('COALESCE(SUM(booking.totalPrice), 0)', 'totalRevenue')
            .leftJoin('booking.room', 'room')
            .where('booking.status = :status', { status: 'CONFIRMED' })
            .andWhere('booking.startTime >= :fromDate', { fromDate })
            .andWhere('booking.endTime <= :toDate', { toDate })
            .groupBy('room.id')
            .addGroupBy('room.name')
            .orderBy('room.name', 'ASC')
            .getRawMany();
    }
}
exports.BookingModel = BookingModel;
