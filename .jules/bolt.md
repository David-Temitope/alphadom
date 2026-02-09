## 2025-05-15 - [O(N^2) data mapping in useProducts hook]
**Learning:** The `useProducts` hook was performing nested `.find()` calls on large arrays (products, vendors, applications) on every fetch. This resulted in $O(Products \times Vendors)$ complexity, which degrades as the marketplace grows.
**Action:** Replace nested `.find()` calls with `Map` lookups to achieve $O(Products + Vendors)$ complexity. Always consider using Maps for relational lookups in data-fetching hooks.

## 2025-05-15 - [Unnecessary re-renders in product lists]
**Learning:** `ProductCard` and `ProductCardMobile` components were re-rendering even when their props didn't change, especially when the parent category filters were toggled.
**Action:** Wrap frequently used list item components in `React.memo()` to prevent unnecessary re-renders in large lists.
