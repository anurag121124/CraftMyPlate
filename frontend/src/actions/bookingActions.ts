import { request } from '../utils/request';
import { API_ENDPOINTS } from '../config/api-url';
import { CreateBookingRequest, CreateBookingResponse, Booking } from '../types';

export const bookingActions = {
  createBooking: async (data: CreateBookingRequest): Promise<CreateBookingResponse> => {
    const response = await request.post<CreateBookingResponse>(
      API_ENDPOINTS.BOOKINGS.CREATE,
      data
    );
    return response.data;
  },

  getAllBookings: async (): Promise<Booking[]> => {
    const response = await request.get<Booking[]>(API_ENDPOINTS.BOOKINGS.LIST);
    return response.data;
  },

  cancelBooking: async (id: string): Promise<void> => {
    await request.post(API_ENDPOINTS.BOOKINGS.CANCEL(id));
  },
};

