import { describe, expect,it } from 'vitest';

import { getQueryFromText } from '../getQueryFromText';

describe('getQueryFromText', () => {
  it('should return empty string when no @ found', () => {
    expect(getQueryFromText('hello world')).toBe('');
  });

  it('should return text after @ symbol', () => {
    expect(getQueryFromText('@john')).toBe('john');
  });

  it('should return text after @ in middle of text', () => {
    expect(getQueryFromText('hello @john')).toBe('john');
  });

  it('should handle multiple @ symbols and use last one', () => {
    expect(getQueryFromText('hello @jane and @john')).toBe('john');
  });

  it('should return empty string for @ at end of text', () => {
    expect(getQueryFromText('hello @')).toBe('');
  });

  it('should handle @ at beginning of text', () => {
    expect(getQueryFromText('@')).toBe('');
  });

  it('should return query with spaces', () => {
    expect(getQueryFromText('@john doe')).toBe('john doe');
  });

  it('should handle empty string', () => {
    expect(getQueryFromText('')).toBe('');
  });

  it('should work with partial usernames', () => {
    expect(getQueryFromText('mention @jo')).toBe('jo');
  });
});
