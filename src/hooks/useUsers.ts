import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import type { User } from '@/types/user';

let cachedUsers: User[] | null = null;
let fetchPromise: Promise<User[]> | null = null;

interface UseUsersReturn {
  users: User[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useUsers = (): UseUsersReturn => {
  const [users, setUsers] = useState<User[] | null>(cachedUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async () => {
    if (cachedUsers) {
      setUsers(cachedUsers);
      return;
    }

    if (fetchPromise) {
      try {
        const result = await fetchPromise;
        setUsers(result);
      } catch (err) {
        setError(err as Error);
      }
      return;
    }

    setLoading(true);
    setError(null);

    fetchPromise = axios
      .get<User[]>('https://challenge.surfe.com/users')
      .then(response => response.data);

    try {
      const result = await fetchPromise;
      cachedUsers = result;
      setUsers(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
      fetchPromise = null;
    }
  }, []);

  const refetch = useCallback(() => {
    cachedUsers = null;
    fetchPromise = null;
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch };
};
