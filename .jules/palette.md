# Palette's Journal - Alphadom

## 2025-05-14 - [A11y] Missing ARIA labels on icon buttons
**Learning:** Icon-only buttons (like shopping cart, heart, menu, notifications) are common in this app but often lack descriptive ARIA labels, making them inaccessible to screen reader users.
**Action:** Always provide `aria-label` for icon-only buttons using the `Button` component or other interactive elements.
