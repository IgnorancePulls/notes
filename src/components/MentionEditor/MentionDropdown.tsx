import { useEffect, useMemo, useRef } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import type { User } from '@/types/user';
import { useUsers } from '@/hooks/useUsers';

interface MentionDropdownProps {
  query: string;
  position: { top: number; left: number };
  highlightedIndex: number;
  onSelect: (user: User) => void;
}

export const MentionDropdown = ({
  query,
  position,
  highlightedIndex,
  onSelect,
}: MentionDropdownProps) => {
  console.log('MentionDropdown')
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { users, loading, error } = useUsers();

  const filteredUsers = useMemo(() => {
    if (!users) return [];

    const lowerQuery = query.toLowerCase();

    const matches = users.filter(
      (user) =>
        user.username.toLowerCase().includes(lowerQuery) ||
        user.first_name.toLowerCase().includes(lowerQuery) ||
        user.last_name.toLowerCase().includes(lowerQuery)
    );

    const sorted = matches.sort((a, b) => {
      const aUsername = a.username.toLowerCase().startsWith(lowerQuery);
      const bUsername = b.username.toLowerCase().startsWith(lowerQuery);
      if (aUsername && !bUsername) return -1;
      if (!aUsername && bUsername) return 1;
      return 0;
    });

    return sorted.slice(0, 5);
  }, [users, query]);

  useEffect(() => {
    const highlightedEl = dropdownRef.current?.children[highlightedIndex] as HTMLElement;
    highlightedEl?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  return (
    <div
      ref={dropdownRef}
      className="absolute bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50 w-64"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {loading && (
        <div className="p-4 text-center">
          <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-2">Loading users...</p>
        </div>
      )}

      {error && (
        <div className="p-4 text-center">
          <p className="text-sm text-gray-700">Oops, users went for coffee</p>
          <p className="text-xs text-gray-500 mt-1">Try typing @ again</p>
        </div>
      )}

      {!loading && !error && filteredUsers.length === 0 && (
        <div className="p-4 text-sm text-gray-500 text-center">No users found</div>
      )}

      {!loading &&
        !error &&
        filteredUsers.map((user, index) => (
          <div
            key={user.username}
            onClick={() => onSelect(user)}
            className={`px-4 py-2 cursor-pointer transition-colors ${
              index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
          >
            <div className="font-medium text-sm">@{user.username}</div>
            <div className="text-xs text-gray-600">
              {user.first_name} {user.last_name}
            </div>
          </div>
        ))}
    </div>
  );
};
