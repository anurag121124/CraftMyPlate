import { Request, Response } from 'express';
import { BookingModel } from '../models/Booking';
import { analyticsQuerySchema } from '../utils/validation';

export class AnalyticsController {
  static async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = analyticsQuerySchema.safeParse(req.query);
      if (!validationResult.success) {
        res.status(400).json({ error: validationResult.error.errors[0].message });
        return;
      }

      const { from, to } = validationResult.data;
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);

      const analytics = await BookingModel.getAnalytics(fromDate, toDate);
      const formattedAnalytics = analytics.map((item) => ({
        roomId: item.roomId,
        roomName: item.roomName,
        totalHours: parseFloat(item.totalHours),
        totalRevenue: parseFloat(item.totalRevenue),
      }));

      res.json(formattedAnalytics);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
}

