import { render, screen } from '@testing-library/react';
import { DashboardContent } from '../DashboardContent';
import { SessionProvider } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      backendToken: 'mock-token',
      user: { name: 'Test User' },
    },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock fetch
global.fetch = jest.fn();

describe('DashboardContent', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading state
    );

    render(
      <SessionProvider session={null}>
        <DashboardContent />
      </SessionProvider>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state when API fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(
      <SessionProvider session={null}>
        <DashboardContent />
      </SessionProvider>
    );

    // Wait for error state
    await screen.findByText('Error');
    expect(screen.getByText('API Error')).toBeInTheDocument();
  });

  it('renders dashboard content when data loads successfully', async () => {
    const mockPlayerData = {
      id: '1',
      name: 'Test User',
      bankroll: { amount: 1000, currency: 'USD' },
      totalSessions: 5,
      totalWinnings: { amount: 500, currency: 'USD' },
      winRate: 60,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    const mockStats = {
      playerId: '1',
      totalSessions: 5,
      totalWinnings: 500,
      winRate: 60,
      averageSession: 120,
    };

    const mockSessions = [
      {
        sessionId: '1',
        playerId: '1',
        location: 'Test Casino',
        stakes: { smallBlind: 1, bigBlind: 2, currency: 'USD' },
        initialBuyIn: { amount: 200, currency: 'USD' },
        profitLoss: { amount: 100, currency: 'USD' },
        status: 'COMPLETED',
        startedAt: '2024-01-01T00:00:00.000Z',
        endedAt: '2024-01-01T04:00:00.000Z',
        duration: 240,
        transactions: [],
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockPlayerData }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, data: mockStats }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, data: { sessions: mockSessions } }),
      });

    render(
      <SessionProvider session={null}>
        <DashboardContent />
      </SessionProvider>
    );

    // Wait for content to load
    await screen.findByText('Welcome back, Test User!');
    expect(screen.getByText('Current Bankroll')).toBeInTheDocument();
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
    expect(screen.getByText('Recent Sessions')).toBeInTheDocument();
  });
});
