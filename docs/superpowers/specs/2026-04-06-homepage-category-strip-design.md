# Homepage Category Strip — Design Spec

## Overview

Revert the 8 full-width editorial `CategorySection` rows from the homepage, restoring the original layout. Instead, add a compact horizontal-scrolling category strip at the top — a single row of 8 small image+label cards — that acts as the primary category navigation. The rest of the homepage (tabbed "Loved by us" carousel, PromoBanners, Star Rewards, Anticipated Arrivals, Trending, Clearance, etc.) is restored unchanged.

## What Changes

**Remove:**
- `CategorySection` rows from `Home.tsx` (the 8 full-width editorial sections added in the previous sprint)

**Keep:**
- `CategorySection.tsx` and `CategorySectionSkeleton.tsx` (well-designed components, reusable elsewhere — not deleted, just not used on homepage)

**Add:**
- `CategoryStrip` component: a horizontal scrollable row of 8 small image+label cards
- Rendered immediately after `HeroSection` in `Home.tsx`

---

## 1. Component: `CategoryStrip`

**File**: `src/components/CategoryStrip.tsx`

### Props

```typescript
interface CategoryStripProps {
  sections: Array<{
    key: string;
    title: string;
    image: string;
    gender: 'men' | 'women';
    categorySlug: string;
  }>;
}
```

### Visual Design

```
[Full-width strip, bg-white, border-bottom]
  [Container max-w-[1440px] mx-auto px-4]
    [Section label: "Shop by category" — text-sm uppercase tracking-widest text-gray-500 mb-3]
    [Horizontal scrollable row with scroll arrows on sides]

    [Left arrow button]  [8 category cards in flex row]  [Right arrow button]
```

**Each category card:**
- Square image: 80x80px, `object-cover`, rounded-full (circle)
- Label below: category name, text-sm, font-medium, centered
- Entire card is a `<Link>` to the category page
- Hover: slight scale-up (group-hover:scale-105) and opacity change

**Strip height**: `py-6` (vertical padding), total height ~140px
**Card spacing**: `space-x-6` between cards
**Scroll behavior**: cards snap to start (`snap-x snap-start`)
**Hide scrollbar**: `hide-scrollbar` class (already defined in codebase)

**Left/Right arrow buttons**:
- Circular buttons (40x40px) flanking the scroll row
- Shown only on desktop, hidden on mobile
- Left: scrolls container left by ~300px
- Right: scrolls container right by ~300px
- Opacity toggles based on scroll position (show when more content to scroll to)

### Category Cards Data

```typescript
const STRIP_CATEGORIES = [
  { key: 'women-shoes',   title: "Women's Shoes",   image: '...', gender: 'women', categorySlug: 'shoes'   },
  { key: 'men-shoes',     title: "Men's Shoes",     image: '...', gender: 'men',   categorySlug: 'shoes'   },
  { key: 'women-bags',     title: 'Handbags',        image: '...', gender: 'women', categorySlug: 'bags'    },
  { key: 'men-shirts',     title: "Men's Shirts",   image: '...', gender: 'men',   categorySlug: 'shirts'  },
  { key: 'women-blouses',  title: 'Blouses',         image: '...', gender: 'women', categorySlug: 'blouses' },
  { key: 'men-tshirts',    title: "Men's T-Shirts", image: '...', gender: 'men',   categorySlug: 'tshirts' },
  { key: 'women-dresses',  title: 'Dresses',         image: '...', gender: 'women', categorySlug: 'dresses' },
  { key: 'men-jeans',      title: "Men's Jeans",    image: '...', gender: 'men',   categorySlug: 'jeans'   },
];
```

**Images** (Unsplash, same as the CategorySection editorial rows):
```typescript
const STRIP_CATEGORIES = [
  { key: 'women-shoes',  title: "Women's Shoes",  image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200',  gender: 'women', categorySlug: 'shoes'   },
  { key: 'men-shoes',    title: "Men's Shoes",    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200',  gender: 'men',   categorySlug: 'shoes'   },
  { key: 'women-bags',   title: 'Handbags',       image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200',  gender: 'women', categorySlug: 'bags'    },
  { key: 'men-shirts',   title: "Men's Shirts",   image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200',  gender: 'men',   categorySlug: 'shirts'  },
  { key: 'women-blouses',title: 'Blouses',        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc7f6f80?auto=format&fit=crop&q=80&w=200',  gender: 'women', categorySlug: 'blouses' },
  { key: 'men-tshirts',  title: "Men's T-Shirts",image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200',  gender: 'men',   categorySlug: 'tshirts' },
  { key: 'women-dresses',title: 'Dresses',         image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=200',  gender: 'women', categorySlug: 'dresses' },
  { key: 'men-jeans',    title: "Men's Jeans",    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=200',  gender: 'men',   categorySlug: 'jeans'   },
];
```

---

## 2. Home.tsx Changes

### What to Restore

Restore `Home.tsx` to commit `425ce6c` state (the pre-editorial-sections layout) with the following adjustments:

1. **Keep** current API-based `toCardProps` and all `api.products.list()` calls (already using Express API, not Medusa — this is already correct from the current implementation)
2. **Restore** the original structure with `HeroSection` → `ProductCarousel "Loved by us"` (tabbed) → PromoBanners → Star Rewards Challenge → Anticipated Arrivals → Trending → Clearance Banner → Clearance Carousel → Star Rewards Card → Discover → Recently Viewed
3. **Add** `CategoryStrip` import and render it after `HeroSection`
4. **Remove** the `CategorySection` map that was added in the previous sprint

### Home.tsx Render Order (final)

```
<main>
  <HeroSection />

  <CategoryStrip sections={STRIP_CATEGORIES} />

  <ProductCarousel title="Loved by us, picked for you" tabs=[...] products={lovedProducts.map(toCardProps)} />
  <PromoBanner ... />  (Spring break)
  <PromoBanner ... />  (Denim 30% OFF)
  <PromoBanner ... />  (World Soccer HQ)
  <Star Rewards Challenge Banner />  (with 4-circle grid)
  <Anticipated Arrivals grid />  (3-column: black card + DIOR + Fiesta)
  <ProductCarousel title="Trending now" />
  <Clearance Banner />  (black, 40-70% OFF)
  <ProductCarousel title="Shop clearance now" />
  <Star Rewards 30% OFF Banner />
  <ProductCarousel title="Discover more options" />
  <ProductCarousel title="Recently viewed items" />
</main>
```

### State to Restore

- `lovedProducts`, `trendingProducts`, `clearanceProducts`, `discoverProducts`
- `lovedTab` state
- `LOVED_TABS` constant
- `useEffect` hooks for each carousel fetch
- The original `toCardProps` (already using `api.products.list()` from Express — keep current)

---

## 3. Implementation Order

1. Create `src/components/CategoryStrip.tsx` — horizontal scrollable category strip
2. Update `Home.tsx` — restore original layout, add CategoryStrip, remove CategorySection rows
3. Verify: run `npm run dev:full`, check homepage looks correct
4. Run `npm test` and `npm run lint` — fix any type errors
5. Commit
