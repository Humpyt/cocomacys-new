# Homepage Category Sections — Design Spec

## Overview

Replace the current "Loved by us" tabbed carousel and scattered promo sections on the homepage with 8 dedicated, full-width category sections. Each section is a self-contained component that fetches its own products from the Express API and displays them in an alternating editorial-style layout.

## Design Principles

- **Editorial full-width rows**: Each category gets its own full-width section with an image on one side and a horizontally-scrolling product carousel on the other. Image side alternates left/right per section.
- **Self-contained fetching**: Each `CategorySection` owns its own data fetching via `useEffect`. One section's failure doesn't affect others.
- **Progressive enhancement**: Loading skeletons while fetching, graceful empty state if no products returned.
- **Mobile-first**: Image stacks above products on mobile; two-column on desktop.

---

## 1. Component: `CategorySection`

**File**: `src/components/CategorySection.tsx`

### Props

```typescript
interface CategorySectionProps {
  /** Section title displayed above the carousel */
  title: string;
  /** Optional subtitle/eyebrow text */
  subtitle?: string;
  /** Hero image URL (Unsplash or uploaded) */
  image: string;
  /** Express collection ID to filter products */
  collectionId: string;
  /** Gender used as API filter */
  gender: 'men' | 'women';
  /** If true, image renders on the right side (default: false = left) */
  reverse?: boolean;
  /** Number of products to fetch (default: 6) */
  limit?: number;
}
```

### Internal State

- `products: ApiProductRecord[]` — fetched products
- `loading: boolean` — true while fetching
- `error: string | null` — error message if fetch fails

### Layout (Desktop)

```
[Full-width section, bg-cream or bg-white alternating per section]
  [max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8]
    [grid grid-cols-1 md:grid-cols-2 gap-0]

    [Image side]: (col-span-1)
      [aspect-[3/4] overflow-hidden]
        [img w-full h-full object-cover]
      (only shown on desktop: one column is image, other is content)

    [Content side]: (col-span-1, bg-cream or bg-white, flex flex-col justify-center)
      [py-12 px-8 lg:px-16]
        [Eyebrow: subtitle in uppercase tracking-widest text-sm mb-2]
        [Title: text-3xl lg:text-4xl font-serif font-bold mb-2]
        [Horizontal ProductCarousel, 4-6 products visible by scroll]
        [CTA link: "Shop all →" aligned right]
```

### Layout (Mobile)

```
[stacked, image first at aspect-[4/3], products below]
```

### Data Fetching

```typescript
useEffect(() => {
  api.products.list({ collection_id: collectionId, gender, limit: limit ?? 6, order: 'created_at DESC' })
    .then(({ products }) => setProducts(products))
    .catch(err => setError(getErrorMessage(err)))
    .finally(() => setLoading(false));
}, [collectionId, gender, limit]);
```

### Empty State

If `products.length === 0` after fetch, render a muted placeholder: section title + "No products found." in the content area instead of the carousel.

### Loading State

Render 4 `ProductCard` skeleton placeholders (gray animated bg) while `loading === true`.

---

## 2. Homepage Sections Config

**File**: `src/pages/Home.tsx` (section config array near top of file)

```typescript
const HOMEPAGE_CATEGORY_SECTIONS: CategorySectionProps[] = [
  {
    key: 'women-shoes',
    title: "Women's Shoes",
    subtitle: 'Step into style',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.women.subcategories.shoes,
    gender: 'women',
    reverse: false,
  },
  {
    key: 'men-shoes',
    title: "Men's Shoes",
    subtitle: 'Fresh finds for every day',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.men.subcategories.shoes,
    gender: 'men',
    reverse: true,
  },
  {
    key: 'women-bags',
    title: 'Handbags',
    subtitle: 'Your perfect carry-along',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.women.subcategories.bags,
    gender: 'women',
    reverse: false,
  },
  {
    key: 'men-shirts',
    title: "Men's Shirts",
    subtitle: 'Tailored to a tee',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.men.subcategories.shirts,
    gender: 'men',
    reverse: true,
  },
  {
    key: 'women-blouses',
    title: 'Blouses',
    subtitle: 'Effortlessly polished',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc7f6f80?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.women.subcategories.blouses,
    gender: 'women',
    reverse: false,
  },
  {
    key: 'men-tshirts',
    title: "Men's T-Shirts",
    subtitle: 'Easy layers, endless style',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.men.subcategories.tshirts,
    gender: 'men',
    reverse: true,
  },
  {
    key: 'women-dresses',
    title: 'Dresses',
    subtitle: 'From desk to dinner',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.women.subcategories.dresses,
    gender: 'women',
    reverse: false,
  },
  {
    key: 'men-jeans',
    title: "Men's Jeans",
    subtitle: 'Built for comfort',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.men.subcategories.jeans,
    gender: 'men',
    reverse: true,
  },
];
```

