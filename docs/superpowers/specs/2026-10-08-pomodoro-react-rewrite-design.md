# The Reading Room — React + Tailwind Rewrite

**Date:** 2026-10-08
**Status:** Approved design, pending spec review

## Goal

Rebuild the single-file pomodoro app (`index.html` — HTML/CSS/JS) as a Vite + React (JavaScript) + Tailwind CSS v4 project with a proper component structure, preserving feature-for-feature parity and the exact visual design.

## Non-goals

- No TypeScript.
- No router, state-management library, or component library.
- No visual redesign, no new features.
- No SSR/framework deployment concerns — this is a static client-side app.

## Feature requirements (parity checklist)

### Timer core
- Three modes: `focus` (Study, 25 min), `short` (Tea break, 5 min), `long` (Long stroll, 15 min), switchable by tabs at any time.
- Countdown derives from an absolute end timestamp (not a decrementing counter), ticked every ~250 ms, so tab throttling does not drift the deadline. `visibilitychange` forces an immediate catch-up tick.
- Start / Pause / Resume primary button; label follows state ("Start reading", "Pause", "Resume reading", "Start break" — break wording for non-focus modes).
- Reset (button + `R` key) restores the current mode's full duration and clears the stamp.
- Skip (button + `S` key): `focus` → `short`, anything → `focus`.
- `Space` toggles start/pause, except when focus is inside a form control or button.
- Tab titles: shows `MM:SS · The Reading Room` while running, plain title otherwise.

### Cycle rules (on reaching 00:00)
- Play the desk bell (if sound enabled).
- If the finished mode was `focus`: append a "book" to the shelf and increment the cycle counter.
- Show the stamp: `RETURNED` after focus, `WELCOME BACK` after a break.
- Auto-switch mode: focus → `long` when `cycle % 4 === 0`, else `short`; break → `focus`.
- Fire a browser Notification if permission was already granted.
- Permission is requested (best-effort) on the first Start click.

### Card presentation
- Library checkout card: paper background, red margin rule, ruled lines, punched hole, dotted-leader "Borrower: You" and "Date due" fields (due shows the wall-clock end time while running, `—` otherwise).
- Large typewriter clock; colon blinks once per second while running.
- Status line copy per state (ready / quietly reading / bookmarked / break messages / post-finish message naming the next mode).
- Bookmark ribbon fills top-down with elapsed progress and changes color per mode (focus red, short green, long blue), with a 0.9 s linear transition.

### Bookshelf
- Each completed focus session adds a book: random palette color, random gold/cream accent, height 70–139 px, width 18–35 px, 8% chance of a `lean` (tilted) book, `new` slot-in drop animation.
- Book tooltip: `Session N · M min`.
- Count display, empty-shelf message, "clear shelf" resets books **and** the cycle counter.
- Shelf auto-scrolls to the newest book; horizontally scrollable on overflow.

### Settings
- Per-mode durations: focus 1–120, short 1–60, long 1–90 minutes, clamped on input; changing the active mode's duration while paused resets the timer to the new value.
- Sound checkbox ("Ring the desk bell when time is up").
- Both persist.

### Persistence
- `localStorage` key `readingroom`: `{ mins: {f, s, l}, books, sound, day }`.
- Books are loaded only if the stored `day` matches today's local date string; otherwise the shelf starts empty.
- Writes happen on every mutation; all reads/writes wrapped in `try/catch` (quota/private-mode safe).

### Bell
- WebAudio, three sine notes 880 → 1318.5 → 880 Hz, 0.32 s apart, 0.3 gain, exponential decay; guarded by `try/catch`.

### Accessibility & responsiveness
- Tabs use `role="tablist"` / `role="tab"` / `aria-selected`; timer uses `role="timer"`; focus-visible outlines (orange) on all interactive elements.
- `prefers-reduced-motion: reduce` disables all animations and transitions.
- Layout matches the original at ≤480 px (narrower card padding, two-column settings).

## Architecture

