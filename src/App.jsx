import React, { useEffect } from 'react';
import { usePomodoro } from './hooks/usePomodoro';
import { ModeTabs } from './components/ModeTabs';
import { TimerCard } from './components/TimerCard';
import { Settings } from './components/Settings';
import { Shelf } from './components/Shelf';

/**
 * Main application component composing header, main content, shelf, footer,
 * and keyboard shortcuts.
 */
export function App() {
  const {
    mode,
    running,
    left,
    total,
    books,
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
    setMode,
    setMin,
    setSound,
    clearShelf,
  } = usePomodoro();

  // Keyboard shortcut listener matching original behavior:
  // Space starts & pauses · R resets · S skips
  useEffect(() => {
    function handleKeyDown(e) {
      if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.code === 'Space' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        toggle();
      } else if (e.key === 'r' || e.key === 'R') {
        reset();
      } else if (e.key === 's' || e.key === 'S') {
        skip();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle, reset, skip]);

  return (
    <>
      <header>
        <h1>The Reading Room</h1>
        <p>Borrow twenty-five minutes. Return them with a chapter finished.</p>
        <div className="rule" aria-hidden="true">
          ❦
        </div>
      </header>

      <main>
        <ModeTabs
          mode={mode}
          mins={mins}
          onSelectMode={(k) => setMode(k, false)}
        />
        <TimerCard
          running={running}
          left={left}
          total={total}
          due={due}
          status={status}
          stamp={stamp}
          stampKey={stampKey}
          startLabel={startLabel}
          onToggle={toggle}
          onReset={reset}
          onSkip={skip}
        />
        <Settings
          mins={mins}
          sound={sound}
          onMinChange={setMin}
          onSoundChange={setSound}
        />
      </main>

      <Shelf books={books} onClear={clearShelf} />

      <footer>
        Space starts &amp; pauses · R resets · S skips · Please keep quiet.
      </footer>
    </>
  );
}

export default App;
