import { render, screen } from '@testing-library/react';
import { Header } from '../Header';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { SessionProvider } from '../providers/SessionProvider';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <LanguageProvider>
      <SessionProvider>{component}</SessionProvider>
    </LanguageProvider>
  );
};

describe('Header Component', () => {
  it('renders without crashing', () => {
    renderWithProviders(<Header />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders the logo', () => {
    renderWithProviders(<Header />);
    const logo = screen.getByText(/poker tracker/i);

    expect(logo).toBeInTheDocument();
  });

  it('has proper navigation structure', () => {
    renderWithProviders(<Header />);
    const nav = screen.getByRole('navigation');

    expect(nav).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
    expect(screen.getByText('Statistics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders login link', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument();
  });
});
