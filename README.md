# 🗺️ MapMaster

A full-featured geography quiz web app to test your knowledge of states and countries across the world — built entirely with vanilla HTML, CSS, and JavaScript.

---

## 📸 Screenshots

### 🏠 Start Screen
![Start Screen](screenshots/start.png)
*Clean hero landing with scope selection — Country, Continent, or World.*

### 🌍 Region Selection
![Region Selection](screenshots/region_select.png)
*Choose a country (India, USA) or continent (Europe, Asia, Africa, etc.) to focus your quiz on.*

### ⚙️ Game Setup
![Game Setup](screenshots/setup.png)
*Pick your game type (Typing or Locate) and mode (Practice or Challenge) before starting.*

### ⏱️ Challenge Settings
![Challenge Settings](screenshots/challenge.png)
*Configure timer duration (2, 3, or 5 minutes) and number of lives for high-stakes play.*

### 🎮 Game Screen — Typing Mode
![Typing Mode](screenshots/typing.png)
*Type state or country names to colour them in on the live SVG map. Score, streak, timer, and progress bar update in real time.*

### 📍 Game Screen — Locate Mode
![Locate Mode](screenshots/locate.png)
*A target region is shown — click it on the map to score. Wrong clicks cost lives in Challenge mode.*

### 🏆 Win Screen
![Win Screen](screenshots/win.png)
*Confetti, final time, accuracy percentage, and best streak displayed on completion.*

---

## ✨ Features

- **Two Game Types** — *Type the Name*: type region names to fill the map. *Locate on Map*: click the highlighted target region on the SVG map.
- **Two Game Modes** — *Practice*: no timer, no lives, play at your own pace. *Challenge*: countdown timer + limited lives for pressure gameplay.
- **8 Map Scopes** — India (28 states), USA (50 states), Europe, North America, South America, Africa, Asia, Oceania, and World (195 countries).
- **Live SVG Map** — Interactive SVG maps with hover highlights, correct-answer colouring, and wrong-click red flash animations.
- **Streak Tracking** — Current streak and best streak tracked and displayed in real time throughout each game.
- **Progress Bar** — Animated fill bar showing how many regions have been correctly identified.
- **Sound Effects** — Subtle audio feedback on correct and incorrect answers, with a toggle to mute.
- **Dark Mode** — Full dark theme toggle with `localStorage` persistence across sessions.
- **Confetti Win Animation** — Canvas-based confetti burst on successfully completing a map.
- **Responsive Design** — Works across desktop and mobile screen sizes.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| Maps | Inline SVG files per region |
| Styling | Custom CSS with CSS variables, Poppins font |
| Storage | `localStorage` for theme preference |
| Audio | Web Audio API (inline base64 WAV) |
| Animation | CSS keyframes + Canvas API (confetti) |

No frameworks, no build tools, no dependencies. Open `index.html` and it runs.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/anurag290805/mapmaster.git
cd mapmaster
```

### 2. Add SVG maps

Place your SVG map files in a `svg/` folder. Required files:
```
svg/india.svg
svg/usa.svg
svg/europe.svg
svg/north america.svg
svg/south america.svg
svg/africa.svg
svg/asia.svg
svg/oceania.svg
svg/world.svg
```

Each SVG should have `<path>` elements with `aria-label`, `id`, `name`, `data-name`, or a child `<title>` tag identifying the region name.

### 3. Open the app
```bash
open index.html
# or just double-click index.html in your file explorer
```

No server required for most browsers. For SVG cross-origin loading, serve locally:
```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

---

## 📁 Project Structure
```
mapmaster/
│
├── index.html          # Full app markup — all screens
├── script.js           # All game logic, state, and event handling
├── style.css           # Complete styling with CSS variables and dark theme
│
└── svg/
    ├── india.svg
    ├── usa.svg
    ├── europe.svg
    ├── north america.svg
    ├── south america.svg
    ├── africa.svg
    ├── asia.svg
    ├── oceania.svg
    └── world.svg
```

---

## 🧠 Key Technical Highlights

**Dynamic SVG interaction** — SVG maps are loaded via `<object>` tags and manipulated through `contentDocument`. Paths are queried by `aria-label`, `id`, `data-name`, or child `<title>` elements to support a wide variety of SVG formats.

**Auto-fit viewBox** — On SVG load, the script computes the real bounding box across all `<path>` elements and sets a tight `viewBox`, ensuring maps with offset coordinates display correctly and fill the container.

**Multi-scope map engine** — A single `MAPS` data object drives all 8 map contexts. Switching scope swaps the SVG source, region list, and all UI labels with one `applyMap()` call.

**Locate mode click detection** — SVG path click handlers resolve the clicked region name from multiple possible attribute patterns, then compare it against the current target with immediate visual and audio feedback.

**Streak & accuracy tracking** — Current and best streaks are maintained across rounds within a session. Accuracy is computed from total attempts vs. correct answers on the win screen.

**Confetti engine** — A pure Canvas API particle system with random colours, spin, velocity, and a fade-out over 5 seconds — no external libraries.

**Screen transition system** — CSS animation classes (`screen-enter`, `screen-exit`) are applied programmatically for smooth fade-slide transitions between all app screens.

---

## 📋 What I Learned

- Manipulating embedded SVG documents via `contentDocument` across different SVG formats
- Building a multi-screen single-page app with pure JavaScript state management
- Computing dynamic SVG `viewBox` values from path bounding boxes for universal map support
- Implementing game loop logic with timers, lives, streaks, and win/lose conditions
- Designing a scalable data-driven architecture that extends easily to new maps and regions

---

## 👤 Author

**Anurag Srivastava**  
[GitHub](https://github.com/anurag290805)
