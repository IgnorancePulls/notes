import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { forwardRef } from 'react';

import type { User } from '@/types/user';

interface MentionDropdownProps {
  users: User[];
  loading: boolean;
  error: Error | null;
  position: { top: number; left: number };
  highlightedIndex: number;
  onSelect: (user: User) => void;
}

export const MentionDropdown = forwardRef<HTMLDivElement, MentionDropdownProps>(
  ({ users, loading, error, position, highlightedIndex, onSelect }, ref) => {
    return (
      <div
        ref={ref}
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

      {!loading && !error && users.length === 0 && (
        <div className="p-4 text-sm text-gray-500 text-center">No users found</div>
      )}

      {!loading && !error && users.length > 0 && (
        <ul role="listbox" data-cy="mention-dropdown" className="list-none p-0 m-0">
          {users.map((user, index) => (
            <li
              key={user.username}
              role="option"
              data-cy="mention-option"
              aria-selected={index === highlightedIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(user);
              }}
              className={`px-4 py-2 cursor-pointer transition-colors ${
                index === highlightedIndex ? 'bg-blue-100' : 'hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-sm">@{user.username}</div>
              <div className="text-xs text-gray-600">
                {user.first_name} {user.last_name}
              </div>
            </li>
          ))}
        </ul>
      )}
      </div>
    );
  }
);

MentionDropdown.displayName = 'MentionDropdown';
