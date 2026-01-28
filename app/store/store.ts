import { create } from 'zustand';
import { User } from '@/app/types/user';

// a store for definging who the current user is
interface UserStore {
  user: User;
  setUser: (user: User) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
