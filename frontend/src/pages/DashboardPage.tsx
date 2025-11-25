import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsActions } from '../actions/analyticsActions';
import { bookingActions } from '../actions/bookingActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Skeleton } from '../components/ui/skeleton';
import { DatePicker } from '../components/ui/date-picker';
import { format, parseISO } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp, DollarSign, Calendar, Users } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardPage = () => {
  // Default to -7 days to +7 days (14 days range centered on today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);
  const [fromDate, setFromDate] = useState<Date | undefined>(sevenDaysAgo);
  const [toDate, setToDate] = useState<Date | undefined>(sevenDaysFromNow);

  const { data: bookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingActions.getAllBookings,
  });

  const { data: analytics, refetch: refetchAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', fromDate, toDate],
    queryFn: () => analyticsActions.getAnalytics({ 
      from: fromDate ? format(fromDate, 'yyyy-MM-dd') : '', 
      to: toDate ? format(toDate, 'yyyy-MM-dd') : '' 
    }),
  });

  const handleFetchAnalytics = () => {
    refetchAnalytics();
  };

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!bookings || !analytics) {
      return {
        totalBookings: 0,
        totalRevenue: 0,
        activeBookings: 0,
        avgBookingValue: 0,
      };
    }

    const totalBookings = bookings.length;
    const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED').length;
    const totalRevenue = analytics.reduce((sum, item) => sum + item.totalRevenue, 0);
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    return {
      totalBookings,
      totalRevenue,
      activeBookings,
      avgBookingValue,
    };
  }, [bookings, analytics]);

  // Prepare chart data
  const revenueChartData = useMemo(() => {
    if (!analytics) return [];
    return analytics.map((item) => ({
      name: item.roomName,
      revenue: item.totalRevenue,
      hours: item.totalHours,
    }));
  }, [analytics]);

  const bookingsOverTimeData = useMemo(() => {
    if (!bookings) return [];
    
    const bookingsByDate = new Map<string, number>();
    bookings.forEach((booking) => {
      const date = format(parseISO(booking.startTime), 'yyyy-MM-dd');
      bookingsByDate.set(date, (bookingsByDate.get(date) || 0) + 1);
    });

    const sortedDates = Array.from(bookingsByDate.keys()).sort();
    return sortedDates.map((date) => ({
      date: format(parseISO(date), 'MMM dd'),
      bookings: bookingsByDate.get(date) || 0,
    }));
  }, [bookings]);

  const revenueOverTimeData = useMemo(() => {
    if (!bookings) return [];
    
    const revenueByDate = new Map<string, number>();
    bookings
      .filter((b) => b.status === 'CONFIRMED')
      .forEach((booking) => {
        const date = format(parseISO(booking.startTime), 'yyyy-MM-dd');
        revenueByDate.set(date, (revenueByDate.get(date) || 0) + booking.totalPrice);
      });

    const sortedDates = Array.from(revenueByDate.keys()).sort();
    return sortedDates.map((date) => ({
      date: format(parseISO(date), 'MMM dd'),
      revenue: revenueByDate.get(date) || 0,
    }));
  }, [bookings]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Analytics and insights for your workspace bookings</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.activeBookings} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summaryStats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Avg: ₹{summaryStats.avgBookingValue.toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">
              {summaryStats.totalBookings > 0
                ? ((summaryStats.activeBookings / summaryStats.totalBookings) * 100).toFixed(0)
                : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rooms</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.length || 0}</div>
            <p className="text-xs text-muted-foreground">In analytics</p>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Date Range</CardTitle>
          <CardDescription>Select date range to view analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>From Date</Label>
              <DatePicker
                date={fromDate}
                onDateChange={setFromDate}
                placeholder="Select start date"
                maxDate={toDate}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>To Date</Label>
              <DatePicker
                date={toDate}
                onDateChange={setToDate}
                placeholder="Select end date"
                minDate={fromDate}
              />
            </div>
            <Button onClick={handleFetchAnalytics}>
              Fetch Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      {analyticsLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : analytics && analytics.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Room</CardTitle>
              <CardDescription>Total revenue generated per room</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar
                  data={{
                    labels: revenueChartData.map((item) => item.name),
                    datasets: [
                      {
                        label: 'Revenue (₹)',
                        data: revenueChartData.map((item) => item.revenue),
                        backgroundColor: 'rgba(110, 25, 196, 0.8)',
                        borderColor: 'rgba(110, 25, 196, 1)',
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `₹${(context.parsed.y ?? 0).toFixed(2)}`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value) {
                            return '₹' + value;
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Utilization by Room</CardTitle>
              <CardDescription>Total hours booked per room</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Bar
                  data={{
                    labels: revenueChartData.map((item) => item.name),
                    datasets: [
                      {
                        label: 'Hours',
                        data: revenueChartData.map((item) => item.hours),
                        backgroundColor: 'rgba(239, 179, 26, 0.8)',
                        borderColor: 'rgba(239, 179, 26, 1)',
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `${(context.parsed.y ?? 0).toFixed(2)} hours`;
                          },
                        },
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value) {
                            return value + ' hrs';
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {bookingsOverTimeData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bookings Over Time</CardTitle>
                <CardDescription>Number of bookings per day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Line
                    data={{
                      labels: bookingsOverTimeData.map((item) => item.date),
                      datasets: [
                        {
                          label: 'Bookings',
                          data: bookingsOverTimeData.map((item) => item.bookings),
                          borderColor: 'rgba(110, 25, 196, 1)',
                          backgroundColor: 'rgba(110, 25, 196, 0.1)',
                          borderWidth: 2,
                          fill: true,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'top' as const,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {revenueOverTimeData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Line
                    data={{
                      labels: revenueOverTimeData.map((item) => item.date),
                      datasets: [
                        {
                          label: 'Revenue (₹)',
                          data: revenueOverTimeData.map((item) => item.revenue),
                          borderColor: 'rgba(110, 25, 196, 1)',
                          backgroundColor: 'rgba(110, 25, 196, 0.2)',
                          borderWidth: 2,
                          fill: true,
                          tension: 0.4,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: true,
                          position: 'top' as const,
                        },
                        tooltip: {
                          callbacks: {
                            label: function (context) {
                              return `₹${(context.parsed.y ?? 0).toFixed(2)}`;
                            },
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function (value) {
                              return '₹' + value;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {revenueChartData.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
                <CardDescription>Revenue share by room</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="w-full max-w-md">
                    <Doughnut
                      data={{
                        labels: revenueChartData.map((item) => item.name),
                        datasets: [
                          {
                            data: revenueChartData.map((item) => item.revenue),
                            backgroundColor: [
                              'rgba(110, 25, 196, 0.8)',
                              'rgba(239, 179, 26, 0.8)',
                              'rgba(34, 197, 94, 0.8)',
                              'rgba(59, 130, 246, 0.8)',
                              'rgba(236, 72, 153, 0.8)',
                            ],
                            borderColor: [
                              'rgba(110, 25, 196, 1)',
                              'rgba(239, 179, 26, 1)',
                              'rgba(34, 197, 94, 1)',
                              'rgba(59, 130, 246, 1)',
                              'rgba(236, 72, 153, 1)',
                            ],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'right' as const,
                          },
                          tooltip: {
                            callbacks: {
                              label: function (context) {
                                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${context.label}: ₹${context.parsed.toFixed(2)} (${percentage}%)`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Analytics Data</CardTitle>
            <CardDescription>Fetch analytics to view charts</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleFetchAnalytics} className="w-full">
              Fetch Analytics
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardPage;

