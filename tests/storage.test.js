import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  STORAGE_KEY,
  DEFAULT_MINS,
  loadSettings,
  saveSettings,
  createBook,
} from '../src/lib/storage';

describe('storage helpers', () => {
  let mockStore = {};

  beforeEach(() => {
    mockStore = {};
    const mockLocalStorage = {
      getItem: vi.fn((key) => mockStore[key] ?? null),
      setItem: vi.fn((key, value) => {
        mockStore[key] = String(value);
      }),
      removeItem: vi.fn((key) => {
        delete mockStore[key];
      }),
      clear: vi.fn(() => {
        mockStore = {};
      }),
    };

    vi.stubGlobal('localStorage', mockLocalStorage);
  });

  it('saves and loads settings successfully on the same day', () => {
    const today = new Date().toDateString();
    const testBook = createBook(25);
    const state = {
      mins: { focus: 30, short: 6, long: 20 },
      books: [testBook],
      sound: false,
    };

    saveSettings(state);

    const loaded = loadSettings();
    expect(loaded).not.toBeNull();
    expect(loaded.mins).toEqual({ focus: 30, short: 6, long: 20 });
    expect(loaded.sound).toBe(false);
    expect(loaded.books).toHaveLength(1);
    expect(loaded.books[0].m).toBe(25);
  });

  it('drops shelved books if saved on a different day', () => {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const testBook = createBook(25);

    const oldData = {
      mins: { f: 25, s: 5, l: 15 },
      books: [testBook],
      sound: true,
      day: yesterday,
    };

    mockStore[STORAGE_KEY] = JSON.stringify(oldData);

    const loaded = loadSettings();
    expect(loaded).not.toBeNull();
    expect(loaded.books).toEqual([]);
    expect(loaded.mins).toEqual(DEFAULT_MINS);
  });

  it('gracefully handles corrupted JSON in localStorage', () => {
    mockStore[STORAGE_KEY] = '{invalid_json_corrupted';

    const loaded = loadSettings();
    expect(loaded).toBeNull();
  });

  it('gracefully handles empty or missing storage', () => {
    const loaded = loadSettings();
    expect(loaded).toBeNull();
  });
});
