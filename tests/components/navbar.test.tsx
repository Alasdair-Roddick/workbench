import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '@/components/navbar';
import { useUserStore } from '@/app/store/store';

// Mock the actions
const mockHandleLogin = vi.fn();
vi.mock('@/components/actions', () => ({
  handleLogin: () => mockHandleLogin(),
}));

// Mock UserDropdown
vi.mock('@/components/dropdown', () => ({
  UserDropdown: () => <div data-testid="user-dropdown">User Dropdown</div>,
}));

describe('Navbar', () => {
  beforeEach(() => {
    useUserStore.setState({ user: null });
    mockHandleLogin.mockClear();
  });

  it('renders the logo', () => {
    render(<Navbar />);

    expect(screen.getByText('Workbench')).toBeInTheDocument();
    expect(screen.getByText('W')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Navbar />);

    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /docs/i })).toBeInTheDocument();
  });

  it('shows login buttons when user is not logged in', () => {
    render(<Navbar />);

    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    expect(screen.queryByTestId('user-dropdown')).not.toBeInTheDocument();
  });

  it('shows user dropdown when user is logged in', () => {
    useUserStore.setState({
      user: {
        id: '123',
        githubId: '456',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
    });

    render(<Navbar />);

    expect(screen.getByTestId('user-dropdown')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /log in/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /get started/i })).not.toBeInTheDocument();
  });

  it('calls handleLogin when Log in button is clicked', () => {
    render(<Navbar />);

    const loginButton = screen.getByRole('button', { name: /log in/i });
    fireEvent.click(loginButton);

    expect(mockHandleLogin).toHaveBeenCalledTimes(1);
  });

  it('calls handleLogin when Get Started button is clicked', () => {
    render(<Navbar />);

    const getStartedButton = screen.getByRole('button', { name: /get started/i });
    fireEvent.click(getStartedButton);

    expect(mockHandleLogin).toHaveBeenCalledTimes(1);
  });

  it('has correct links', () => {
    render(<Navbar />);

    expect(screen.getByRole('link', { name: /workbench/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /projects/i })).toHaveAttribute('href', '/projects');
    expect(screen.getByRole('link', { name: /docs/i })).toHaveAttribute('href', '/docs');
  });
});
