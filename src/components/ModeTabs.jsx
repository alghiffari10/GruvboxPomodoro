import React from 'react';

/**
 * Catalogue drawer tabs component for switching session modes.
 */
export function ModeTabs({ mode, mins, onSelectMode }) {
  const tabs = [
    { key: 'focus', name: 'Study', duration: mins.focus },
    { key: 'short', name: 'Tea break', duration: mins.short },
    { key: 'long', name: 'Long stroll', duration: mins.long },
  ];

  return (
    <div className="tabs" role="tablist" aria-label="Session type">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className="tab"
          role="tab"
          data-mode={tab.key}
          aria-selected={mode === tab.key}
          onClick={() => onSelectMode(tab.key)}
        >
          {tab.name}
          <small id={`lbl-${tab.key}`}>{tab.duration} min</small>
        </button>
      ))}
    </div>
  );
}
