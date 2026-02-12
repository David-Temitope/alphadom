# Palette's Journal - Alphadom

## 2025-05-14 - [A11y] Missing ARIA labels on icon buttons
**Learning:** Icon-only buttons (like shopping cart, heart, menu, notifications) are common in this app but often lack descriptive ARIA labels, making them inaccessible to screen reader users.
**Action:** Always provide `aria-label` for icon-only buttons using the `Button` component or other interactive elements.

## 2025-05-15 - [UX] Ambiguous vendor verification badges
**Learning:** Color-coded badges or icons (like vendor verification checks) are often ambiguous to users who don't know the color scheme.
**Action:** Provide descriptive `title` attributes (for tooltips) and `aria-label` or hidden text (for screen readers) to explain the meaning of status indicators.

## 2025-05-16 - [A11y] Redundant screen reader announcements
**Learning:** Icons that are purely decorative or redundant (e.g., placed next to descriptive text like 'Vendor Pick' or 'VERIFIED MERCHANT') should include `aria-hidden="true"` to avoid redundant or confusing screen reader announcements.
**Action:** Use `aria-hidden="true"` for icons that do not provide additional information beyond the adjacent text.

## 2025-05-17 - [A11y] Semantic rating components
**Learning:** Rating components (like stars) are often inaccessible if implemented as just a list of buttons or icons. They should be treated as a single informative "img" when read-only, and as a labeled group of buttons when interactive.
**Action:** Use `role="img"` with a descriptive `aria-label` for read-only ratings, and `role="group"` with labeled buttons for interactive ones. Always hide decorative SVG stars from the accessibility tree.
