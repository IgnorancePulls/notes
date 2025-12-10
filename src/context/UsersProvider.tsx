import axios from 'axios';
import { type ReactNode, useCallback, useEffect, useState } from 'react';

import { USERS_API_URL } from '@/constants/config';
import type { User } from '@/types/user';

import { UsersContext } from './usersContext';

interface UsersProviderProps {
  children: ReactNode;
}

export function UsersProvider({ children }: UsersProviderProps) {
  const [users, setUsers] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async (signal?: AbortSignal) => {
    if (users !== null) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<User[]>(USERS_API_URL, { signal });
      setUsers(response.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.code === 'ERR_CANCELED') {
        return;
      }
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [users]);

  const refetch = useCallback(() => {
    setUsers(null);
    setError(null);
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const abortController = new AbortController();
    fetchUsers(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fetchUsers]);

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        error,
        refetch,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}
