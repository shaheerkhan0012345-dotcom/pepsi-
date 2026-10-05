# PEPSI® // REFRESH THE FUTURE — 3D Award-Style Hero Concept

An award-winning 3D hero section concept website for Pepsi built with **React**, **Vite**, **Tailwind CSS**, **Three.js** via **@react-three/fiber** and **@react-three/drei**, **GSAP + ScrollTrigger**, and **Lenis** smooth scrolling.

---

## 🚀 Quick Start

### 1. Installation
Install all required dependencies:
```bash
npm install
```

Exact packages installed:
```bash
npm install three @react-three/fiber @react-three/drei gsap lenis lucide-react react react-dom
npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer
```

### 2. Development Server
Run the local Vite development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🥫 3D Model Configuration & Tweak Guide

The 3D model is loaded from `/public/pepsi_can.glb`.

In [`src/components/CanScene.jsx`](./src/components/CanScene.jsx), the can's orientation, scale, and positioning are configured in a single, clearly commented block:

```javascript
export const MODEL_CONFIG = {
  // Desired height of the can in Three.js world units
  targetHeight: 3.2,

  // Manual rotation override [x, y, z] in radians (Math.PI / 2 = 90 deg)
  manualRotation: [0, 0, 0],

  // Extra manual position offset [x, y, z] to fine-tune center of gravity
  manualOffset: [0, 0, 0],

  // Idle animation parameters
  idleFloatSpeed: 1.5,     // Speed of floating sin-wave
  idleFloatAmplitude: 0.07, // Height of floating sin-wave
  idleRotationSpeed: 0.25,  // Gentle baseline spin on Y axis

  // Mouse tilt sensitivity (disabled on mobile)
  mouseTiltX: 0.25,
  mouseTiltY: 0.25,
};
```

### How Auto-Fit Works:
1. `THREE.Box3().setFromObject(cloned)` measures the raw dimensions of the model (~4.3 × 4.3 × 7.9).
2. It detects that the cylinder height lies along the Z-axis and applies `-Math.PI / 2` around the X-axis to place it upright along the Y-axis.
3. The geometry center is computed and shifted to `(0, 0, 0)` so it pivots around its physical center.
4. Scale is dynamically calculated as `MODEL_CONFIG.targetHeight / currentHeight` so the can stands at ~3.2 units tall.

---

## 🎨 Visual & Motion Architecture

- **Visual Style**: Warm off-white `#F2F0EB` with an SVG fractal noise/film-grain overlay, near-black `#0B0B0F` typography, electric Pepsi blue `#0A4DA3`, and signature red `#E32934`.
- **Fonts**: Google Fonts `Pixelify Sans` & `Doto` for pixel headlines; `Space Grotesk` for UI and body text.
- **Loading Screen**: Digital dot-matrix 0–100% counter with pixel block indicators and status diagnostics.
- **Entrance Timeline**:
  1. Headline reveals line-by-line via masked slide-up (`power4.out`).
  2. 3D Pepsi can drops from above with a slight bounce (`bounce.out`).
  3. Navbar, subtext, and partner logo strip fade in.
- **Pinned ScrollTrigger & Lenis**:
  - The hero pins for `150vh`.
  - Can spins ~360° on Y, tilts ~25° on Z, and scales up.
  - Headline letters separate with interactive parallax.
  - Subtext and logo strip fade out.
  - At the end of the sequence, the can translates to the right handoff zone.
