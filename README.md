# 📚 The Reading Room — Gruvbox Pomodoro Timer

A beautifully themed Pomodoro timer disguised as a vintage library checkout card. Built with React and styled in the [Gruvbox](https://github.com/morhetz/gruvbox) color palette, it turns productivity sessions into a cozy reading ritual.

> *Borrow twenty-five minutes. Return them with a chapter finished.*

## ✨ Features

- **Three session modes** — *Study* (25 min), *Tea Break* (5 min), and *Long Stroll* (15 min), all fully customizable
- **Automatic cycle progression** — follows the classic Pomodoro pattern: four focus sessions, then a long break
- **Library card UI** — the timer is presented as a checkout card with borrower info, due date, ruled lines, a punched hole, and a bookmark ribbon that fills as time progresses
- **Bookshelf tracker** — each completed study session is "shelved" as a randomly generated book spine; the shelf resets daily
- **Desk bell chime** — a WebAudio-synthesized three-note bell rings when a session ends (toggleable)
- **Browser notifications** — optional desktop notifications on session completion
- **Keyboard shortcuts** — `Space` to start/pause, `R` to reset, `S` to skip
- **Persistent settings** — durations, sound preference, and daily shelf are saved to `localStorage`
- **Stamp animation** — a satisfying "RETURNED" / "WELCOME BACK" rubber-stamp lands on the card at session boundaries
- **Responsive design** — adapts to mobile viewports with a compact card layout
- **Reduced motion support** — respects `prefers-reduced-motion` for all animations

## 🛠 Tech Stack

| Layer       | Technology                        |
| ----------- | --------------------------------- |
| Framework   | React 19                          |
| Build tool  | Vite 8                            |
| Styling     | Tailwind CSS 4 + custom CSS       |
| Testing     | Vitest 5                          |
| Deployment  | GitHub Pages (`gh-pages`)         |
| Fonts       | IM Fell English · Special Elite   |

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (comes with Node)

### Install & Run

```bash
# Clone the repository
git clone https://github.com/alghiffari10/GruvboxPomodoro.git
cd GruvboxPomodoro

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173/GruvboxPomodoro/`).

### Build for Production

```bash
npm run build     # outputs to dist/
npm run preview   # preview the production build locally
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

### Run Tests

```bash
npm test
```

## 📂 Project Structure

```
pomodoro/
├── index.html                 # HTML entry point
├── vite.config.js             # Vite + React + Tailwind config
├── src/
│   ├── main.jsx               # React DOM mount
│   ├── App.jsx                # Root component — layout & keyboard shortcuts
│   ├── index.css              # Full Gruvbox theme & component styles
│   ├── components/
│   │   ├── ModeTabs.jsx       # Study / Tea break / Long stroll tab bar
│   │   ├── TimerCard.jsx      # Checkout card with countdown & controls
│   │   ├── Settings.jsx       # Adjustable durations & bell toggle
│   │   └── Shelf.jsx          # Bookshelf of completed sessions
│   ├── hooks/
│   │   └── usePomodoro.js     # Core timer state machine & persistence
│   └── lib/
│       ├── time.js            # Time formatting helpers
│       ├── cycle.js           # Pomodoro cycle logic (focus → break rotation)
│       ├── bell.js            # WebAudio desk bell synthesizer
│       └── storage.js         # localStorage read/write & book generation
└── tests/
    ├── time.test.js
    ├── cycle.test.js
    └── storage.test.js
```

## ⌨️ Keyboard Shortcuts

| Key     | Action          |
| ------- | --------------- |
| `Space` | Start / Pause   |
| `R`     | Reset timer     |
| `S`     | Skip to next    |

## 📄 License

This project is open source. Feel free to fork and customize it to your liking.
