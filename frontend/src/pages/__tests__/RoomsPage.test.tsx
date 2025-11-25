import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RoomsPage from '../RoomsPage';
import { roomActions } from '../../actions/roomActions';

vi.mock('../../actions/roomActions');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('RoomsPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    vi.mocked(roomActions.getAllRooms).mockImplementation(
      () =>
        new Promise(() => {
          // Never resolves to keep loading state
        })
    );

    render(
      <QueryClientProvider client={queryClient}>
        <RoomsPage />
      </QueryClientProvider>
    );

    expect(screen.getByText(/loading rooms/i)).toBeInTheDocument();
  });

  it('renders error state', async () => {
    vi.mocked(roomActions.getAllRooms).mockRejectedValue(new Error('Failed to fetch'));

    render(
      <QueryClientProvider client={queryClient}>
        <RoomsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load rooms/i)).toBeInTheDocument();
    });
  });

  it('renders rooms list', async () => {
    const mockRooms = [
      {
        id: '1',
        name: 'Conference Room A',
        baseHourlyRate: 100,
        capacity: 10,
      },
      {
        id: '2',
        name: 'Workspace B',
        baseHourlyRate: 150,
        capacity: 5,
      },
    ];

    vi.mocked(roomActions.getAllRooms).mockResolvedValue(mockRooms);

    render(
      <QueryClientProvider client={queryClient}>
        <RoomsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Available Workspaces')).toBeInTheDocument();
      expect(screen.getByText('Conference Room A')).toBeInTheDocument();
      expect(screen.getByText('Workspace B')).toBeInTheDocument();
      expect(screen.getByText('₹100')).toBeInTheDocument();
      expect(screen.getByText('₹150')).toBeInTheDocument();
    });
  });

  it('renders empty state when no rooms', async () => {
    vi.mocked(roomActions.getAllRooms).mockResolvedValue([]);

    render(
      <QueryClientProvider client={queryClient}>
        <RoomsPage />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/no rooms available/i)).toBeInTheDocument();
    });
  });
});

