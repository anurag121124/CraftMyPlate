import { AppDataSource } from '../config/database';
import { Booking, BookingStatus } from '../entities/Booking';

export { Booking, BookingStatus };

export interface BookingCreateInput {
  roomId: string;
  userName: string;
  startTime: Date;
  endTime: Date;
}

export class BookingModel {
  static getRepository() {
    return AppDataSource.getRepository(Booking);
  }

  static async create(data: BookingCreateInput & { id: string; totalPrice: number; status: BookingStatus }): Promise<Booking> {
    const repository = this.getRepository();
    const booking = repository.create(data);
    return repository.save(booking);
  }

  static async findById(id: string): Promise<Booking | null> {
    return this.getRepository().findOne({ where: { id } });
  }

  static async findConflictingBookings(roomId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<Booking[]> {
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

  static async cancel(id: string): Promise<Booking | null> {
    const repository = this.getRepository();
    await repository.update(id, { status: 'CANCELLED' });
    return repository.findOne({ where: { id } });
  }

  static async update(id: string, data: Partial<{ userName: string; startTime: Date; endTime: Date; totalPrice: number }>): Promise<Booking | null> {
    const repository = this.getRepository();
    await repository.update(id, data);
    return repository.findOne({ where: { id } });
  }

  static async findAll(): Promise<Booking[]> {
    return this.getRepository().find({
      order: { createdAt: 'DESC' },
    });
  }

  static async getAnalytics(fromDate: Date, toDate: Date): Promise<any[]> {
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
