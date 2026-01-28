import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WelcomeScreen } from '@/components/welcome-screen';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
    h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
      <h1 {...props}>{children}</h1>
    ),
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p {...props}>{children}</p>
    ),
  },
}));

// Mock the actions
const mockHandleLogin = vi.fn();
vi.mock('@/components/actions', () => ({
  handleLogin: () => mockHandleLogin(),
}));

describe('WelcomeScreen', () => {
  beforeEach(() => {
    mockHandleLogin.mockClear();
  });

  it('renders the welcome heading', () => {
    render(<WelcomeScreen />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome to');
    expect(screen.getByText('Workbench')).toBeInTheDocument();
  });

  it('renders the logo', () => {
    render(<WelcomeScreen />);

    expect(screen.getByText('W')).toBeInTheDocument();
  });

  it('renders the subheading text', () => {
    render(<WelcomeScreen />);

    expect(screen.getByText(/sign in to get started with your projects/i)).toBeInTheDocument();
  });

  it('renders the GitHub login button', () => {
    render(<WelcomeScreen />);

    const loginButton = screen.getByRole('button', { name: /continue with github/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('calls handleLogin when button is clicked', () => {
    render(<WelcomeScreen />);

    const loginButton = screen.getByRole('button', { name: /continue with github/i });
    fireEvent.click(loginButton);

    expect(mockHandleLogin).toHaveBeenCalledTimes(1);
  });

  it('renders the footer text', () => {
    render(<WelcomeScreen />);

    expect(screen.getByText(/secure authentication powered by github/i)).toBeInTheDocument();
  });
});

// Remove this redundant function. beforeEach is already imported from 'vitest' above.
