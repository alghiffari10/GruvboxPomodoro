import React, { useEffect, useRef } from 'react';

/**
 * Bookshelf component displaying completed study sessions as books, with clear shelf control.
 */
export function Shelf({ books, onClear }) {
  const booksRef = useRef(null);

  // Auto-scroll to newest book on change
  useEffect(() => {
    if (booksRef.current) {
      booksRef.current.scrollLeft = booksRef.current.scrollWidth;
    }
  }, [books.length]);

  return (
    <section className="shelf-wrap" aria-label="Completed sessions">
      <div className="shelf-head">
        <h2>Shelved today</h2>
        <span>
          <span id="count">{books.length}</span> books ·{' '}
          <button
            type="button"
            className="shelf-btn"
            id="clear"
            onClick={onClear}
          >
            clear shelf
          </button>
        </span>
      </div>
      <div className="books" id="books" ref={booksRef}>
        {books.length === 0 ? (
          <div className="empty">
            The shelf is bare. Finish a study session to add your first volume.
          </div>
        ) : (
          books.map((b, i) => {
            const classNames = [
              'book',
              b.lean ? 'lean' : '',
              b.fresh ? 'new' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div
                key={b.id || i}
                className={classNames}
                style={{
                  '--c': b.c,
                  '--g': b.g,
                  '--w': `${b.w}px`,
                  '--h': `${b.h}px`,
                }}
                title={`Session ${i + 1} · ${b.m} min`}
              >
                <i />
              </div>
            );
          })
        )}
      </div>
      <div className="plank" />
      <div className="plank-foot" />
    </section>
  );
}