---

## 3. Homepage `Home.tsx` Changes

### Removals

- `LOVED_TABS` constant and `LovedTabKey` type
- `lovedProducts` state and `lovedTab` state
- `trendingProducts` state
- `discoverProducts` state
- `getSectionProducts()` helper
- `useEffect` for loved tab switching
- `useEffect` for trending/discover computation (replaced by per-section fetching)
- The `ProductCarousel` with `LOVED_TABS` (tabbed carousel)
- The inline `Star Rewards` 4-circle category grid JSX
- The inline 3-column Women's Tops / Men's Shirts promo grid

### Additions

- Import `CategorySection` component
- Import `HOMEPAGE_CATEGORY_SECTIONS` config (inline array in `Home.tsx`)
- Render `HeroSection` (unchanged — stays at top)
- Render 8 `<CategorySection {...section} />` in a `div` wrapper per section
- After all category sections: existing clearance banner and clearance carousel (kept)
- Footer (unchanged)

### Loading

The initial `Promise.all` fetch for `allProducts` is no longer needed for the category sections (each section fetches independently). However, `allProducts` is still used for the clearance carousel. The `useEffect` for trending/clearance/discover can be slimmed or kept for those three existing carousels.

### Imports needed in Home.tsx

```typescript
import { CategorySection } from '../components/CategorySection';
// COLLECTION_IDS already imported — no change needed
// getWomenCategoryHref / getMenCategoryHref still used by PromoBanners and clearance banner
```

---

## 4. New File: `src/components/CategorySectionSkeleton.tsx`

Reusable skeleton for loading state — 4 gray shimmer cards matching `ProductCard` dimensions. Used by `CategorySection` while loading.

```typescript
// 4 placeholder cards in a flex row, same width as ProductCarousel items
// Shimmer animation: bg-gray-200 with animate-pulse
```

---

## 5. Existing Sections Preserved

The following are NOT changed and remain in `Home.tsx`:
- `HeroSection`
- 3 `PromoBanner` components (Spring layers, Denim, Men's shirts)
- Star Rewards text/banner block
- Clearance 40-70% OFF banner
- Clearance `ProductCarousel`
- Star Rewards card promo
- "Discover more options" and "Recently viewed" `ProductCarousel`s (keep as-is if `allProducts` is still fetched)

---

## 6. Error Handling

- If `CategorySection` fetch fails: render error state inline (section still renders with title, shows "Failed to load products" message in place of carousel)
- Empty state: if `products.length === 0` and not loading, show section title + "No products found" instead of carousel

---

## 7. Background Colors (alternating per section)

Odd sections (1, 3, 5, 7): `bg-white`
Even sections (2, 4, 6, 8): `bg-[#fdf3e7]` (warm cream — same used by existing Star Rewards section)

---

## 8. Implementation Order

1. Create `src/components/CategorySectionSkeleton.tsx`
2. Create `src/components/CategorySection.tsx`
3. Add `HOMEPAGE_CATEGORY_SECTIONS` config array to `Home.tsx`
4. Remove old state/effects/JSX from `Home.tsx`
5. Wire up 8 `<CategorySection>` rows in `Home.tsx`
6. Verify: run `npm run dev:full`, check all 8 sections load with products
7. Run `npm test` and `npm run lint` — fix any type errors
