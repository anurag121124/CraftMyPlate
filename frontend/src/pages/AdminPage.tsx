import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { bookingActions } from '../actions/bookingActions';
import { analyticsActions } from '../actions/analyticsActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { DatePicker } from '../components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { format } from 'date-fns';
import { Edit2, X, Save, Trash2, BarChart3 } from 'lucide-react';

const AdminPage = () => {
  
  const queryClient = useQueryClient();
  
  const [editingBooking, setEditingBooking] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState<{
    userName: string;
    startTime: string;
    endTime: string;
  } | null>(null);
  
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  // Analytics date range state
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);
  const [fromDate, setFromDate] = useState<Date | undefined>(sevenDaysAgo);
  const [toDate, setToDate] = useState<Date | undefined>(sevenDaysFromNow);

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingActions.getAllBookings,
  });

  const { data: analytics, refetch: refetchAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', fromDate, toDate],
    queryFn: () => analyticsActions.getAnalytics({ 
      from: fromDate ? format(fromDate, 'yyyy-MM-dd') : '', 
      to: toDate ? format(toDate, 'yyyy-MM-dd') : '' 
    }),
    enabled: false, // Don't auto-fetch, require manual fetch
  });

  const cancelBookingMutation = useMutation({
    mutationFn: bookingActions.cancelBooking,
    onSuccess: () => {
      toast.success('Booking Cancelled', {
        description: 'The booking has been successfully cancelled',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error('Cancellation Failed', {
        description: error.response?.data?.error || 'Failed to cancel booking',
        duration: 5000,
      });
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ userName: string; startTime: string; endTime: string }> }) =>
      bookingActions.updateBooking(id, data),
    onSuccess: () => {
      toast.success('Booking Updated', {
        description: 'The booking has been successfully updated',
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setEditingBooking(null);
      setEditForm(null);
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error('Update Failed', {
        description: error.response?.data?.error || 'Failed to update booking',
        duration: 5000,
      });
    },
  });

  const handleCancel = (id: string) => {
    setBookingToCancel(id);
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    if (bookingToCancel) {
      cancelBookingMutation.mutate(bookingToCancel);
      setCancelDialogOpen(false);
      setBookingToCancel(null);
    }
  };

  const handleEdit = (booking: any) => {
    setEditingBooking(booking.id);
    setEditForm({
      userName: booking.userName,
      startTime: format(new Date(booking.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(booking.endTime), "yyyy-MM-dd'T'HH:mm"),
    });
  };

  const handleSave = (id: string) => {
    if (!editForm) return;

    const updateData: Partial<{ userName: string; startTime: string; endTime: string }> = {};
    
    if (editForm.userName) updateData.userName = editForm.userName;
    if (editForm.startTime) updateData.startTime = new Date(editForm.startTime).toISOString();
    if (editForm.endTime) updateData.endTime = new Date(editForm.endTime).toISOString();

    updateBookingMutation.mutate({ id, data: updateData });
  };

  const handleCancelEdit = () => {
    setEditingBooking(null);
    setEditForm(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage and update bookings</p>
      </div>

      {/* Analytics Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
          <CardDescription>View revenue and utilization metrics by room</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
              <Button onClick={() => refetchAnalytics()} disabled={analyticsLoading}>
                {analyticsLoading ? 'Loading...' : 'Fetch Analytics'}
              </Button>
            </div>

            {analyticsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-4 p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            ) : analytics && analytics.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room ID</TableHead>
                      <TableHead>Room Name</TableHead>
                      <TableHead className="text-right">Total Hours</TableHead>
                      <TableHead className="text-right">Total Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.map((item) => (
                      <TableRow key={item.roomId}>
                        <TableCell className="font-mono text-sm">{item.roomId}</TableCell>
                        <TableCell className="font-medium">{item.roomName}</TableCell>
                        <TableCell className="text-right">{item.totalHours.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          ₹{item.totalRevenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : analytics ? (
              <div className="text-center py-8 text-muted-foreground">
                No analytics data found for the selected date range
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Click "Fetch Analytics" to load data
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>View, update, and manage all bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {bookingsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 p-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No bookings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings?.map((booking) => (
                      <TableRow key={booking.id}>
                        {editingBooking === booking.id ? (
                          <>
                            <TableCell>
                              <Input
                                value={editForm?.userName || ''}
                                onChange={(e) =>
                                  setEditForm({ ...editForm!, userName: e.target.value })
                                }
                                placeholder="Guest name"
                                className="w-40"
                              />
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={booking.status === 'CONFIRMED' ? 'success' : 'secondary'}
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {booking.roomId.slice(0, 8)}...
                            </TableCell>
                            <TableCell>
                              <Input
                                type="datetime-local"
                                value={editForm?.startTime || ''}
                                onChange={(e) =>
                                  setEditForm({ ...editForm!, startTime: e.target.value })
                                }
                                className="w-48"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="datetime-local"
                                value={editForm?.endTime || ''}
                                onChange={(e) =>
                                  setEditForm({ ...editForm!, endTime: e.target.value })
                                }
                                className="w-48"
                              />
                            </TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              ₹{booking.totalPrice}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  onClick={() => handleSave(booking.id)}
                                  disabled={updateBookingMutation.isPending}
                                  size="sm"
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  onClick={handleCancelEdit}
                                  variant="outline"
                                  size="sm"
                                  disabled={updateBookingMutation.isPending}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="font-medium">{booking.userName}</TableCell>
                            <TableCell>
                              <Badge
                                variant={booking.status === 'CONFIRMED' ? 'success' : 'secondary'}
                              >
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {booking.roomId.slice(0, 8)}...
                            </TableCell>
                            <TableCell>
                              {format(new Date(booking.startTime), 'PPp')}
                            </TableCell>
                            <TableCell>
                              {format(new Date(booking.endTime), 'PPp')}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-primary">
                              ₹{booking.totalPrice}
                            </TableCell>
                            <TableCell className="text-right">
                              {booking.status === 'CONFIRMED' && (
                                <div className="flex justify-end gap-2">
                                  <Button
                                    onClick={() => handleEdit(booking)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Edit2 className="h-4 w-4 mr-1" />
                                    Update
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleCancel(booking.id)}
                                    disabled={cancelBookingMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false);
                setBookingToCancel(null);
              }}
            >
              No, Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={confirmCancel}
              disabled={cancelBookingMutation.isPending}
            >
              Yes, Cancel Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
