import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@/types/user';
import { useUsers } from '@/hooks/useUsers';
import { MentionDropdown } from './MentionDropdown';
import { MENTION_TRIGGER, EMPTY_SPACES_CHAR_CODES } from '@/constants/mentions';
import { Keys } from '@/constants/keyboard';

import { filterUsers, getCaretPosition, getTextBeforeCaret, getQueryFromText } from '@/utils';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const { users, refetch } = useUsers();

  const filteredUsers = useMemo(() => filterUsers(users, query), [users, query]);

  useEffect(() => {
    if (!editorRef.current || editorRef.current.innerHTML) return;

    if (defaultValue) {
      editorRef.current.innerHTML = defaultValue;
    }
  }, [defaultValue]);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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

  const insertMention = useCallback(
    (user: User) => {
      const selection = window.getSelection();
      if (!selection || !editorRef.current) return;

      const range = selection.getRangeAt(0);
      const textBeforeCaret = getTextBeforeCaret();
      const atIndex = textBeforeCaret.lastIndexOf(MENTION_TRIGGER);
      const deleteCount = textBeforeCaret.length - atIndex;

      range.setStart(range.startContainer, range.startOffset - deleteCount);
      range.deleteContents();

      const mentionSpan = document.createElement('span');
      mentionSpan.className =
        'mention inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium mx-0.5';
      mentionSpan.contentEditable = 'false';
      mentionSpan.setAttribute('data-username', user.username);
      mentionSpan.textContent = `${MENTION_TRIGGER}${user.username}`;

      range.insertNode(mentionSpan);

      const spaceNode = document.createTextNode('\u00A0');
      range.setStartAfter(mentionSpan);
      range.insertNode(spaceNode);

      range.setStartAfter(spaceNode);
      range.setEndAfter(spaceNode);
      selection.removeAllRanges();
      selection.addRange(range);

      setIsDropdownOpen(false);
      onChange(editorRef.current.innerHTML);
    },
    [onChange]
  );

  const handleBackspaceMentionDeletion = useCallback(
    (e: React.KeyboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      if (!range.collapsed) return;

      const container = range.startContainer;
      let previousNode: Node | null = null;

      if (container.nodeType === Node.TEXT_NODE && range.startOffset === 0) {
        previousNode = container.previousSibling;
      } else if (container.nodeType === Node.ELEMENT_NODE) {
        const element = container as Element;
        if (range.startOffset > 0) {
          previousNode = element.childNodes[range.startOffset - 1];
        }
      }

      if (
        previousNode &&
        previousNode.nodeType === Node.ELEMENT_NODE &&
        (previousNode as Element).classList.contains('mention')
      ) {
        e.preventDefault();
        previousNode.parentNode?.removeChild(previousNode);
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
        }
      }
    },
    [onChange]
  );

  const handleArrowDown = (e: React.KeyboardEvent) => {
        e.preventDefault();
      const maxIndex = filteredUsers.length - 1;

      setHighlightedIndex((prev) => Math.min(prev + 1, maxIndex));
    }

  const handleArrowUp =  (e: React.KeyboardEvent) => {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleEscape = (e: React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDropdownOpen(false);
  }

  const handleBackspaceWhenOpen = () => {
      const textBeforeCaret = getTextBeforeCaret();
      if (textBeforeCaret.endsWith(MENTION_TRIGGER)) {
          setIsDropdownOpen(false);
      }
  }

  const handleEnter =  (e: React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (filteredUsers[highlightedIndex]) {
          insertMention(filteredUsers[highlightedIndex]);
      }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!isDropdownOpen) {
          if (e.key === Keys.BACKSPACE) {
              handleBackspaceMentionDeletion(e);
          }
          return;
      }

      switch (e.key) {
          case Keys.ARROW_DOWN:
              handleArrowDown(e);
              break;
          case Keys.ARROW_UP:
              handleArrowUp(e);
              break;
          case Keys.ESCAPE:
              handleEscape(e);
              break;
          case Keys.BACKSPACE:
              handleBackspaceWhenOpen();
              break;
          case Keys.ENTER:
              handleEnter(e);
              break;
      }
  }

  const handleBeforeInput = (e: React.FormEvent<HTMLDivElement>) => {
      const inputEvent = e.nativeEvent as InputEvent;

      if(inputEvent.data === MENTION_TRIGGER && isDropdownOpen) {
       setIsDropdownOpen(false);
       return;
    }

      if(inputEvent.data === MENTION_TRIGGER) {
          const textBeforeCaret = getTextBeforeCaret();
          const lastChar = textBeforeCaret.charCodeAt(textBeforeCaret.length - 1);

          if(textBeforeCaret === ''  || EMPTY_SPACES_CHAR_CODES.includes(lastChar)) {
              setDropdownPosition(getCaretPosition(editorRef));
              setIsDropdownOpen(true);
              setQuery('');
              setHighlightedIndex(0);
              refetch();
          }
      }
  }

  return (
    <div className="relative">
      <div
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
          query={query}
          position={dropdownPosition}
          highlightedIndex={highlightedIndex}
          onSelect={insertMention}
        />
      )}
    </div>
  );
};
