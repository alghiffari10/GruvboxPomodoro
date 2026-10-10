/**
 * Time formatting helpers for The Reading Room
 */

/**
 * Splits seconds into padded minute and second strings.
 * @param {number} seconds
 * @returns {{ mm: string, rr: string }}
 */
export function parts(seconds) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return {
    mm: (m < 10 ? '0' : '') + m,
    rr: (r < 10 ? '0' : '') + r,
  };
}

/**
 * Formats seconds into plain "MM:SS" string for document title.
 * @param {number} seconds
 * @returns {string}
 */
export function plain(seconds) {
  const { mm, rr } = parts(seconds);
  return `${mm}:${rr}`;
}

/**
 * Formats timestamp into "HH:MM" (locale-aware) for Date due field.
 * @param {number} timestamp
 * @returns {string}
 */
export function dueStr(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