```
pomodoro/
├── index.html              # fonts, #root, viewport meta
├── package.json
├── vite.config.js          # @vitejs/plugin-react + @tailwindcss/vite
├── vitest.config (merged in vite.config)
└── src/
    ├── main.jsx            # createRoot render
    ├── index.css           # @import "tailwindcss"; @theme tokens; custom classes/keyframes
    ├── App.jsx             # composes hook + components; global keyboard handler
    ├── hooks/
    │   └── usePomodoro.js  # single source of truth
    ├── lib/
    │   ├── time.js         # parts(s) → {mm, rr}, plain(s), dueStr(t)
    │   ├── storage.js      # load(), save(state) — try/catch, day-scoped books
    │   └── bell.js         # ring() — WebAudio chime
    └── components/
        ├── ModeTabs.jsx
        ├── TimerCard.jsx   # ribbon, fields, clock, status, stamp, controls
        ├── Settings.jsx
        └── Shelf.jsx
```

Data flow: `App` calls `usePomodoro()` once and passes state slices + action callbacks down as props. No context, no props deeper than one level.

## `usePomodoro()` contract

**State:** `mode`, `running`, `left` (seconds), `total` (seconds), `books`, `cycle`, `mins` (`{focus, short, long}`), `sound`, `stamp` (`null | 'RETURNED' | 'WELCOME BACK'`), `status` (derived string), `due` (derived end timestamp or `null`).

**Actions:** `toggle()` (start/pause, requests Notification permission on first start), `reset()`, `skip()`, `setMode(k, keepStamp = false)`, `setMin(k, v)` (clamped per mode), `setSound(bool)`, `clearShelf()`, `dismissStamp()`.

The clock renders `{mm}` and `{rr}` as separate strings with the blinking colon span between them — no `dangerouslySetInnerHTML`.

**Behavior notes:**
- Interval runs at 250 ms while running; every tick recomputes `left = ceil((end - Date.now()) / 1000)` and only triggers a re-render when the value changes.
- `finish()` is idempotent — guarded so a double tick cannot push two books.
- `setMode` stops the timer, sets `left = total = mins[k] * 60`, and (unless `keepStamp` is true) clears the stamp.
- Persistence fires inside the state-update paths, not in render.
- The keyboard handler lives in `App` via a `useEffect` listener, mirroring the original's `INPUT|TEXTAREA`/button exclusions.

## Styling

Tailwind v4, CSS-first configuration in `src/index.css`:

- `@import "tailwindcss";`
- `@theme` declares the gruvbox palette (`--color-bg0h` … `--color-orange`, `--color-paper`, `--color-ink`, `--color-stamp`), fonts (`--font-serif` = IM Fell English, `--font-type` = Special Elite), accent override via `body[data-mode]`, and animation tokens (`--animate-blink`, `--animate-thud`, `--animate-slot`) wired to `@keyframes` declared in the same file.
- Google Fonts links live in `index.html` (preconnect + stylesheet).
- Utility classes carry layout, spacing, typography, buttons, tabs, settings grid, and responsive rules (original `@media (max-width:480px)` becomes a `max-[480px]:` variant).
- Three things Tailwind handles awkwardly stay as named custom CSS in `index.css`: the paper card's layered `background-image` gradients + punched-hole `::before`, the clip-path ribbon + its `::after` weave, and the `thud`/`slot`/`blink` keyframes (reduced-motion guard included).
- Mode accent colors are driven by `body[data-mode]` setting `--accent`, exactly as the original.

## Error handling

- `localStorage` read/write: `try/catch`, silent no-op on failure (matches original).
- `AudioContext` construction and note scheduling: `try/catch`.
- `Notification` construction and permission requests: `try/catch`; feature-detected first.
- Settings inputs: non-numeric or out-of-range values clamp to `[min, max]` and fall back to the previous value if unparseable.

## Testing

Vitest, covering pure logic only:

1. `lib/time.js` — `parts`/`plain` padding, colon markup rendered by the component, `dueStr` shape.
2. `lib/storage.js` — save/load round-trip, books dropped when `day` differs, corrupted JSON tolerated (mocked `localStorage`).
3. Cycle rule — pure `nextMode(mode, cycle)` helper: focus→short, focus@4→long, short/long→focus.

No DOM/component tests — setup cost outweighs value for this app.

## Verification

- `npm run test` — Vitest suite green.
- `npm run build` — production build succeeds with no errors.
- `npm run dev` manual pass of the parity checklist: start/pause/resume, reset, skip, tab switch mid-session, settings clamping, bell + stamp + auto-switch on completion, book appears and shelf persists across reload same-day, clear shelf, keyboard shortcuts, mobile width, reduced-motion.
