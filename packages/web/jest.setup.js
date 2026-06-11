import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      // Mock translation function that returns readable text for common keys
      const translations = {
        'navigation.dashboard': 'Dashboard',
        'navigation.sessions': 'Sessions',
        'navigation.statistics': 'Statistics',
        'navigation.settings': 'Settings',
        'language.switchLanguage': 'Switch Language',
        'language.hebrew': 'Hebrew',
        'auth.signInWithGoogle': 'Sign in with Google',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.retry': 'Retry',
        'dashboard.welcomeBack': 'Welcome back, {name}!',
        'dashboard.currentBankroll': 'Current Bankroll',
        'dashboard.totalSessions': 'Total Sessions',
        'dashboard.recentSessions': 'Recent Sessions',
        'dashboard.title': 'Dashboard',
        'dashboard.subtitle':
          'Track your poker sessions and analyze your performance',
        'dashboard.quickActions': 'Quick Actions',
        'dashboard.netProfitLoss': 'Net Profit/Loss',
        'dashboard.winRate': 'Win Rate',
        'dashboard.viewAll': 'View all',
        'dashboard.noSessionsYet': 'No sessions yet',
        'dashboard.startFirstSessionPrompt':
          'Start your first poker session to see it here',
        'dashboard.detailedStats': 'Want more detailed statistics?',
        'dashboard.detailedStatsDescription':
          'View comprehensive performance metrics, monthly breakdowns, and detailed analytics.',
        'dashboard.viewDetailedStats': 'View Detailed Statistics',
        'dashboard.actions.startNewSession': 'Start New Session',
        'dashboard.actions.startNewSessionDescription':
          'Begin tracking a new poker session',
        'dashboard.actions.viewAllSessions': 'View All Sessions',
        'dashboard.actions.viewAllSessionsDescription':
          'See your complete session history',
        'dashboard.actions.updateBankroll': 'Update Bankroll',
        'dashboard.actions.updateBankrollDescription':
          'Add or adjust your current bankroll',
        'dashboard.actions.viewStatistics': 'View Statistics',
        'dashboard.actions.viewStatisticsDescription':
          'Analyze your poker performance',
        'dashboard.charts.profitLossTrend': 'Profit/Loss Trend',
        'dashboard.charts.noDataToDisplay': 'No data to display',
        'dashboard.charts.completeSessionsForTrend':
          'Complete some sessions to see your trend',
        'dashboard.charts.lastNSessions': 'Last {{count}} sessions',
        'dashboard.charts.current': 'Current:',
        'dashboard.charts.winRateByStakes': 'Win Rate by Stakes',
        'dashboard.charts.playDifferentStakes':
          'Play different stakes to see your performance',
        'dashboard.charts.sessionsCount': '({{count}} sessions)',
        'sessions.subtitle': 'Your poker session history',
        'sessions.noSessionsYet': 'No sessions yet',
        'sessions.getStartedPrompt':
          'Get started by creating your first poker session.',
        'sessions.startFirstSession': 'Start Your First Session',
        'sessions.startNewSession': 'Start New Session',
        'sessions.started': 'Started',
        'sessions.loadError': 'Failed to load sessions',
        'sessions.loadSessionError': 'Failed to load session',
        'sessions.sessionNotFound': 'Session not found',
        'sessions.sessionDetails': 'Session Details',
        'sessions.sessionStartedOn': 'Session started on',
        'sessions.andEndedOn': 'and ended on',
        'sessions.statusLabel': 'Status',
        'sessions.financialSummary': 'Financial Summary',
        'sessions.totalBuyIns': 'Total Buy-ins',
        'sessions.totalCashOuts': 'Total Cash-outs',
        'sessions.netResult': 'Net Result',
        'sessions.transactions': 'Transactions',
        'sessions.noTransactionsYet': 'No transactions yet',
        'sessions.durationHours': '{{hours}}h {{minutes}}m',
        'sessions.durationMinutes': '{{minutes}}m',
        'sessions.sessionActions': 'Session Actions',
        'sessions.inactiveSession':
          'This session is {{status}}. No actions available.',
        'sessions.updateNotes': 'Update Notes',
        'sessions.updateSessionNotes': 'Update Session Notes',
        'sessions.sessionNotes': 'Session Notes',
        'sessions.sessionNotesHelp':
          'You can add any notes about the session, opponents, game conditions, etc.',
        'sessions.updatingNotes': 'Updating...',
        'sessions.addingTransaction': 'Adding...',
        'sessions.addTransactionError': 'Failed to add transaction',
        'sessions.endSessionError': 'Failed to end session',
        'sessions.updateNotesError': 'Failed to update notes',
        'sessions.player': 'Player',
        'sessions.descriptionOptional': 'Description (Optional)',
        'sessions.transactionDescriptionPlaceholder': 'Transaction description',
        'sessions.sessionSummary': 'Session Summary',
        'sessions.currentCashOut': 'Current Cash-out',
        'sessions.currentPL': 'Current P&L',
        'sessions.finalCashOutAmount': 'Final Cash-out Amount',
        'sessions.sessionNotesOptional': 'Session Notes (Optional)',
        'sessions.sessionNotesPlaceholder': 'Add any notes about the session...',
        'sessions.location': 'Location',
        'sessions.stakes': 'Stakes',
        'sessions.duration': 'Duration',
        'sessions.notes': 'Notes',
        'sessions.notesPlaceholder': 'Any additional notes about this session...',
        'sessions.addTransaction': 'Add Transaction',
        'sessions.transactionType': 'Transaction Type',
        'sessions.amount': 'Amount',
        'sessions.currency': 'Currency',
        'sessions.endSession': 'End Session',
        'sessions.endingSession': 'Ending Session...',
        'common.cancel': 'Cancel',
        'sessions.status.active': 'Active',
        'sessions.status.completed': 'Completed',
        'sessions.status.cancelled': 'Cancelled',
        'sessions.transactionTypes.buyIn': 'Buy-in',
        'sessions.transactionTypes.rebuy': 'Rebuy',
        'sessions.transactionTypes.addOn': 'Add On',
        'sessions.transactionTypes.cashOut': 'Cash Out',
        'sessions.transactionTypes.tip': 'Tip',
        'sessions.transactionTypes.rakeback': 'Rakeback',
        'sessions.transactionTypes.bonus': 'Bonus',
        'sessions.transactionTypes.other': 'Other',
        'sessions.durationHours': '{{hours}}h {{minutes}}m',
        'sessions.durationMinutes': '{{minutes}}m',
        'statistics.pageTitle': 'Performance Statistics',
        'statistics.pageSubtitle':
          'Detailed analysis of your poker performance and trends',
        'statistics.loadError': 'Failed to load statistics',
        'statistics.noDataAvailable': 'No data available',
        'statistics.notAvailable': 'N/A',
        'statistics.zeroHours': '0h',
        'statistics.totalSessions': 'Total Sessions',
        'statistics.winRate': 'Win Rate',
        'statistics.totalProfitLoss': 'Total Profit/Loss',
        'statistics.totalHours': 'Total Hours',
        'statistics.averageSessionDuration': 'Average Session Duration',
        'statistics.averageProfitPerSession': 'Average Profit per Session',
        'statistics.averageSessionValue': 'Average Session Value',
        'statistics.bestSession': 'Best Session',
        'statistics.worstSession': 'Worst Session',
        'statistics.recentMonthlyPerformance': 'Recent Monthly Performance',
        'statistics.sessionsLabel': 'Sessions:',
        'statistics.profit': 'Profit:',
        'statistics.winRateLabel': 'Win Rate:',
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en',
      changeLanguage: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
}));

// Suppress console warnings in tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };

  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('Error:'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
