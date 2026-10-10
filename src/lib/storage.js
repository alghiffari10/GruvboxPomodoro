/**
 * Storage and persistence helpers for The Reading Room
 */

export const STORAGE_KEY = 'readingroom';

export const DEFAULT_MINS = {
  focus: 25,
  short: 5,
  long: 15,
};

export const BOOK_COLORS = [
  '#cc241d', '#98971a', '#d79921', '#458588', '#b16286', '#689d6a',
  '#d65d0e', '#9d0006', '#79740e', '#b57614', '#076678', '#8f3f71',
];

export const GOLD_ACCENTS = ['#fabd2f', '#ebdbb2', '#fe8019', '#b8bb26'];

/**
 * Creates a randomized book object for completed focus sessions.
 * @param {number} durationMins
 * @returns {object}
 */
export function createBook(durationMins) {
  const h = 70 + Math.floor(Math.random() * 70);
  const w = 18 + Math.floor(Math.random() * 18);
  const c = BOOK_COLORS[Math.floor(Math.random() * BOOK_COLORS.length)];
  const g = GOLD_ACCENTS[Math.floor(Math.random() * GOLD_ACCENTS.length)];
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    c,
    g,
    h,
    w,
    m: durationMins,
    fresh: true,
    lean: Math.random() < 0.08,
  };
}

/**
 * Loads persisted configuration and shelf books from localStorage.
 * Books are only kept if saved on today's local date.
 * @returns {{ mins: { focus: number, short: number, long: number }, sound: boolean, books: Array } | null}
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;

    const mins = {
      focus: Number.isInteger(data.mins?.f) ? data.mins.f : DEFAULT_MINS.focus,
      short: Number.isInteger(data.mins?.s) ? data.mins.s : DEFAULT_MINS.short,
      long: Number.isInteger(data.mins?.l) ? data.mins.l : DEFAULT_MINS.long,
    };

    const sound = data.sound !== false;
    const isToday = data.day === new Date().toDateString();
    const books = isToday && Array.isArray(data.books) ? data.books : [];

    return { mins, sound, books };
  } catch (e) {
    return null;
  }
}

/**
 * Persists current session settings and shelved books to localStorage.
 * @param {{ mins: { focus: number, short: number, long: number }, sound: boolean, books: Array }} settings
 */
export function saveSettings({ mins, books, sound }) {
  try {
    const payload = {
      mins: {
        f: mins.focus,
        s: mins.short,
        l: mins.long,
      },
      books: books || [],
      sound: sound !== false,
      day: new Date().toDateString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {
    // Gracefully ignore storage quota / access issues
  }
}
