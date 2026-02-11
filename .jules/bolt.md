## 2025-05-15 - [O(N^2) data mapping in useProducts hook]
**Learning:** The `useProducts` hook was performing nested `.find()` calls on large arrays (products, vendors, applications) on every fetch. This resulted in $O(Products \times Vendors)$ complexity, which degrades as the marketplace grows.
**Action:** Replace nested `.find()` calls with `Map` lookups to achieve $O(Products + Vendors)$ complexity. Always consider using Maps for relational lookups in data-fetching hooks.

## 2025-05-15 - [Unnecessary re-renders in product lists]
**Learning:** `ProductCard` and `ProductCardMobile` components were re-rendering even when their props didn't change, especially when the parent category filters were toggled.
**Action:** Wrap frequently used list item components in `React.memo()` to prevent unnecessary re-renders in large lists.

## 2025-05-15 - [N+1 query problem in TopVendors component]
**Learning:** The `TopVendors` component was making sequential queries for each vendor to fetch profiles, products, and ratings. This resulted in up to 31 network requests for 6 vendors.
**Action:** Use batch queries with Supabase's `.in()` filter to fetch all related data in bulk and associate them in memory using Maps. Align query limits with UI requirements (e.g., reducing from 6 to 3) to further optimize performance.
