# Classic Pong (Black & White Mini App)

A minimalist, retro 1972-style Black & White Pong game built with pure HTML5 Canvas and vanilla JavaScript. Created as part of **Global Hack Week: Open Source - Challenge 1 (Build a Mini App)**.

## Features

- **Classic Black & White Aesthetic**: Monospace typography, dashed divider, square ball, rectangular paddles, and arcade-style visual cues.
- **Single Player vs AI**: Play against an AI opponent with responsive tracking and recovery movement.
- **2-Player Local Mode**: Play locally with a friend on the same keyboard.
- **Realistic Ball Physics**: Angle of reflection dynamically varies based on the point of impact on the paddle; ball speed gradually accelerates with consecutive rallies.
- **Retro Audio Synthesizer**: Uses Web Audio API oscillator beeps (paddle hit, wall bounce, scoring, and victory chime) without external audio asset dependencies.
- **Controls & States**: Start, pause, resume, reset, and mute toggles.

## Quick Start

No build tools or servers required! Simply open `index.html` in your web browser:

1. Clone or download this repository.
2. Double-click `index.html` or open it with your browser of choice (Chrome, Firefox, Safari, Edge).

## Controls

| Action | Control |
| --- | --- |
| **Player 1 (Left)** | <kbd>W</kbd> (Up) / <kbd>S</kbd> (Down) |
| **Player 2 (Right)** | <kbd>▲</kbd> (Up) / <kbd>▼</kbd> (Down) *(when in 2P mode)* |
| **Serve / Pause / Resume** | <kbd>Space</kbd> |
| **Restart Game** | <kbd>R</kbd> |
| **Toggle Sound** | <kbd>M</kbd> |
| **Switch Game Mode** | Dropdown menu above the canvas |

## Project Structure

```text
challenge-1-mini-app/
├── index.html               # Canvas setup and UI layout
├── style.css                # Retro arcade styling (pure black and white)
├── game.js                  # Game loop, physics, sound synth, AI, and input
├── challenge-description.md # Challenge 1 prompt and criteria
├── .gitignore               # Standard ignore patterns
└── README.md                # Project documentation
```

## Challenge Submission Details

- **What was built:** A classic retro black-and-white Pong mini-game in HTML5 and vanilla JavaScript featuring single-player AI, two-player local mode, dynamic rally acceleration, and authentic Web Audio sound synthesis.
- **How it was built:** Scaffolded and assembled step-by-step with an AI pair programmer, moving from concept to a playable, zero-dependency browser game in minutes.
