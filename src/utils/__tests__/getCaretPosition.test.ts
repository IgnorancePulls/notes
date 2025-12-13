import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCaretPosition } from '../getCaretPosition';

describe('getCaretPosition', () => {
  let mockRange: Partial<Range>;
  let mockSelection: Partial<Selection>;
  let mockEditorRef: React.RefObject<HTMLDivElement>;
  let mockEditorDiv: HTMLDivElement;

  const createMockRect = (
    top: number,
    left: number,
    bottom: number,
    right: number
  ): DOMRect => ({
    top,
    left,
    bottom,
    right,
    width: right - left,
    height: bottom - top,
    x: left,
    y: top,
    toJSON: () => ({}),
  });

  beforeEach(() => {
    mockEditorDiv = document.createElement('div');
    mockEditorDiv.getBoundingClientRect = vi.fn(() =>
      createMockRect(100, 50, 300, 450)
    );

    mockEditorRef = { current: mockEditorDiv };

    mockRange = {
      getBoundingClientRect: vi.fn(() => createMockRect(120, 100, 140, 150)),
    };

    mockSelection = {
      rangeCount: 1,
      getRangeAt: vi.fn(() => mockRange as Range),
    };

    window.getSelection = vi.fn(() => mockSelection as Selection);
  });

  it('should return default position when no selection', () => {
    window.getSelection = vi.fn(() => null);
    const result = getCaretPosition(mockEditorRef);
    expect(result).toEqual({ top: 0, left: 0 });
  });

  it('should return default position when rangeCount is 0', () => {
    mockSelection = {
      rangeCount: 0,
      getRangeAt: vi.fn(() => mockRange as Range),
    };
    window.getSelection = vi.fn(() => mockSelection as Selection);
    const result = getCaretPosition(mockEditorRef);
    expect(result).toEqual({ top: 0, left: 0 });
  });

  it('should return default position when editorRef.current is null', () => {
    const nullRef = { current: null };
    const result = getCaretPosition(nullRef);
    expect(result).toEqual({ top: 0, left: 0 });
  });

  it('should calculate position relative to editor', () => {
    const result = getCaretPosition(mockEditorRef);
    expect(result).toEqual({ top: 44, left: 50 });
  });

  it('should return default position for empty editor (zero dimensions)', () => {
    mockRange.getBoundingClientRect = vi.fn(() => createMockRect(0, 0, 0, 0));

    const result = getCaretPosition(mockEditorRef);
    expect(result).toEqual({ top: 40, left: 20 });
  });

  it('should handle caret at different positions', () => {
    mockRange.getBoundingClientRect = vi.fn(() => createMockRect(200, 300, 220, 350));

    const result = getCaretPosition(mockEditorRef);
    expect(result).toEqual({ top: 124, left: 250 });
  });
});
