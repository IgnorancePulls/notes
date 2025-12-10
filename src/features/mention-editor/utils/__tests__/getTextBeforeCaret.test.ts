import { beforeEach,describe, expect, it, type Mock,vi } from 'vitest';

import { getTextBeforeCaret } from '../getTextBeforeCaret';

describe('getTextBeforeCaret', () => {
  let mockRange: Partial<Range> & {
    cloneRange: Mock<() => Range>;
    selectNodeContents: Mock<(node: Node) => void>;
    setEnd: Mock<(node: Node, offset: number) => void>;
    toString: Mock<() => string>;
  };
  let mockSelection: Partial<Selection> & {
    getRangeAt: Mock<(index: number) => Range>;
  };

  beforeEach(() => {
    // Reset mocks before each test
    mockRange = {
      startContainer: document.createTextNode('hello world'),
      startOffset: 5,
      cloneRange: vi.fn(() => null as unknown as Range),
      selectNodeContents: vi.fn(),
      setEnd: vi.fn(),
      toString: vi.fn(() => 'hello'),
    };

    mockRange.cloneRange.mockReturnValue(mockRange as Range);

    mockSelection = {
      rangeCount: 1,
      getRangeAt: vi.fn(() => mockRange as Range),
    };

    window.getSelection = vi.fn(() => mockSelection as Selection);
  });

  it('should return empty string when no selection', () => {
    window.getSelection = vi.fn(() => null);
    expect(getTextBeforeCaret()).toBe('');
  });

  it('should return empty string when rangeCount is 0', () => {
    mockSelection = {
      rangeCount: 0,
      getRangeAt: vi.fn(() => mockRange as Range),
    };
    window.getSelection = vi.fn(() => mockSelection as Selection);
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
    mockRange = {
      startContainer: document.createTextNode('hello world'),
      startOffset: 0,
      cloneRange: vi.fn(() => null as unknown as Range),
      selectNodeContents: vi.fn(),
      setEnd: vi.fn(),
      toString: vi.fn(() => ''),
    };
    mockRange.cloneRange.mockReturnValue(mockRange as Range);
    mockSelection.getRangeAt = vi.fn(() => mockRange as Range);
    const result = getTextBeforeCaret();
    expect(result).toBe('');
  });

  it('should handle caret at end of text', () => {
    const textNode = document.createTextNode('complete text');
    mockRange = {
      startContainer: textNode,
      startOffset: 13,
      cloneRange: vi.fn(() => null as unknown as Range),
      selectNodeContents: vi.fn(),
      setEnd: vi.fn(),
      toString: vi.fn(() => 'complete text'),
    };
    mockRange.cloneRange.mockReturnValue(mockRange as Range);
    mockSelection.getRangeAt = vi.fn(() => mockRange as Range);
    const result = getTextBeforeCaret();
    expect(result).toBe('complete text');
  });

  it('should work with empty text node', () => {
    mockRange = {
      startContainer: document.createTextNode(''),
      startOffset: 0,
      cloneRange: vi.fn(() => null as unknown as Range),
      selectNodeContents: vi.fn(),
      setEnd: vi.fn(),
      toString: vi.fn(() => ''),
    };
    mockRange.cloneRange.mockReturnValue(mockRange as Range);
    mockSelection.getRangeAt = vi.fn(() => mockRange as Range);
    const result = getTextBeforeCaret();
    expect(result).toBe('');
  });
});
