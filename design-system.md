# Reverse Moodboard Design System

## Core Principles
- **Bauhaus-inspired geometry:** Bold use of circles, grids, and mathematical precision.
- **Forward-thinking aesthetic:** Deep blues and greens with stark white surfaces create edgy, modern contrast.
- **Conceptual clarity:** Grid-based layouts with dot matrix patterns and constellation motifs.
- **Purposeful interaction:** Geometric hover states, bold transitions, unapologetic visual hierarchy.

## Color Palette

### Primary Colors
- `#F5F2ED` – Canvas background (warm off-white)
- `#FFFFFF` – Pure white surface
- `#0D1E3C` – Deep navy foreground

### Accent Colors (Bauhaus-inspired)
- `#2A4A8A` – Primary blue (deep, confident)
- `#1A4D2E` – Forest green (grounded, organic)
- `#4A6FA5` – Accent blue (interactive states)
- `#2D6645` – Accent green (secondary interactions)

### Neutral Tones
- `#5A6B8A` – Muted blue-gray (secondary text)
- `#8A9BAA` – Light muted (tertiary text)
- `#E0DCD5` – Grid lines (subtle)
- `#C5BEAF` – Grid lines strong (borders)

### Color Usage
- Background has subtle grid overlay (40px×40px) at 25% opacity
- Cards use 2px solid borders with dot matrix patterns
- Blue panels feature constellation-like dot patterns with pulse animation
- Green panels for accent sections and secondary information
- High contrast between surfaces for geometric clarity

## Typography
- Primary font: `"Geist Sans"` with fallbacks to geometric sans-serifs
- Monospace: `"Geist Mono"` for technical content
- **Headings:** Bold (600-700 weight), tight tracking (-0.02em), uppercase for labels
- **Body:** Regular weight (400), slightly open tracking (0.005em), 1.6 line height
- **Labels:** Uppercase, wide tracking (0.2-0.3em), small caps treatment

### Type Scale
- Display: 48px / 3rem (hero)
- H1: 36px / 2.25rem
- H2: 24px / 1.5rem
- H3: 18px / 1.125rem
- Body: 16px / 1rem
- Small: 14px / 0.875rem
- Tiny: 12px / 0.75rem
- Label: 10px / 0.625rem (uppercase)

## Spacing Scale
- Base unit: 8px (0.5rem) – mathematical progression
- Key increments: 8, 16, 24, 32, 40, 48, 64, 80, 96, 128
- Generous padding (40-48px) for major sections
- Consistent 24px gaps between components

## Components

### Drop Zone
- White surface with 2px solid border (`#C5BEAF`)
- Geometric grid pattern overlay (20px×20px) at 30% opacity
- Hover: Scale 1.01, border color shifts to blue accent
- Icon: 48px, geometric circle treatment
- Dashed border style on inactive, solid on active

### Thumbnail Grid
- 3-column grid with 16px gaps
- Sharp corners (0px radius) – Bauhaus aesthetic
- 2px border with hover state
- Overlay: dot matrix pattern on hover
- Remove button: circular, positioned top-right

### Buttons
- **Primary:** Solid blue background, white text, uppercase, wide tracking
- **Secondary:** 2px border, transparent background, blue text
- **Ghost:** No border, underline on hover
- All buttons: 0px border-radius (sharp), 12px vertical padding, 24px horizontal
- Hover: Slight translate-y(-2px) for dimensionality

### Summary Card
- Deep blue background (`#2A4A8A`) with constellation pattern
- White text for high contrast
- Color swatches: 64px circles with 2px white borders
- Floating geometric decorations (circles, grids)
- Fixed position on desktop, stack on mobile

### Analysis Panels
- White cards with 2px borders
- Dot matrix pattern overlay (16px×16px) at 20% opacity
- Grid fade animation (8s ease-in-out infinite)
- Sharp corners, bold typography
- Geometric dividers between sections

### Geometric Elements
- Circles: 2px stroke, no fill
- Grids: 1px lines, 20px spacing
- Dots: 1.5-2.5px circles in constellation arrangements
- Spirals: Concentric circles for decorative accents

## Motion & Animation

### Transitions
- Duration: 220ms cubic-bezier(0.4, 0, 0.2, 1)
- Hover transforms: translateY(-2px) + slight shadow
- Focus: 2px outline with 4px offset
- Avoid scale > 1.02 to maintain precision

### Keyframe Animations
- **constellation-pulse:** 12s ease-in-out infinite (0.3 → 1 → 0.3 opacity)
- **grid-fade:** 8s ease-in-out infinite (0.15 → 0.4 → 0.15 opacity)
- Use sparingly for ambient background effects

## Patterns & Decorations

### Grid Overlay
- Applied to body as fixed ::before pseudo-element
- 40px×40px grid, 1px lines
- 25% opacity, non-interactive

### Dot Matrix
- 16px×16px spacing, 1.5px circles
- 20% opacity, applied to card overlays
- Creates "pixel" or "constellation" effect

### Constellation Pattern
- Random dot placement at various scales (1-2.5px)
- Applied to blue panels
- Subtle pulse animation for depth

### Geometric Accents
- Floating circles (120px diameter, 2px stroke, 15% opacity)
- Grid sections for background texture
- Spiral decorations for section breaks

## Accessibility

### Contrast Ratios
- White on blue: 8.5:1 (WCAG AAA)
- Navy on cream: 12:1 (WCAG AAA)
- Blue accent on white: 4.8:1 (WCAG AA)

### Focus States
- 2px solid outline in accent blue
- 4px offset for clarity
- High contrast against all backgrounds

### Alt Text
- Descriptive labels for all images
- ARIA labels for interactive geometric elements
- Keyboard navigation fully supported

## Layout Guidance

### Grid System
- Max content width: 1280px (wider for geometric breathing room)
- Primary content: 2/3 width
- Sidebar/summary: 1/3 width
- Mobile: Full width stack, 24px horizontal padding

### Vertical Rhythm
- Section spacing: 64-80px
- Component spacing: 24-32px
- Element spacing: 12-16px
- Consistent baseline grid for text alignment

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Wide: > 1440px

## Design Philosophy

This system draws inspiration from Bauhaus principles:
- **Form follows function** – Every geometric element serves a purpose
- **Mathematical precision** – Grid-based layouts with consistent proportions
- **Bold experimentation** – Confident use of color and shape
- **Modernist clarity** – High contrast, clean hierarchy, no decoration for decoration's sake

Visual references: Minimalist diagrams, constellation maps, architectural grids, conceptual posters with circles and spirals, dot matrix displays, geometric meditation patterns.

