const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  
  ROOMS: {
    LIST: `${API_BASE_URL}/api/rooms`,
  },

  BOOKINGS: {
    CREATE: `${API_BASE_URL}/api/bookings`,
    LIST: `${API_BASE_URL}/api/bookings`,
    CANCEL: (id: string) => `${API_BASE_URL}/api/bookings/${id}/cancel`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/bookings/${id}`,
  },

  ANALYTICS: {
    GET: `${API_BASE_URL}/api/analytics`,
  },
  

} as const;

