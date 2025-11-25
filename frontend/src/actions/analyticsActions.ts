import { request } from '../utils/request';
import { API_ENDPOINTS } from '../config/api-url';
import { AnalyticsItem, AnalyticsQuery } from '../types';

export const analyticsActions = {
  
  getAnalytics: async (query: AnalyticsQuery): Promise<AnalyticsItem[]> => {
    const response = await request.get<AnalyticsItem[]>(API_ENDPOINTS.ANALYTICS.GET, {
      params: query,
    });
    return response.data;
  },
  
};

