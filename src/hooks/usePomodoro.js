import { useState, useEffect, useRef, useCallback } from 'react';
import { parts, plain, dueStr } from '../lib/time';
import { nextMode } from '../lib/cycle';
import { ring } from '../lib/bell';
import {
  DEFAULT_MINS,
  createBook,
  loadSettings,
  saveSettings,
} from '../lib/storage';

export const MODES = {
  focus: { k: 'focus', name: 'Study', defaultMins: 25, min: 1, max: 120 },
  short: { k: 'short', name: 'Tea break', defaultMins: 5, min: 1, max: 60 },
  long: { k: 'long', name: 'Long stroll', defaultMins: 15, min: 1, max: 90 },
};

/**
 * Custom hook managing the Pomodoro timer state, persistence, cycle transitions, and audio.
 */
export function usePomodoro() {
  // Load persisted state or fallback to defaults
  const [mins, setMins] = useState(() => {
    const loaded = loadSettings();
    return loaded ? loaded.mins : DEFAULT_MINS;
  });

  const [sound, setSound] = useState(() => {
    const loaded = loadSettings();
    return loaded ? loaded.sound : true;
  });

  const [books, setBooks] = useState(() => {
    const loaded = loadSettings();
    return loaded ? loaded.books : [];
  });

  const [cycle, setCycle] = useState(() => {
    const loaded = loadSettings();
    return loaded ? loaded.books.length : 0;
  });

  const [mode, setMode] = useState('focus');
  const [running, setRunning] = useState(false);
  const [left, setLeft] = useState(() => mins.focus * 60);
  const [total, setTotal] = useState(() => mins.focus * 60);
  const [end, setEnd] = useState(0);
  const [stamp, setStamp] = useState(null);
  const [stampKey, setStampKey] = useState(0);
  const [statusOverride, setStatusOverride] = useState(null);

  // Refs for timer execution avoiding stale closures
  const runningRef = useRef(running);
  const endRef = useRef(end);
  const leftRef = useRef(left);
  const modeRef = useRef(mode);
  const cycleRef = useRef(cycle);
  const booksRef = useRef(books);
  const minsRef = useRef(mins);
  const soundRef = useRef(sound);
  const finishingRef = useRef(false);

  useEffect(() => { runningRef.current = running; }, [running]);
  useEffect(() => { endRef.current = end; }, [end]);
  useEffect(() => { leftRef.current = left; }, [left]);
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { cycleRef.current = cycle; }, [cycle]);
  useEffect(() => { booksRef.current = books; }, [books]);
  useEffect(() => { minsRef.current = mins; }, [mins]);
  useEffect(() => { soundRef.current = sound; }, [sound]);

  // Keep body data-mode in sync for styling
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.dataset.mode = mode;
    }
  }, [mode]);

  // Keep document title in sync
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = (running ? `${plain(left)} · ` : '') + 'The Reading Room';
    }
  }, [running, left]);

  // Switch mode helper
  const setModeAction = useCallback((k, keepStamp = false) => {
    setRunning(false);
    setMode(k);
    const dur = minsRef.current[k] * 60;
    setTotal(dur);
    setLeft(dur);
    leftRef.current = dur;
    setEnd(0);
    endRef.current = 0;
    if (!keepStamp) {
      setStamp(null);
      setStatusOverride(null);
    }
  }, []);

  // Completion routine
  const finish = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;

    setRunning(false);
    runningRef.current = false;
    setEnd(0);
    endRef.current = 0;

    if (soundRef.current) {
      ring();
    }

    const currentMode = modeRef.current;
    const wasFocus = currentMode === 'focus';
    let nextCycle = cycleRef.current;
    let newBooks = booksRef.current;

    if (wasFocus) {
      const book = createBook(minsRef.current.focus);
      newBooks = [...booksRef.current, book];
      nextCycle = cycleRef.current + 1;
      setBooks(newBooks);
      setCycle(nextCycle);
      saveSettings({
        mins: minsRef.current,
        books: newBooks,
        sound: soundRef.current,
      });
    }

    const next = nextMode(currentMode, nextCycle);
    const stampText = wasFocus ? 'RETURNED' : 'WELCOME BACK';

    setStamp(stampText);
    setStampKey((prev) => prev + 1);

    setMode(next);
    const nextDur = minsRef.current[next] * 60;
    setTotal(nextDur);
    setLeft(nextDur);
    leftRef.current = nextDur;

    const nextName = MODES[next].name.toLowerCase();
    const finishMsg = wasFocus
      ? `Book returned. Up next: ${nextName}.`
      : 'Break over. Back to your chapter.';
    setStatusOverride(finishMsg);

    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      try {
        new Notification(wasFocus ? 'Book returned' : 'Break over');
      } catch (e) {
        // ignore notification error
      }
    }

    finishingRef.current = false;
  }, []);

  // Timer interval & visibility handler
  useEffect(() => {
    if (!running) return;

    const step = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endRef.current - now) / 1000));
      if (remaining !== leftRef.current) {
        leftRef.current = remaining;
        setLeft(remaining);
      }
      if (remaining <= 0) {
        finish();
      }
    };

    const intervalId = setInterval(step, 252);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && runningRef.current) {
        step();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [running, finish]);

  // Primary toggle: Start / Pause / Resume
  const toggle = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      try {
        Notification.requestPermission();
      } catch (e) {
        // ignore error
      }
    }

    if (running) {
      // Pause
      const remaining = Math.max(0, Math.round((end - Date.now()) / 1000));
      setRunning(false);
      setLeft(remaining);
      leftRef.current = remaining;
      setStatusOverride(null);
    } else {
      // Start or Resume
      const targetEnd = Date.now() + left * 1000;
      setEnd(targetEnd);
      endRef.current = targetEnd;
      setRunning(true);
      setStamp(null);
      setStatusOverride(null);
    }
  }, [running, end, left]);

  // Reset timer
  const reset = useCallback(() => {
    setModeAction(mode, false);
  }, [mode, setModeAction]);

  // Skip to next phase
  const skip = useCallback(() => {
    const next = mode === 'focus' ? 'short' : 'focus';
    setModeAction(next, false);
  }, [mode, setModeAction]);

  // Update mode durations
  const setMin = useCallback(
    (k, val) => {
      const cfg = MODES[k];
      const parsed = parseInt(val, 10);
      const valid = Number.isNaN(parsed)
        ? mins[k]
        : Math.min(cfg.max, Math.max(cfg.min, parsed));
      const newMins = { ...mins, [k]: valid };

      setMins(newMins);
      saveSettings({ mins: newMins, books, sound });

      if (mode === k && !running) {
        setTotal(valid * 60);
        setLeft(valid * 60);
        leftRef.current = valid * 60;
        setStamp(null);
        setStatusOverride(null);
      }
    },
    [mins, books, sound, mode, running]
  );

  // Toggle bell sound
  const updateSound = useCallback(
    (val) => {
      setSound(val);
      saveSettings({ mins, books, sound: val });
    },
    [mins, books]
  );

  // Clear books shelf
  const clearShelf = useCallback(() => {
    setBooks([]);
    setCycle(0);
    saveSettings({ mins, books: [], sound });
  }, [mins, sound]);

  // Dismiss stamp
  const dismissStamp = useCallback(() => {
    setStamp(null);
  }, []);

  // Derived UI labels & strings
  const due = running && end ? dueStr(end) : '—';

  const status =
    statusOverride ||
    (running
      ? mode === 'focus'
        ? 'Quietly reading…'
        : 'Stretch your legs, pour some tea.'
      : left < total
      ? 'Bookmarked. Your place is saved.'
      : mode === 'focus'
      ? 'Ready when you are.'
      : 'A short rest is due.');

  const startLabel = running
    ? 'Pause'
    : left < total
    ? 'Resume reading'
    : mode === 'focus'
    ? 'Start reading'
    : 'Start break';

  return {
    mode,
    running,
    left,
    total,
    books,
    cycle,
    mins,
    sound,
    stamp,
    stampKey,
    status,
    due,
    startLabel,
    toggle,
    reset,
    skip,
    setMode: setModeAction,
    setMin,
    setSound: updateSound,
    clearShelf,
    dismissStamp,
  };
}
