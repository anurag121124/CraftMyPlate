import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { roomActions } from '../actions/roomActions';
import { bookingActions } from '../actions/bookingActions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../components/ui/form';
import { DateTimePicker } from '../components/ui/date-time-picker';
import { CheckCircle2, Calendar as CalendarIcon, User, MapPin, Sparkles } from 'lucide-react';

const bookingSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  userName: z.string().min(1, 'Name is required'),
  startTime: z.date({ required_error: 'Start time is required' }),
  endTime: z.date({ required_error: 'End time is required' }),
}).refine((data) => data.startTime < data.endTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookingPage = () => {
  const queryClient = useQueryClient();

  const { data: rooms } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomActions.getAllRooms,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      roomId: '',
      userName: '',
      startTime: undefined,
      endTime: undefined,
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: bookingActions.createBooking,
    onSuccess: (data) => {
      toast.success('Booking Created!', {
        description: `Booking ID: ${data.bookingId} | Total Price: ₹${data.totalPrice}`,
        duration: 5000,
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err: unknown) => {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error('Booking Failed', {
        description: error.response?.data?.error || 'Failed to create booking',
        duration: 5000,
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    const payload = {
      roomId: data.roomId,
      userName: data.userName,
      startTime: data.startTime.toISOString(),
      endTime: data.endTime.toISOString(),
    };
    createBookingMutation.mutate(payload);
  };

  const now = new Date();
  const minDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  const selectedRoom = rooms?.find((r) => r.id === form.watch('roomId'));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Book a Workspace
        </h1>
        <p className="text-lg text-muted-foreground">
          Reserve your perfect workspace for your next meeting or session
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-lg border-2">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <CalendarIcon className="h-5 w-5 text-primary" />
              </div>
              Booking Details
            </CardTitle>
            <CardDescription className="text-base">
              Fill in the details to book a workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form form={form} onSubmit={onSubmit} className="space-y-6">
              <FormField
                control={form.control}
                name="roomId"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      Select Workspace
                    </FormLabel>
                    <FormControl>
                      <Select {...field} value={field.value || ''} className="h-11">
                        <option value="">Choose a workspace...</option>
                        {rooms?.map((room) => (
                          <option key={room.id} value={room.id}>
                            {room.name} - ₹{room.baseHourlyRate}/hour ({room.capacity} {room.capacity === 1 ? 'person' : 'people'})
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    {selectedRoom && (
                      <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 text-sm">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="font-medium">{selectedRoom.name}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">
                            Capacity: {selectedRoom.capacity} {selectedRoom.capacity === 1 ? 'person' : 'people'}
                          </span>
                        </div>
                      </div>
                    )}
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userName"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Your Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your full name" 
                        {...field} 
                        className="h-11"
                      />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Check-in Time
                      </FormLabel>
                      <FormControl>
                        <DateTimePicker
                          date={field.value}
                          onDateChange={field.onChange}
                          placeholder="Select check-in date & time"
                          minDate={minDate}
                          error={fieldState.error?.message}
                        />
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Check-out Time
                      </FormLabel>
                      <FormControl>
                        <DateTimePicker
                          date={field.value}
                          onDateChange={field.onChange}
                          placeholder="Select check-out date & time"
                          minDate={form.watch('startTime') || minDate}
                          error={fieldState.error?.message}
                        />
                      </FormControl>
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={createBookingMutation.isPending}
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow"
                size="lg"
              >
                {createBookingMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Booking...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    Create Booking
                  </>
                )}
              </Button>
            </Form>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Booking Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">Advance Booking:</span> Book at least 2 hours in advance for best availability
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">Cancellation:</span> You can cancel bookings more than 2 hours before start time
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">Pricing:</span> Calculated based on hourly rates automatically
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">Capacity:</span> Check room capacity to ensure it fits your group size
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;

