const getCaretPosition = (
    editorRef: React.RefObject<HTMLDivElement | null>
): { top: number; left: number } => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) {
        return { top: 0, left: 0 };
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editorRef.current.getBoundingClientRect();
    // console.log('rect', rect);
    // console.log('editorRect', editorRect);

    // If range has no dimensions (empty editor), use a default position
    if (rect.height === 0 && rect.width === 0) {
        return { top: 40, left: 20 };
    }

    return {
        top: rect.bottom - editorRect.top + 4,
        left: rect.left - editorRect.left,
    };
};

export { getCaretPosition };