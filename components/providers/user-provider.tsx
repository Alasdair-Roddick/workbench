'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/app/store/store';
import { getLoggedUser } from '@/components/actions';

export function UserProvider({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    getLoggedUser().then((user) => {
      setUser(user);
    });
  }, [setUser]);

  return <>{children}</>;
}
