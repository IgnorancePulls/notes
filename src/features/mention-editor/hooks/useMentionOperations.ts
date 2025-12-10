import { useCallback, type RefObject } from 'react';

import type { User } from '@/types/user';

import { MENTION_TRIGGER } from '../constants';
import { getTextBeforeCaret } from '../utils/getTextBeforeCaret';

interface UseMentionOperationsProps {
  editorRef: RefObject<HTMLDivElement | null>;
  onChange: (html: string) => void;
  onMentionInserted?: () => void;
}

export const useMentionOperations = ({
  editorRef,
  onChange,
  onMentionInserted,
}: UseMentionOperationsProps) => {
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
      mentionSpan.setAttribute('data-cy', 'mention');
      mentionSpan.textContent = `${MENTION_TRIGGER}${user.username}`;

      range.insertNode(mentionSpan);

      const spaceNode = document.createTextNode('\u00A0');
      range.setStartAfter(mentionSpan);
      range.insertNode(spaceNode);

      range.setStartAfter(spaceNode);
      range.setEndAfter(spaceNode);
      selection.removeAllRanges();
      selection.addRange(range);

      onMentionInserted?.();
      onChange(editorRef.current.innerHTML);
    },
    [editorRef, onChange, onMentionInserted]
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
    [editorRef, onChange]
  );

  return {
    insertMention,
    handleBackspaceMentionDeletion,
  };
};
