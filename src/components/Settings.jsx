import React, { useState, useEffect } from 'react';

/**
 * Settings drawer for loan periods and bell toggle.
 */
export function Settings({ mins, sound, onMinChange, onSoundChange }) {
  // Local state for smooth numeric input editing
  const [localMins, setLocalMins] = useState(mins);

  useEffect(() => {
    setLocalMins(mins);
  }, [mins]);

  const handleChange = (key, value) => {
    setLocalMins((prev) => ({ ...prev, [key]: value }));
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      onMinChange(key, parsed);
    }
  };

  const handleBlur = (key) => {
    onMinChange(key, localMins[key]);
  };

  return (
    <details>
      <summary>Adjust loan periods</summary>
      <div className="settings">
        <label>
          Study (min)
          <input
            type="number"
            id="s-focus"
            min="1"
            max="120"
            value={localMins.focus}
            onChange={(e) => handleChange('focus', e.target.value)}
            onBlur={() => handleBlur('focus')}
          />
        </label>
        <label>
          Tea break (min)
          <input
            type="number"
            id="s-short"
            min="1"
            max="60"
            value={localMins.short}
            onChange={(e) => handleChange('short', e.target.value)}
            onBlur={() => handleBlur('short')}
          />
        </label>
        <label>
          Long stroll (min)
          <input
            type="number"
            id="s-long"
            min="1"
            max="90"
            value={localMins.long}
            onChange={(e) => handleChange('long', e.target.value)}
            onBlur={() => handleBlur('long')}
          />
        </label>
        <label className="sound">
          <input
            type="checkbox"
            id="s-sound"
            checked={sound}
            onChange={(e) => onSoundChange(e.target.checked)}
          />
          {' '}Ring the desk bell when time is up
        </label>
      </div>
    </details>
  );
}
