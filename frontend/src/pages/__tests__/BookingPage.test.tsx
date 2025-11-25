import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BookingPage from '../BookingPage';
import { roomActions } from '../../actions/roomActions';
import { bookingActions } from '../../actions/bookingActions';

vi.mock('../../actions/roomActions');
vi.mock('../../actions/bookingActions');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

describe('BookingPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();

    const mockRooms = [
      {
        id: '1',
        name: 'Conference Room A',
        baseHourlyRate: 100,
        capacity: 10,
      },
    ];

    vi.mocked(roomActions.getAllRooms).mockResolvedValue(mockRooms);
  });

  it('renders booking form', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BookingPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Book a Workspace')).toBeInTheDocument();
      expect(screen.getByLabelText(/room/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <BookingPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create booking/i })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /create booking/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/room is required/i)).toBeInTheDocument();
    });
  });

  it('submits booking form successfully', async () => {
    const user = userEvent.setup();
    const mockBookingResponse = {
      bookingId: 'booking-1',
      roomId: '1',
      userName: 'John Doe',
      totalPrice: 200,
      status: 'CONFIRMED' as const,
    };

    vi.mocked(bookingActions.createBooking).mockResolvedValue(mockBookingResponse);

    render(
      <QueryClientProvider client={queryClient}>
        <BookingPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/room/i)).toBeInTheDocument();
    });

    const roomSelect = screen.getByLabelText(/room/i);
    const nameInput = screen.getByLabelText(/your name/i);
    const startTimeInput = screen.getByLabelText(/start time/i);
    const endTimeInput = screen.getByLabelText(/end time/i);

    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 1);
    const startTime = futureDate.toISOString().slice(0, 16);
    futureDate.setHours(futureDate.getHours() + 2);
    const endTime = futureDate.toISOString().slice(0, 16);

    await user.selectOptions(roomSelect, '1');
    await user.type(nameInput, 'John Doe');
    await user.type(startTimeInput, startTime);
    await user.type(endTimeInput, endTime);

    const submitButton = screen.getByRole('button', { name: /create booking/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(bookingActions.createBooking).toHaveBeenCalled();
      expect(screen.getByText(/booking created successfully/i)).toBeInTheDocument();
    });
  });
});

