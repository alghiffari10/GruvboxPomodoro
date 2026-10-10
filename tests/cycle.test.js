import { describe, it, expect } from 'vitest';
import { nextMode } from '../src/lib/cycle';

describe('cycle helper nextMode', () => {
  it('transitions focus to short break for cycles not divisible by 4', () => {
    expect(nextMode('focus', 1)).toBe('short');
    expect(nextMode('focus', 2)).toBe('short');
    expect(nextMode('focus', 3)).toBe('short');
    expect(nextMode('focus', 5)).toBe('short');
  });

  it('transitions focus to long stroll every 4 completed sessions', () => {
    expect(nextMode('focus', 4)).toBe('long');
    expect(nextMode('focus', 8)).toBe('long');
    expect(nextMode('focus', 12)).toBe('long');
  });

  it('transitions break sessions back to focus', () => {
    expect(nextMode('short', 1)).toBe('focus');
    expect(nextMode('long', 4)).toBe('focus');
    expect(nextMode('short', 8)).toBe('focus');
  });
});
