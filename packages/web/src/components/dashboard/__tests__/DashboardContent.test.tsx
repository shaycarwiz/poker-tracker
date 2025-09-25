import { render, screen } from '@testing-library/react';
import { DashboardContent } from '../DashboardContent';
import { SessionProvider } from 'next-auth/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { playerApi, sessionApi } from '@/lib/api-client';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      backendToken: 'mock-token',
      user: { name: 'Test User' },
    },
    status: 'authenticated',
  }),
  getSession: jest.fn(() =>
    Promise.resolve({
      backendToken: 'mock-token',
      user: { name: 'Test User' },
    })
  ),
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock API client
jest.mock('@/lib/api-client', () => ({
  playerApi: {
    getMe: jest.fn(),
    getStats: jest.fn(),
    getPreferences: jest.fn(),
  },
  sessionApi: {
    getAll: jest.fn(),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <UserPreferencesProvider>
        <SessionProvider session={null}>{component}</SessionProvider>
      </UserPreferencesProvider>
    </LanguageProvider>
  );
};

describe('DashboardContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock getPreferences to return a successful response
    (playerApi.getPreferences as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        currency: 'USD',
        language: 'en',
        timezone: 'UTC',
      },
    });
  });

  it('renders loading state initially', () => {
    // Mock API calls to never resolve to keep loading state
    (playerApi.getMe as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithProviders(<DashboardContent />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state when API fails', async () => {
    (playerApi.getMe as jest.Mock).mockRejectedValue(
      new Error('Network Error')
    );

    renderWithProviders(<DashboardContent />);

    // Wait for error state
    await screen.findByText('Error');
    expect(screen.getByText('Network Error')).toBeInTheDocument();
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

    (playerApi.getMe as jest.Mock).mockResolvedValue({
      success: true,
      data: mockPlayerData,
    });
    (playerApi.getStats as jest.Mock).mockResolvedValue({
      success: true,
      data: mockStats,
    });
    (sessionApi.getAll as jest.Mock).mockResolvedValue({
      success: true,
      data: { sessions: mockSessions },
    });

    renderWithProviders(<DashboardContent />);

    // Wait for content to load - the component shows Quick Actions by default
    await screen.findByText('Quick Actions');
    expect(screen.getByText('Start New Session')).toBeInTheDocument();
    expect(screen.getByText('View All Sessions')).toBeInTheDocument();
  });
});
