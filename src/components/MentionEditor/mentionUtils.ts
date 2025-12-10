export const getCaretPosition = (
  editorRef: React.RefObject<HTMLDivElement | null>
): { top: number; left: number } => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || !editorRef.current) {
    return { top: 0, left: 0 };
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  const editorRect = editorRef.current.getBoundingClientRect();

  return {
    top: rect.bottom - editorRect.top + 4,
    left: rect.left - editorRect.left,
  };
};

export const getTextBeforeCaret = (): string => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return '';

  const range = selection.getRangeAt(0);
  const preCaretRange = range.cloneRange();
  preCaretRange.selectNodeContents(range.startContainer);
  preCaretRange.setEnd(range.startContainer, range.startOffset);

  return preCaretRange.toString();
};

export const shouldTriggerMention = (textBeforeCaret: string): boolean => {
  const lastAtIndex = textBeforeCaret.lastIndexOf('@');
  if (lastAtIndex === -1) return false;

  const charBeforeAt = textBeforeCaret[lastAtIndex - 1];
  if (lastAtIndex > 0 && charBeforeAt !== ' ' && charBeforeAt !== '\n') {
    return false;
  }

  const textAfterAt = textBeforeCaret.slice(lastAtIndex + 1);
  if (textAfterAt.includes(' ')) {
    return false;
  }

  return true;
};

export const getQueryFromText = (textBeforeCaret: string): string => {
  const lastAtIndex = textBeforeCaret.lastIndexOf('@');
  if (lastAtIndex === -1) return '';
  return textBeforeCaret.slice(lastAtIndex + 1);
};
