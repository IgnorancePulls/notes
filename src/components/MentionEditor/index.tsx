import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@/types/user';
import { useUsers } from '@/hooks/useUsers';
import { MentionDropdown } from './MentionDropdown';
import { MENTION_TRIGGER, EMPTY_SPACES_CHAR_CODES } from '@/constants/mentions';
import {
  getCaretPosition,
  getTextBeforeCaret,
  shouldTriggerMention,
  getQueryFromText,
} from './mentionUtils';

interface MentionEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

export const MentionEditor = ({
  value,
  onChange,
  placeholder = 'Start writing...',
  className = '',
}: MentionEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const { users, refetch } = useUsers();

  const filteredUsersCount = users
    ? users.filter(
        (u) =>
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.first_name.toLowerCase().includes(query.toLowerCase()) ||
          u.last_name.toLowerCase().includes(query.toLowerCase())
      ).length
    : 0;
  const maxIndex = Math.min(filteredUsersCount, 5) - 1;

  // Update editor content when value prop changes (from parent component, not from user input)
  useEffect(() => {
    if (!editorRef.current) return;

    // Only update if the content is different (to avoid disrupting user input)
    if (editorRef.current.innerHTML !== value) {
      const selection = window.getSelection();
      const hadFocus = document.activeElement === editorRef.current;

      // Save cursor position
      let cursorOffset = 0;
      if (selection && selection.rangeCount > 0 && hadFocus) {
        const range = selection.getRangeAt(0);
        cursorOffset = range.startOffset;
      }

      // Update content
      editorRef.current.innerHTML = value;

      // Restore cursor position if editor had focus
      if (hadFocus && editorRef.current.firstChild) {
        const newRange = document.createRange();
        const sel = window.getSelection();

        try {
          const textNode = editorRef.current.firstChild;
          const maxOffset = textNode.textContent?.length || 0;
          newRange.setStart(textNode, Math.min(cursorOffset, maxOffset));
          newRange.collapse(true);
          sel?.removeAllRanges();
          sel?.addRange(newRange);
        } catch (e) {
          // If cursor restoration fails, just focus the editor
          editorRef.current.focus();
        }
      }
    }
  }, [value]);

  // const handleBeforeInput = useCallback((e: React.CompositionEvent<HTMLDivElement>) => {
  //   if(e.data === MENTION_TRIGGER && !isDropdownOpen) {
  //     setIsDropdownOpen(false);
  //   }
  //   if (e.data === MENTION_TRIGGER && !isDropdownOpen) {
  //     console.log('handleBeforeInput @ detected', isDropdownOpen);
  //
  //     const textBeforeCaret = getTextBeforeCaret();
  //     // console.log('textBeforeCaret=', textBeforeCaret)
  //     // console.log('textBeforeCaret === ""', textBeforeCaret === '');
  //     // console.log('textBeforeCaret.endsWith(" ")', textBeforeCaret.endsWith(' '));
  //     // console.log('textBeforeCaret.endsWith("\\n")', textBeforeCaret.endsWith('\n'));
  //
  //
  //     console.log('last char code:', textBeforeCaret.charCodeAt(textBeforeCaret.length - 1));
  //     const lastChar = textBeforeCaret.charCodeAt(textBeforeCaret.length - 1);
  //
  //     if ((textBeforeCaret === ''  || EMPTY_SPACES_CHAR_CODES.includes(lastChar)) &&  !isDropdownOpen) {
  //
  //       setDropdownPosition(getCaretPosition(editorRef));
  //       console.log('set dropdown open!!!!');
  //       setIsDropdownOpen(true);
  //       setQuery('');
  //       setHighlightedIndex(0);
  //       refetch();
  //     }
  //   }
  // }, [ refetch, isDropdownOpen ]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;

    // If dropdown is open, update the query
    console.log('handleInput, isDropdownOpen=', isDropdownOpen);

    if (isDropdownOpen) {
      const textBeforeCaret = getTextBeforeCaret();

      // if (shouldTriggerMention(textBeforeCaret)) {
      //   const newQuery = getQueryFromText(textBeforeCaret);
      //   setQuery(newQuery);
      //   setHighlightedIndex(0);
      // } else {
      //   setIsDropdownOpen(false);
      // }

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
      const atIndex = textBeforeCaret.lastIndexOf('@');
      const deleteCount = textBeforeCaret.length - atIndex;

      range.setStart(range.startContainer, range.startOffset - deleteCount);
      range.deleteContents();

      const mentionSpan = document.createElement('span');
      mentionSpan.className =
        'mention inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium mx-0.5';
      mentionSpan.contentEditable = 'false';
      mentionSpan.setAttribute('data-username', user.username);
      mentionSpan.textContent = `@${user.username}`;

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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      console.log('handleKeyDown')
      if (!isDropdownOpen) {
        if (e.key === 'Backspace') {
          const selection = window.getSelection();
          console.log('selection', selection);
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
        }
        return;
      }

      switch (e.key) {
        case 'Backspace':
          const textBeforeCaret = getTextBeforeCaret();
          if (textBeforeCaret.endsWith('@')) {
            setIsDropdownOpen(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          setIsDropdownOpen(false);
          break;

        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) => Math.min(prev + 1, maxIndex));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => Math.max(prev - 1, 0));
          break;

        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          if (users && maxIndex >= 0) {
            const lowerQuery = query.toLowerCase();
            const filtered = users
              .filter(
                (u) =>
                  u.username.toLowerCase().includes(lowerQuery) ||
                  u.first_name.toLowerCase().includes(lowerQuery) ||
                  u.last_name.toLowerCase().includes(lowerQuery)
              )
              .sort((a, b) => {
                const aUsername = a.username.toLowerCase().startsWith(lowerQuery);
                const bUsername = b.username.toLowerCase().startsWith(lowerQuery);
                if (aUsername && !bUsername) return -1;
                if (!aUsername && bUsername) return 1;
                return 0;
              })
              .slice(0, 5);

            if (filtered[highlightedIndex]) {
              insertMention(filtered[highlightedIndex]);
            }
          }
          break;
      }
    },
    [isDropdownOpen, maxIndex, users, query, highlightedIndex, insertMention, onChange]
  );

  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsDropdownOpen(false);
    }, 150);
  }, []);

  const handleMentionSelect = useCallback(
    (user: User) => {
      insertMention(user);
    },
    [insertMention]
  );


  const handleBeforeInput = (e) => {
    if(e.data === MENTION_TRIGGER && isDropdownOpen) {
      return setIsDropdownOpen(false);
    }

    if (e.data === MENTION_TRIGGER) {
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
        // onInput={handleInputTest}
        onKeyDown={handleKeyDown}
        // onBlur={handleBlur}
        // suppressContentEditableWarning
        data-placeholder={placeholder}
        className={`w-full min-h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${className}`}
      />

      {isDropdownOpen && (
        <MentionDropdown
          query={query}
          position={dropdownPosition}
          highlightedIndex={highlightedIndex}
          onSelect={handleMentionSelect}
        />
      )}
    </div>
  );
};
