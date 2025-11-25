import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { roomActions } from '../actions/roomActions';
import { bookingActions } from '../actions/bookingActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { format } from 'date-fns';

const bookingSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  userName: z.string().min(1, 'Name is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookingPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomActions.getAllRooms,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
  });

  const createBookingMutation = useMutation({
    mutationFn: bookingActions.createBooking,
    onSuccess: (data) => {
      setSuccess(`Booking created successfully! Booking ID: ${data.bookingId}, Total Price: ₹${data.totalPrice}`);
      setError(null);
      reset();
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to create booking');
      setSuccess(null);
    },
  });

  const onSubmit = (data: BookingFormData) => {
    setError(null);
    setSuccess(null);
    const payload = {
      ...data,
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString(),
    };
    createBookingMutation.mutate(payload);
  };

  const now = new Date();
  const minDateTime = format(now, "yyyy-MM-dd'T'HH:mm");

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Book a Workspace</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create Booking</CardTitle>
          <CardDescription>Fill in the details to book a workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="roomId" className="block text-sm font-medium mb-2">
                Room
              </label>
              <select
                id="roomId"
                {...register('roomId')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a room</option>
                {rooms?.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} (₹{room.baseHourlyRate}/hour)
                  </option>
                ))}
              </select>
              {errors.roomId && (
                <p className="text-sm text-destructive mt-1">{errors.roomId.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="userName" className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <Input id="userName" {...register('userName')} placeholder="Enter your name" />
              {errors.userName && (
                <p className="text-sm text-destructive mt-1">{errors.userName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium mb-2">
                Start Time
              </label>
              <Input
                id="startTime"
                type="datetime-local"
                {...register('startTime')}
                min={minDateTime}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive mt-1">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium mb-2">
                End Time
              </label>
              <Input
                id="endTime"
                type="datetime-local"
                {...register('endTime')}
                min={minDateTime}
              />
              {errors.endTime && (
                <p className="text-sm text-destructive mt-1">{errors.endTime.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-md bg-green-100 text-green-800 text-sm">{success}</div>
            )}

            <Button type="submit" disabled={createBookingMutation.isPending} className="w-full">
              {createBookingMutation.isPending ? 'Creating...' : 'Create Booking'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingPage;

