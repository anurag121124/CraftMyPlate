import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingActions } from '../actions/bookingActions';
import { analyticsActions } from '../actions/analyticsActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { format } from 'date-fns';

const AdminPage = () => {
  const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const queryClient = useQueryClient();

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingActions.getAllBookings,
  });

  const { data: analytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ['analytics', fromDate, toDate],
    queryFn: () => analyticsActions.getAnalytics({ from: fromDate, to: toDate }),
    enabled: false,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: bookingActions.cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      refetchAnalytics();
    },
  });

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(id);
    }
  };

  const handleFetchAnalytics = () => {
    refetchAnalytics();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>View and manage all bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="text-center py-4">Loading bookings...</div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bookings?.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 border rounded-md space-y-2"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{booking.userName}</p>
                        <p className="text-sm text-muted-foreground">Room: {booking.roomId}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.startTime), 'PPp')} -{' '}
                          {format(new Date(booking.endTime), 'PPp')}
                        </p>
                        <p className="text-sm font-medium">₹{booking.totalPrice}</p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            booking.status === 'CONFIRMED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                        {booking.status === 'CONFIRMED' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelBookingMutation.isPending}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {bookings?.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No bookings found</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>View revenue and utilization by date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fromDate" className="block text-sm font-medium mb-2">
                    From Date
                  </label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="toDate" className="block text-sm font-medium mb-2">
                    To Date
                  </label>
                  <Input
                    id="toDate"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleFetchAnalytics} className="w-full">
                Fetch Analytics
              </Button>

              {analytics && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold">Results:</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {analytics.map((item) => (
                      <div key={item.roomId} className="p-3 border rounded-md">
                        <p className="font-medium">{item.roomName}</p>
                        <p className="text-sm text-muted-foreground">
                          Total Hours: {item.totalHours.toFixed(2)}
                        </p>
                        <p className="text-sm font-medium">Revenue: ₹{item.totalRevenue.toFixed(2)}</p>
                      </div>
                    ))}
                    {analytics.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No data for selected period
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;

