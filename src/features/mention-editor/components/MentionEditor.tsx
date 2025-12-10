import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useUsers } from '@/context/usersContext';

import { EMPTY_SPACES_CHAR_CODES, MENTION_TRIGGER } from '../constants';
import { useClickOutside, useMentionKeyboard, useMentionOperations } from '../hooks';
import { filterUsers } from '../utils/filterUsers';
import { getCaretPosition } from '../utils/getCaretPosition';
import { getQueryFromText } from '../utils/getQueryFromText';
import { getTextBeforeCaret } from '../utils/getTextBeforeCaret';
import { MentionDropdown } from './MentionDropdown';

interface MentionEditorProps {
  defaultValue?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const MentionEditor = ({
  defaultValue = '',
  onChange,
  placeholder = 'Start writing...',
  className = '',
}: MentionEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const { users, loading, error, refetch } = useUsers();

  const filteredUsers = useMemo(() => filterUsers(users, query), [users, query]);

  const { insertMention, handleBackspaceMentionDeletion } = useMentionOperations({
    editorRef,
    onChange,
    onMentionInserted: () => setIsDropdownOpen(false),
  });

  useEffect(() => {
    if (!editorRef.current || isInitialized.current) return;

    if (defaultValue) {
      editorRef.current.innerHTML = defaultValue;
    }
    isInitialized.current = true;
  }, [defaultValue]);

  useClickOutside({
    ref: dropdownRef,
    callback: () => setIsDropdownOpen(false),
    isActive: isDropdownOpen,
  });

  const { handleKeyDown } = useMentionKeyboard({
    isDropdownOpen,
    filteredUsers,
    highlightedIndex,
    setHighlightedIndex,
    setIsDropdownOpen,
    insertMention,
    handleBackspaceMentionDeletion,
  });

  const handleInput = useCallback(() => {
    if (!editorRef.current) {
        return
    }

    if (isDropdownOpen) {
      const textBeforeCaret = getTextBeforeCaret();
      const newQuery = getQueryFromText(textBeforeCaret);
      setQuery(newQuery);
      setHighlightedIndex(0);
    }

    onChange(editorRef.current.innerHTML);
  }, [isDropdownOpen, onChange]);

  const handleBeforeInput = (e: React.FormEvent<HTMLDivElement>) => {
      const inputEvent = e.nativeEvent as InputEvent;

      if (inputEvent.data !== MENTION_TRIGGER) return;

      if (isDropdownOpen) {
          setIsDropdownOpen(false);
          return;
      }

      const textBeforeCaret = getTextBeforeCaret();
      const lastChar = textBeforeCaret.charCodeAt(textBeforeCaret.length - 1);

      if (textBeforeCaret === '' || EMPTY_SPACES_CHAR_CODES.includes(lastChar)) {
          setDropdownPosition(getCaretPosition(editorRef));
          setIsDropdownOpen(true);
          setQuery('');
          setHighlightedIndex(0);
          refetch();
      }
  }

  return (
    <div className="relative">
      <div
          data-testid="mention-editor"
          data-cy="mention-editor-input"
        ref={editorRef}
        contentEditable
        onBeforeInput={handleBeforeInput}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        className={`w-full min-h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${className}`}
      />

      {isDropdownOpen && (
        <MentionDropdown
          ref={dropdownRef}
          users={filteredUsers}
          loading={loading}
          error={error}
          position={dropdownPosition}
          highlightedIndex={highlightedIndex}
          onSelect={insertMention}
        />
      )}
    </div>
  );
};
