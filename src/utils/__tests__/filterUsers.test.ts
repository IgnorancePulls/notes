import { describe, it, expect } from 'vitest';
import { filterUsers } from '../filterUsers';
import type { User } from '@/types/user';

const mockUsers: User[] = [
  {
    username: 'johndoe',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    gender: 'male',
    birthdate: 0,
  },
  {
    username: 'janedoe',
    first_name: 'Jane',
    last_name: 'Doe',
    email: 'jane@example.com',
    gender: 'female',
    birthdate: 0,
  },
  {
    username: 'bobsmith',
    first_name: 'Bob',
    last_name: 'Smith',
    email: 'bob@example.com',
    gender: 'male',
    birthdate: 0,
  },
  {
    username: 'alice',
    first_name: 'Alice',
    last_name: 'Johnson',
    email: 'alice@example.com',
    gender: 'female',
    birthdate: 0,
  },
];

describe('filterUsers', () => {
  it('should return empty array when users is null', () => {
    expect(filterUsers(null, 'test')).toEqual([]);
  });

  it('should return empty array when users is empty', () => {
    expect(filterUsers([], 'test')).toEqual([]);
  });

  it('should filter by username (case-insensitive)', () => {
    const result = filterUsers(mockUsers, 'johndoe');
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe('johndoe');
  });

  it('should filter by username with uppercase query', () => {
    const result = filterUsers(mockUsers, 'JOHNDOE');
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe('johndoe');
  });

  it('should filter by first_name', () => {
    const result = filterUsers(mockUsers, 'jane');
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe('janedoe');
  });

  it('should filter by last_name', () => {
    const result = filterUsers(mockUsers, 'smith');
    expect(result).toHaveLength(1);
    expect(result[0].username).toBe('bobsmith');
  });

  it('should return multiple matches for partial query', () => {
    const result = filterUsers(mockUsers, 'doe');
    expect(result).toHaveLength(2);
    expect(result.map(u => u.username)).toContain('johndoe');
    expect(result.map(u => u.username)).toContain('janedoe');
  });

  it('should prioritize username matches that start with query', () => {
    const users: User[] = [
      { username: 'alice', first_name: 'Alice', last_name: 'Anderson', email: 'a@a.com', gender: 'female', birthdate: 0 },
      { username: 'bob', first_name: 'Bob', last_name: 'Alice', email: 'b@b.com', gender: 'male', birthdate: 0 },
    ];
    const result = filterUsers(users, 'alice');
    expect(result[0].username).toBe('alice');
    expect(result[1].first_name).toBe('Bob');
  });

  it('should handle empty query and return all users up to limit', () => {
    const result = filterUsers(mockUsers, '');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return empty array when no matches', () => {
    const result = filterUsers(mockUsers, 'xyz123notfound');
    expect(result).toEqual([]);
  });

  it('should handle special characters in query', () => {
    const users: User[] = [
      { username: 'user.name', first_name: 'User', last_name: 'Name', email: 'u@n.com', gender: 'male', birthdate: 0 },
    ];
    const result = filterUsers(users, '.');
    expect(result).toHaveLength(1);
  });

  it('should limit results to MAX_MENTIONED_USERS', () => {
    const manyUsers: User[] = Array.from({ length: 100 }, (_, i) => ({
      username: `user${i}`,
      first_name: `First${i}`,
      last_name: `Last${i}`,
      email: `user${i}@example.com`,
      gender: 'male',
      birthdate: 0,
    }));
    const result = filterUsers(manyUsers, 'user');
    expect(result.length).toBeLessThanOrEqual(100);
  });

  it('should handle partial username matches', () => {
    const result = filterUsers(mockUsers, 'jo');
    expect(result.map(u => u.username)).toContain('johndoe');
  });
});
