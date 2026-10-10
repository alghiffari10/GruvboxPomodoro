import React from 'react';
import { parts } from '../lib/time';

/**
 * The checkout card component containing borrower info, due date, countdown clock,
 * bookmark ribbon, status line, stamp, and controls.
 */
export function TimerCard({
  running,
  left,
  total,
  due,
  status,
  stamp,
  stampKey,
  startLabel,
  onToggle,
  onReset,
  onSkip,
}) {
  const { mm, rr } = parts(left);
  const progressPercent = total > 0 ? (1 - left / total) * 100 : 0;

  return (
    <section
      className={`card ${running ? 'running' : ''}`}
      id="card"
      aria-label="Timer"
    >
      <div
        className="ribbon"
        id="ribbon"
        aria-hidden="true"
        style={{ '--p': `${progressPercent}%` }}
      />
      <div className="field">
        <span>Borrower</span>
        <span className="line" />
        <b id="who">You</b>
      </div>
      <div className="field">
        <span>Date due</span>
        <span className="line" />
        <b id="due">{due}</b>
      </div>
      <div className="time" id="time" role="timer" aria-live="off">
        {mm}
        <span className="colon">:</span>
        {rr}
      </div>
      <div className="status" id="status">
        {status}
      </div>
      <div
        key={stampKey}
        className={`stamp ${stamp ? 'show' : ''}`}
        id="stamp"
      >
        {stamp || 'RETURNED'}
      </div>
      <div className="controls">
        <button
          type="button"
          className="btn primary"
          id="start"
          onClick={onToggle}
        >
          {startLabel}
        </button>
        <button
          type="button"
          className="btn"
          id="reset"
          title="Reset (R)"
          onClick={onReset}
        >
          Reset
        </button>
        <button
          type="button"
          className="btn"
          id="skip"
          title="Skip (S)"
          onClick={onSkip}
        >
          Skip
        </button>
      </div>
    </section>
  );
}
