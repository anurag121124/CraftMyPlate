import { create } from 'zustand';
import { Room, Booking } from '../types';

interface AppState {
  rooms: Room[];
  bookings: Booking[];
  setRooms: (rooms: Room[]) => void;
  setBookings: (bookings: Booking[]) => void;
}

export const useStore = create<AppState>((set) => ({
  rooms: [],
  bookings: [],
  setRooms: (rooms) => set({ rooms }),
  setBookings: (bookings) => set({ bookings }),
}));

