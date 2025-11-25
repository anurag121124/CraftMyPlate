import { AppDataSource } from '../config/database';
import { Room } from '../entities/Room';

export { Room };

export class RoomModel {
  static getRepository() {
    return AppDataSource.getRepository(Room);
  }

  static async findAll(): Promise<Room[]> {
    return this.getRepository().find({
      order: { name: 'ASC' },
    });
  }

  static async findById(id: string): Promise<Room | null> {
    return this.getRepository().findOne({ where: { id } });
  }
}
