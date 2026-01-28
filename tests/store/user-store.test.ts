import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from '@/app/store/store';

describe('useUserStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useUserStore.setState({ user: null });
  });

  it('should have null user by default', () => {
    const { user } = useUserStore.getState();
    expect(user).toBeNull();
  });

  it('should set user correctly', () => {
    const mockUser = {
      id: '123',
      githubId: '456',
      name: 'Test User',
      email: 'test@example.com',
      image: 'https://example.com/avatar.png',
    };

    useUserStore.getState().setUser(mockUser);

    const { user } = useUserStore.getState();
    expect(user).toEqual(mockUser);
  });

  it('should update user with partial data', () => {
    const mockUser = {
      id: '123',
      githubId: '456',
      name: null,
      email: null,
      image: null,
    };

    useUserStore.getState().setUser(mockUser);

    const { user } = useUserStore.getState();
    expect(user).toEqual(mockUser);
    expect(user?.name).toBeNull();
  });

  it('should clear user when set to null', () => {
    const mockUser = {
      id: '123',
      githubId: '456',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
    };

    useUserStore.getState().setUser(mockUser);
    expect(useUserStore.getState().user).not.toBeNull();

    useUserStore.getState().setUser(null);
    expect(useUserStore.getState().user).toBeNull();
  });
});
