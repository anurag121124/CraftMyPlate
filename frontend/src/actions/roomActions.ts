import { request } from '../utils/request';
import { API_ENDPOINTS } from '../config/api-url';
import { Room } from '../types';

export const roomActions = {
  getAllRooms: async (): Promise<Room[]> => {
    const response = await request.get<Room[]>(API_ENDPOINTS.ROOMS.LIST);
    return response.data;
  },
};

