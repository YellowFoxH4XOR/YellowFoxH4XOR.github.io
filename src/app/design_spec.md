# Personal Developer Website Design Specification

This document outlines the premium design system, custom utilities, animation behaviors, and color science used in the redesigned developer site. The system utilizes standard **Tailwind CSS v4** rules and modern **OKLCH** color spaces to deliver a high-end, sleek aesthetic.

---

## 1. Color System (OKLCH)

We transitioned the entire codebase to modern **OKLCH** color coordinates, providing perceptually uniform lightness steps, smooth gradient transitions, and high-fidelity colors. The color theme features a signature **amethyst / violet hue (285°)**.

### Light Theme
- **Background**: `oklch(0.985 0.006 285)` — A premium warm, off-white background with a hint of purple hue.
- **Foreground**: `oklch(0.16 0.02 285)` — Deep dark plum for readability.
- **Cards/Panels**: `oklch(1 0 0 / 70%)` with backdrop blur for glassmorphism.
- **Primary / Brand**: `oklch(0.60 0.22 285)` — Rich, high-chroma violet.
- **Borders**: `oklch(0.90 0.015 285 / 70%)` — Semi-transparent boundaries.

### Dark Theme
- **Background**: `oklch(0.085 0.015 285)` — A deep, mysterious space midnight with purple-indigo undertones.
- **Foreground**: `oklch(0.94 0.015 285)` — Soft violet-gray, ensuring high contrast without eye strain.
- **Cards/Panels**: `oklch(0.12 0.02 285 / 60%)` with backdrop blur.
- **Primary / Brand**: `oklch(0.68 0.19 285)` — A bright, glowing violet.
- **Borders**: `oklch(0.20 0.02 285 / 50%)` — Translucent border lines.

---

## 2. Typography & Text Effects

- **Font Stack**: System sans-serif for headings/body (`Geist`), paired with monospace (`Fira Code`) for technical subheads, badges, and codes.
- **Brand Text Gradients**:
  - `.text-gradient-brand`: Blends the custom brand violet, a soft rose/pink-magenta, and the theme's foreground color.
  - `.text-gradient-cyber`: A three-stop cyberpunk gradient spanning cyan, violet, and magenta.
- **Markdown Articles (`.article`)**:
  - Heading tags (`h1`) feature the brand text gradient and a bottom border.
  - Links feature a custom underline pseudo-element sliding out from the center-right on hover.
  - Blockquotes feature a rounded background, thin brand border, and soft vertical accenting.

---

## 3. Layout & Visual Utility Classes

### Background Grid Patterns
- `.bg-grid-pattern`: 40px × 40px grid created using thin CSS linear-gradients tied to Tailwind's adaptive `--color-border` variable.
- `.bg-dot-pattern`: 24px × 24px subtle dot array.
- **Ambient Glows**: Configured in `RootLayout` with layered absolute elements that project blurred, pulsing circles (`bg-brand/8` and `bg-brand/5`) behind the content layout.

### Glassmorphism
- `.glass-panel`: Applies a semi-transparent, blurred backdrop effect using `backdrop-filter: blur(12px)` and color-mixed boundaries.
- `.glass-card`: A comprehensive utility combining glass paneling, subtle shadow, and responsive hover scaling, lifting the card by 3px and deepening the shadow with brand-colored glowing accents.

---

## 4. Keyframe Animations

We defined premium keyframes in the `@theme inline` block of `globals.css`:

1. **Staggered Fade-In Up** (`animate-fade-in-up`):
   - **Keyframes**: Fades from `opacity: 0; transform: translateY(24px)` to `opacity: 1; transform: translateY(0)`.
   - **Staggering**: Controlled using utility classes like `animation-delay-100` to `animation-delay-400` to stagger load order on headers, links, and cards.
2. **Ambient Pulse** (`animate-pulse-slow`):
   - **Keyframes**: Gently pulses opacity of background glows between `0.35` and `0.75` over an 8-second loop.
3. **Card Wiggle & Slide**:
   - Arrows on lists/buttons translate horizontally (`translate-x-2` to `translate-x-0`) while fading in, giving interactive elements a responsive, tactile feedback.
