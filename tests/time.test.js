import { describe, it, expect } from 'vitest';
import { parts, plain, dueStr } from '../src/lib/time';

describe('time helpers', () => {
  it('correctly splits and pads seconds into minutes and seconds', () => {
    expect(parts(0)).toEqual({ mm: '00', rr: '00' });
    expect(parts(5)).toEqual({ mm: '00', rr: '05' });
    expect(parts(65)).toEqual({ mm: '01', rr: '05' });
    expect(parts(1500)).toEqual({ mm: '25', rr: '00' });
    expect(parts(300)).toEqual({ mm: '05', rr: '00' });
    expect(parts(900)).toEqual({ mm: '15', rr: '00' });
  });

  it('formats plain string for tab title', () => {
    expect(plain(1500)).toBe('25:00');
    expect(plain(65)).toBe('01:05');
    expect(plain(0)).toBe('00:00');
  });

  it('formats due timestamp into HH:MM string', () => {
    const timestamp = new Date('2026-10-08T15:30:00').getTime();
    const formatted = dueStr(timestamp);
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThanOrEqual(4);
  });
});
