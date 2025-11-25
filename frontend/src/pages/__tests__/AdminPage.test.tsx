import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminPage from '../AdminPage';
import { bookingActions } from '../../actions/bookingActions';
import { analyticsActions } from '../../actions/analyticsActions';

vi.mock('../../actions/bookingActions');
vi.mock('../../actions/analyticsActions');

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

describe('AdminPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  it('renders admin dashboard', async () => {
    const mockBookings = [
      {
        id: '1',
        roomId: 'room-1',
        userName: 'John Doe',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        totalPrice: 200,
        status: 'CONFIRMED' as const,
      },
    ];

    vi.mocked(bookingActions.getAllBookings).mockResolvedValue(mockBookings);

    render(
      <QueryClientProvider client={queryClient}>
        <AdminPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('All Bookings')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });
  });

  it('displays booking statistics', async () => {
    const mockBookings = [
      {
        id: '1',
        roomId: 'room-1',
        userName: 'John Doe',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        totalPrice: 200,
        status: 'CONFIRMED' as const,
      },
    ];

    vi.mocked(bookingActions.getAllBookings).mockResolvedValue(mockBookings);

    render(
      <QueryClientProvider client={queryClient}>
        <AdminPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument(); // Total bookings
    });
  });

  it('fetches analytics when date range is selected', async () => {
    const user = userEvent.setup();
    const mockAnalytics = [
      {
        roomId: 'room-1',
        roomName: 'Conference Room A',
        totalHours: 10,
        totalRevenue: 1000,
      },
    ];

    vi.mocked(bookingActions.getAllBookings).mockResolvedValue([]);
    vi.mocked(analyticsActions.getAnalytics).mockResolvedValue(mockAnalytics);

    render(
      <QueryClientProvider client={queryClient}>
        <AdminPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Fetch Analytics')).toBeInTheDocument();
    });

    const fetchButton = screen.getByText('Fetch Analytics');
    await user.click(fetchButton);

    await waitFor(() => {
      expect(analyticsActions.getAnalytics).toHaveBeenCalled();
    });
  });

  it('cancels booking successfully', async () => {
    const user = userEvent.setup();
    const mockBookings = [
      {
        id: '1',
        roomId: 'room-1',
        userName: 'John Doe',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        totalPrice: 200,
        status: 'CONFIRMED' as const,
      },
    ];

    vi.mocked(bookingActions.getAllBookings).mockResolvedValue(mockBookings);
    vi.mocked(bookingActions.cancelBooking).mockResolvedValue(undefined);

    // Mock window.confirm
    window.confirm = vi.fn(() => true);

    render(
      <QueryClientProvider client={queryClient}>
        <AdminPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(bookingActions.cancelBooking).toHaveBeenCalledWith('1');
    });
  });
});

