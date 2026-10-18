# NIGHTSHIFT — Professional DJ Mixing Workstation

<div align="center">

```
  ███╗   ██╗██╗ ██████╗ ██╗  ██╗████████╗███████╗██╗  ██╗██╗███████╗████████╗
  ████╗  ██║██║██╔════╝ ██║  ██║╚══██╔══╝██╔════╝██║  ██║██║██╔════╝╚══██╔══╝
  ██╔██╗ ██║██║██║  ███╗███████║   ██║   ███████╗███████║██║█████╗     ██║   
  ██║╚██╗██║██║██║   ██║██╔══██║   ██║   ╚════██║██╔══██║██║██╔══╝     ██║   
  ██║ ╚████║██║╚██████╔╝██║  ██║   ██║   ███████║██║  ██║██║██║        ██║   
  ╚═╝  ╚═══╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝╚═╝        ╚═╝   
```

**A modern, production-grade DJ mixing application inspired by Pioneer rekordbox, Serato DJ Pro, and VirtualDJ.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio-Low_Latency_DSP-00E5FF)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

[📖 Read the Official User Manual](./USER_MANUAL.md) • [🚀 Quick Start](#-quick-start) • [🎛️ Features](#-features) • [⌨️ Keyboard Shortcuts](#-keyboard-shortcuts)

</div>

---

## ⚡ Highlights

- **Dual Club Decks**: **Deck A** (Electric Cyan) and **Deck B** (Vivid Violet) with independent tempo, pitch sliders, and CDJ-style transports.
- **Realistic Turntable Jog Wheels**: Continuous spinning vinyl with tactile grooves, touch drag-scratching with pitch modulation, and fine nudge buttons.
- **Stacked 60 FPS Canvas Waveforms**: 3-band RGB frequency spectrum with beat grids, bar markers, and a Pioneer CDJ-3000 style **Beat Phase Meter**.
- **Central Hardware DJ Mixer**: 3-band Isolator EQ with dedicated instant **KILL** switches, bi-directional Sound Color FX Filter (LPF/HPF), channel faders, and stereo LED VU meters.
- **High-Performance Crossfader**: Selectable crossfade curves (`Smooth`, `Linear`, `Scratch Cut`) and `Hamster (Reverse)` mode.
- **Performance Pads**: 8 Hot Cues (with distinct colors), Pad FX (Rolls, Repeats, Sweeps, Brake), Beat Jump (`-16` to `+16` beats), and an 8-pad Club Sampler.
- **Camelot Harmonic Mixing**: Real-time harmonic key detection (`8A`, `9B`) with one-click harmonic matching filter.
- **Import Local Music**: Drag and drop any **MP3, WAV, FLAC, AAC, or OGG** audio file; NIGHTSHIFT decodes, detects BPM, and generates waveforms automatically in-browser.
- **Live Mix Recording**: Record your master performance directly to a high-quality audio file with one click and instant download.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-username/nightshift-dj.git

# Enter the project directory
cd nightshift-dj

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

### 2. Launch
Open your browser and navigate to:
```
http://localhost:5173/
```

> **Pro Tip**: Press <kbd>F11</kbd> to enter full screen mode for an authentic nightclub DJ console layout.

---

## 🎛️ Architecture & Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TOP NAVIGATION BAR                               │
│  [Logo] [View Tabs]       [Audio Specs] [REC MIX] [Clock]       [DSP] [Win] │
├─────────────────────────────────────────────────────────────────────────────┤
│                    STACKED SCROLLING WAVEFORM DISPLAY                       │
│  DECK A (Cyan)   ═══════════════════[ Playhead ]═══════════════════════     │
│  BEAT PHASE METER ───────────────[ LOCKED ]───────────────                  │
│  DECK B (Violet) ═══════════════════[ Playhead ]═══════════════════════     │
├──────────────────────┬───────────────────────────────┬──────────────────────┤
│    DECK A (CYAN)     │       CENTRAL DJ MIXER        │    DECK B (VIOLET)   │
│                      │                               │                      │
│ • Header & BPM       │ • Master & Booth Knobs        │ • Header & BPM       │
│ • Needle Overview    │ • Master Stereo VU Meters     │ • Needle Overview    │
│ • Jog Wheel / Platter│ • Trim / Gain Controls        │ • Jog Wheel / Platter│
│ • Pitch Fader        │ • 3-Band Isolator EQ + Kills  │ • Pitch Fader        │
│ • Auto-Loop Bar      │ • Sound Color FX Filters      │ • Auto-Loop Bar      │
│ • Performance Pads   │ • Channel Faders & VU Meters  │ • Performance Pads   │
│ • Cue / Play / Sync  │ • Crossfader & Curve Selector │ • Cue / Play / Sync  │
├──────────────────────┴───────────────────────────────┴──────────────────────┤
│                      TRACK LIBRARY & CRATE BROWSER                          │
│ [Crates Sidebar]  [Search & Camelot Match Filter]  [Track Table with Load]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⌨️ Keyboard Shortcuts

| Control | Deck A (Cyan) | Deck B (Violet) |
| :--- | :--- | :--- |
| **Play / Pause** | <kbd>Spacebar</kbd> | <kbd>Enter</kbd> |
| **Cue Point** | <kbd>C</kbd> | <kbd>K</kbd> |
| **Sync Tempo & Beat** | <kbd>S</kbd> | <kbd>B</kbd> |
| **Hot Cues 1 through 8** | <kbd>1</kbd> – <kbd>8</kbd> | <kbd>Numpad 1</kbd> – <kbd>8</kbd> |
| **Pitch Bend Nudge** | <kbd>[</kbd> / <kbd>]</kbd> | <kbd>-</kbd> / <kbd>=</kbd> |
| **Bass (Low) Kill** | <kbd>Z</kbd> | <kbd>M</kbd> |
| **Crossfader Left / Right** | <kbd>← Left Arrow</kbd> | <kbd>→ Right Arrow</kbd> |

---

## 📚 Complete User Manual

For an in-depth guide covering beat matching techniques, harmonic mixing with the Camelot wheel, performance pad modes, audio routing, and live recording:

👉 **[Read the Full User Manual (USER_MANUAL.md)](./USER_MANUAL.md)**

---

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Audio Processing**: Web Audio API (Multi-node biquad filtering, variable playback rate, procedural synthesis, low-latency DSP)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 📄 License

This project is open-source and licensed under the **[MIT License](LICENSE)**. Feel free to use, modify, and mix!

> **Pro Tip**: Press <kbd>F11</kbd> to enter full screen mode for an authentic nightclub DJ console layout.

---

## 🎛️ Architecture & Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            TOP NAVIGATION BAR                               │
│  [Logo] [View Tabs]       [Audio Specs] [REC MIX] [Clock]       [DSP] [Win] │
├─────────────────────────────────────────────────────────────────────────────┤
│                    STACKED SCROLLING WAVEFORM DISPLAY                       │
│  DECK A (Cyan)   ═══════════════════[ Playhead ]═══════════════════════     │
│  BEAT PHASE METER ───────────────[ LOCKED ]───────────────                  │
│  DECK B (Violet) ═══════════════════[ Playhead ]═══════════════════════     │
├──────────────────────┬───────────────────────────────┬──────────────────────┤
│    DECK A (CYAN)     │       CENTRAL DJ MIXER        │    DECK B (VIOLET)   │
│                      │                               │                      │
│ • Header & BPM       │ • Master & Booth Knobs        │ • Header & BPM       │
│ • Needle Overview    │ • Master Stereo VU Meters     │ • Needle Overview    │
│ • Jog Wheel / Platter│ • Trim / Gain Controls        │ • Jog Wheel / Platter│
│ • Pitch Fader        │ • 3-Band Isolator EQ + Kills  │ • Pitch Fader        │
│ • Auto-Loop Bar      │ • Sound Color FX Filters      │ • Auto-Loop Bar      │
│ • Performance Pads   │ • Channel Faders & VU Meters  │ • Performance Pads   │
│ • Cue / Play / Sync  │ • Crossfader & Curve Selector │ • Cue / Play / Sync  │
├──────────────────────┴───────────────────────────────┴──────────────────────┤
│                      TRACK LIBRARY & CRATE BROWSER                          │
│ [Crates Sidebar]  [Search & Camelot Match Filter]  [Track Table with Load]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⌨️ Keyboard Shortcuts

| Control | Deck A (Cyan) | Deck B (Violet) |
| :--- | :--- | :--- |
| **Play / Pause** | <kbd>Spacebar</kbd> | <kbd>Enter</kbd> |
| **Cue Point** | <kbd>C</kbd> | <kbd>K</kbd> |
| **Sync Tempo & Beat** | <kbd>S</kbd> | <kbd>B</kbd> |
| **Hot Cues 1 through 8** | <kbd>1</kbd> – <kbd>8</kbd> | <kbd>Numpad 1</kbd> – <kbd>8</kbd> |
| **Pitch Bend Nudge** | <kbd>[</kbd> / <kbd>]</kbd> | <kbd>-</kbd> / <kbd>=</kbd> |
| **Bass (Low) Kill** | <kbd>Z</kbd> | <kbd>M</kbd> |
| **Crossfader Left / Right** | <kbd>← Left Arrow</kbd> | <kbd>→ Right Arrow</kbd> |

---

## 📚 Complete User Manual

For an in-depth guide covering beat matching techniques, harmonic mixing with the Camelot wheel, performance pad modes, audio routing, and live recording:

👉 **[Read the Full User Manual (USER_MANUAL.md)](./USER_MANUAL.md)**

---

## 🛠️ Technology Stack

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Audio Processing**: Web Audio API (Multi-node biquad filtering, variable playback rate, procedural synthesis, low-latency DSP)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 📄 License

This project is open-source and licensed under the **[MIT License](LICENSE)**. Feel free to use, modify, and mix!

