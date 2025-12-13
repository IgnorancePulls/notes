import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTextBeforeCaret } from '../getTextBeforeCaret';

describe('getTextBeforeCaret', () => {
  let mockRange: any;
  let mockSelection: any;

  beforeEach(() => {
    // Reset mocks before each test
    mockRange = {
      startContainer: document.createTextNode('hello world'),
      startOffset: 5,
      cloneRange: vi.fn(),
      selectNodeContents: vi.fn(),
      setEnd: vi.fn(),
      toString: vi.fn(() => 'hello'),
    };

    mockRange.cloneRange.mockReturnValue(mockRange);

    mockSelection = {
      rangeCount: 1,
      getRangeAt: vi.fn(() => mockRange),
    };

    window.getSelection = vi.fn(() => mockSelection as any);
  });

  it('should return empty string when no selection', () => {
    window.getSelection = vi.fn(() => null);
    expect(getTextBeforeCaret()).toBe('');
  });

  it('should return empty string when rangeCount is 0', () => {
    mockSelection.rangeCount = 0;
    expect(getTextBeforeCaret()).toBe('');
  });

  it('should return text before caret', () => {
    const result = getTextBeforeCaret();
    expect(mockRange.cloneRange).toHaveBeenCalled();
    expect(mockRange.selectNodeContents).toHaveBeenCalledWith(mockRange.startContainer);
    expect(mockRange.setEnd).toHaveBeenCalledWith(mockRange.startContainer, 5);
    expect(result).toBe('hello');
  });

  it('should handle caret at beginning of text (offset 0)', () => {
    mockRange.startOffset = 0;
    mockRange.toString = vi.fn(() => '');
    const result = getTextBeforeCaret();
    expect(result).toBe('');
  });

  it('should handle caret at end of text', () => {
    const textNode = document.createTextNode('complete text');
    mockRange.startContainer = textNode;
    mockRange.startOffset = 13;
    mockRange.toString = vi.fn(() => 'complete text');
    const result = getTextBeforeCaret();
    expect(result).toBe('complete text');
  });

  it('should work with empty text node', () => {
    mockRange.startContainer = document.createTextNode('');
    mockRange.startOffset = 0;
    mockRange.toString = vi.fn(() => '');
    const result = getTextBeforeCaret();
    expect(result).toBe('');
  });
});
