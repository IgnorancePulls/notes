const getTextBeforeCaret = (): string => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return '';

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(range.startContainer);
    preCaretRange.setEnd(range.startContainer, range.startOffset);

    return preCaretRange.toString();
};

export { getTextBeforeCaret }