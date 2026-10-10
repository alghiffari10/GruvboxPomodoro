/**
 * Determines the next timer mode based on the current mode and completed cycle count.
 * Focus sessions transition to a long break every 4 completed sessions, or a short break otherwise.
 * Breaks always transition back to focus.
 *
 * @param {'focus' | 'short' | 'long'} mode
 * @param {number} cycle
 * @returns {'focus' | 'short' | 'long'}
 */
export function nextMode(mode, cycle) {
  if (mode === 'focus') {
    return cycle % 4 === 0 ? 'long' : 'short';
  }
  return 'focus';
}
