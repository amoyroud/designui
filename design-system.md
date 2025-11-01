# Reverse Moodboard Design System

## Core Principles
- **Calm minimalism:** plenty of whitespace, low-contrast borders, intentional typography.
- **Focus on content:** uploaded imagery and generated summaries are primary focal points.
- **Tactile interactions:** subtle hover/focus transitions; avoid heavy shadows or borders.

## Color Palette
- `#FAF7F2` – Canvas background (warm cream)
- `#F0ECE6` – Subtle surface blocks (drop zone, cards)
- `#D5D0C7` – Separator lines, grid accents
- `#2F2F2F` – Primary text color
- `#5C5C5C` – Secondary text
- `#8A7E6A` – Accent for buttons/active states

Color usage:
- Use background gradient from `#FAF7F2` to `#F0ECE6` sparingly for depth.
- Avoid harsh borders; rely on 1px inset shadows or gradient lines using the neutral grays.

## Typography
- Primary font: `"Geist Sans", "Inter", "Helvetica Neue", Arial, sans-serif`.
- Secondary/monospace (for code or tokens): `"Geist Mono", "SFMono-Regular", Menlo, monospace` (rarely used).
- Headings: medium weight (500–600), tight tracking.
- Body: regular weight, 1.5 line height.

## Spacing Scale
- Base unit: 4px (0.25rem).
- Key increments: 4, 8, 12, 16, 24, 32, 40, 48, 64.
- Maintain generous padding (24–32px) around primary sections.

## Components
- **Drop Zone**
  - Centered container with dashed subtle border using `rgba(47,47,47,0.1)`.
  - Hover: lighten surface, accent text.
  - Include iconography with 32px size, muted.
- **Thumbnail Grid**
  - Use 3-column grid on desktop, collapsing to 2/1 on smaller viewports.
  - Thumbnails with rounded corners (16px radius) and soft inset shadow.
- **Analyze Button**
  - Ghost button with accent text, backdrop blur on hover.
- **Summary Card**
  - Soft surface background, vertical stack, incorporate color swatches as 48px circles.

## Motion
- Duration: 180ms ease-out for hover/focus.
- Use CSS transitions on transform, shadow, and opacity.
- Avoid scale animations > 1.02 to maintain calm feel.

## Accessibility
- Ensure text contrast ratio ≥ 4.5:1; adjust accent tone if necessary.
- Provide focus-visible outlines (1px accent) for keyboard navigation.
- Include descriptive alt text for uploaded images based on file names until analysis is available.

## Layout Guidance
- Max content width 1200px; align summary panel to the right for desktop, stack vertically on mobile.
- Use CSS grid or flex with gap-based spacing to avoid manual margins.
- Keep header/footer minimal for MVP; focus on the canvas interaction.

