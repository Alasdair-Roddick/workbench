import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppShell } from '@/components/app-shell';
import { useUserStore } from '@/app/store/store';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    main: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
      <main {...props}>{children}</main>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock child components
vi.mock('@/components/navbar', () => ({
  Navbar: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock('@/components/welcome-screen', () => ({
  WelcomeScreen: () => <div data-testid="welcome-screen">Welcome Screen</div>,
}));

describe('AppShell', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null });
  });

  it('renders welcome screen when user is not logged in', () => {
    render(<AppShell>Dashboard Content</AppShell>);

    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('navbar')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('renders navbar and children when user is logged in', () => {
    useUserStore.setState({
      user: {
        id: '123',
        githubId: '456',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
    });

    render(<AppShell>Dashboard Content</AppShell>);

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    expect(screen.queryByTestId('welcome-screen')).not.toBeInTheDocument();
  });

  it('switches from welcome screen to app when user logs in', () => {
    const { rerender } = render(<AppShell>Dashboard Content</AppShell>);

    expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();

    // Simulate user login
    useUserStore.setState({
      user: {
        id: '123',
        githubId: '456',
        name: 'Test User',
        email: null,
        image: null,
      },
    });

    rerender(<AppShell>Dashboard Content</AppShell>);

    expect(screen.queryByTestId('welcome-screen')).not.toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });
});
