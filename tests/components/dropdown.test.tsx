import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserDropdown } from '@/components/dropdown';
import { useUserStore } from '@/app/store/store';

// Mock the actions
const mockHandleLogout = vi.fn();
vi.mock('@/components/actions', () => ({
  handleLogout: () => mockHandleLogout(),
}));

// Mock window.location
const mockLocation = { href: '' };
Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true,
});

describe('UserDropdown', () => {
  beforeEach(() => {
    mockHandleLogout.mockClear();
    mockHandleLogout.mockResolvedValue(undefined);
    mockLocation.href = '';
    useUserStore.setState({
      user: {
        id: '123',
        githubId: '456',
        name: 'Test User',
        email: 'test@example.com',
        image: 'https://example.com/avatar.png',
      },
    });
  });

  it('renders the avatar trigger button', () => {
    render(<UserDropdown />);

    const trigger = screen.getByRole('button');
    expect(trigger).toBeInTheDocument();
  });

  it('displays fallback initial when no image loads', () => {
    useUserStore.setState({
      user: {
        id: '123',
        githubId: '456',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
    });

    render(<UserDropdown />);

    // Fallback shows first letter of name
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('displays "U" fallback when no name or image', () => {
    useUserStore.setState({
      user: {
        id: '123',
        githubId: '456',
        name: null,
        email: null,
        image: null,
      },
    });

    render(<UserDropdown />);

    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('opens dropdown menu on click and shows user name', async () => {
    const user = userEvent.setup();
    render(<UserDropdown />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    // Radix UI renders menu content in a portal
    expect(await screen.findByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('shows Sign Out menu item when dropdown is open', async () => {
    const user = userEvent.setup();
    render(<UserDropdown />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    expect(await screen.findByRole('menuitem', { name: /sign out/i })).toBeInTheDocument();
  });

  it('displays "Account" label when user has no name', async () => {
    const user = userEvent.setup();
    useUserStore.setState({
      user: {
        id: '123',
        githubId: '456',
        name: null,
        email: null,
        image: null,
      },
    });

    render(<UserDropdown />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    expect(await screen.findByText('Account')).toBeInTheDocument();
  });

  it('calls handleLogout when Sign Out is clicked', async () => {
    const user = userEvent.setup();
    render(<UserDropdown />);

    const trigger = screen.getByRole('button');
    await user.click(trigger);

    const signOutItem = await screen.findByRole('menuitem', { name: /sign out/i });
    await user.click(signOutItem);

    expect(mockHandleLogout).toHaveBeenCalledTimes(1);
  });
});
