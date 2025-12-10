import { createContext, useContext } from 'react';

import type { User } from '@/types/user';

export interface UsersContextValue {
  users: User[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const UsersContext = createContext<UsersContextValue | null>(null);

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
}
