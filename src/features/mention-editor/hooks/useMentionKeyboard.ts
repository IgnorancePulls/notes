import { useCallback } from 'react';

import type { User } from '@/types/user';

import { Keys, MENTION_TRIGGER } from '../constants';
import { getTextBeforeCaret } from '../utils/getTextBeforeCaret';

interface UseMentionKeyboardProps {
  isDropdownOpen: boolean;
  filteredUsers: User[];
  highlightedIndex: number;
  setHighlightedIndex: React.Dispatch<React.SetStateAction<number>>;
  setIsDropdownOpen: (open: boolean) => void;
  insertMention: (user: User) => void;
  handleBackspaceMentionDeletion: (e: React.KeyboardEvent) => void;
}

export const useMentionKeyboard = ({
  isDropdownOpen,
  filteredUsers,
  highlightedIndex,
  setHighlightedIndex,
  setIsDropdownOpen,
  insertMention,
  handleBackspaceMentionDeletion,
}: UseMentionKeyboardProps) => {
  const handleArrowDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      const maxIndex = filteredUsers.length - 1;
      setHighlightedIndex((prev) => Math.min(prev + 1, maxIndex));
    },
    [filteredUsers.length, setHighlightedIndex]
  );

  const handleArrowUp = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    },
    [setHighlightedIndex]
  );

  const handleEscape = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDropdownOpen(false);
    },
    [setIsDropdownOpen]
  );

  const handleBackspaceWhenOpen = useCallback(() => {
    const textBeforeCaret = getTextBeforeCaret();
    if (textBeforeCaret.endsWith(MENTION_TRIGGER)) {
      setIsDropdownOpen(false);
    }
  }, [setIsDropdownOpen]);

  const handleEnter = useCallback(
    (e: React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (filteredUsers[highlightedIndex]) {
        insertMention(filteredUsers[highlightedIndex]);
      }
    },
    [filteredUsers, highlightedIndex, insertMention]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
    },
    [
      isDropdownOpen,
      handleArrowDown,
      handleArrowUp,
      handleEscape,
      handleBackspaceWhenOpen,
      handleEnter,
      handleBackspaceMentionDeletion,
    ]
  );

  return { handleKeyDown };
};
