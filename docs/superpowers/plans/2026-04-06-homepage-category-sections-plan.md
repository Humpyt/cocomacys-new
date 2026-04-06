# Homepage Category Sections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "Loved by us" tabbed carousel and scattered promo grids on the homepage with 8 self-contained, full-width editorial category sections, each fetching its own products via the Express API.

**Architecture:** A new `CategorySection` component owns its own product fetching via `useEffect`. Each section renders a full-width two-column row (image side + content/product carousel side) with alternating layout direction. A `CategorySectionSkeleton` handles the loading state. The homepage maps over a config array to render all 8 sections.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, `api.products.list()` from `src/lib/api.ts`, `COLLECTION_IDS` from `src/lib/subcategoryMap.ts`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/CategorySectionSkeleton.tsx` | **Create** | Shimmer skeleton for 4 ProductCard-sized placeholders |
| `src/components/CategorySection.tsx` | **Create** | Self-contained section: image + title + subtitle + ProductCarousel |
| `src/pages/Home.tsx` | **Modify** | Remove old state/JSX; add 8 CategorySection rows |

No backend changes. No new API routes. No database changes.

---

## Task 1: Create `CategorySectionSkeleton`

**Files:**
- Create: `src/components/CategorySectionSkeleton.tsx`

- [ ] **Step 1: Write the skeleton component**

Create `src/components/CategorySectionSkeleton.tsx` with this exact content:

```tsx
import React from 'react';

interface CategorySectionSkeletonProps {
  reverse?: boolean;
}

export function CategorySectionSkeleton({ reverse = false }: CategorySectionSkeletonProps) {
  return (
    <div className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 ${reverse ? '' : ''}`}>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-0 ${reverse ? 'md:flex-row-reverse' : ''}`}>
        {/* Image skeleton */}
        <div className="bg-gray-200 animate-pulse aspect-[3/4] md:aspect-auto md:col-span-1" />

        {/* Content skeleton */}
        <div className="bg-[#fdf3e7] p-8 lg:p-16 flex flex-col justify-center md:col-span-1">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-4" />
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-8" />
          <div className="flex space-x-4 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="shrink-0 w-[200px] md:w-[240px]">
                <div className="bg-gray-200 animate-pulse aspect-[3/4] rounded mb-2" />
                <div className="h-3 w-20 bg-gray-200 animate-pulse rounded mb-1" />
                <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --skipLibCheck`
Expected: No errors related to `CategorySectionSkeleton`

- [ ] **Step 3: Commit**

```bash
git add src/components/CategorySectionSkeleton.tsx
git commit -m "feat(homepage): add CategorySectionSkeleton loading placeholder"
```

---

## Task 2: Create `CategorySection` Component

**Files:**
- Create: `src/components/CategorySection.tsx`

- [ ] **Step 1: Write the CategorySection component**

Create `src/components/CategorySection.tsx` with this exact content:

```tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard, ProductCardProps } from './ProductCard';
import { CategorySectionSkeleton } from './CategorySectionSkeleton';
import {
  api,
  type ApiProductRecord,
  formatCurrency,
  getErrorMessage,
  getProductDiscountLabel,
  getProductImage,
  getProductOriginalPrice,
  getProductPrice,
  getProductRating,
} from '../lib/api';
import { getWomenCategoryHref, getMenCategoryHref } from '../lib/navigation';

interface CategorySectionProps {
  title: string;
  subtitle?: string;
  image: string;
  collectionId: string;
  gender: 'men' | 'women';
  reverse?: boolean;
  limit?: number;
}

function toCardProps(product: ApiProductRecord): ProductCardProps {
  const image = getProductImage(product);
  const price = getProductPrice(product);
  const originalPrice = getProductOriginalPrice(product);

  return {
    id: String(product.id),
    image: image ?? '',
    brand: product.brand || product.category || 'Brand',
    name: product.name,
    price: formatCurrency(price),
    originalPrice: originalPrice != null ? formatCurrency(originalPrice) : undefined,
    discount: getProductDiscountLabel(product),
    rating: getProductRating(product),
    reviews: product.reviews ?? 0,
    colors: product.colors.length > 0 ? product.colors : undefined,
    promo: product.promo ?? undefined,
  };
}

export function CategorySection({
  title,
  subtitle,
  image,
  collectionId,
  gender,
  reverse = false,
  limit = 6,
}: CategorySectionProps) {
  const [products, setProducts] = useState<ApiProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api.products
      .list({ collection_id: collectionId, gender, limit, order: 'created_at DESC' })
      .then(({ products }) => {
        if (!cancelled) {
          setProducts(products);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(getErrorMessage(err, 'Failed to load products.'));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [collectionId, gender, limit]);

  const ctaHref = gender === 'women' ? getWomenCategoryHref(collectionId) : getMenCategoryHref(collectionId);

  if (loading) {
    return <CategorySectionSkeleton reverse={reverse} />;
  }

  if (error) {
    return (
      <div className={`max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 ${reverse ? '' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="bg-gray-100 animate-pulse aspect-[3/4] md:aspect-auto md:col-span-1" />
          <div className="bg-[#fdf3e7] p-8 lg:p-16 flex flex-col justify-center md:col-span-1">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-0 ${reverse ? 'md:flex-row-reverse' : ''}`}>
        {/* Image side */}
        <div className="md:col-span-1 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full aspect-[3/4] md:aspect-[4/5] object-cover object-center"
          />
        </div>

        {/* Content side */}
        <div className="md:col-span-1 bg-[#fdf3e7] flex flex-col justify-center p-8 lg:p-16">
          {subtitle && (
            <p className="uppercase tracking-widest text-sm text-gray-500 mb-2">{subtitle}</p>
          )}
          <h2 className="text-3xl lg:text-4xl font-serif font-bold mb-6">{title}</h2>

          {products.length === 0 ? (
            <p className="text-gray-500 text-sm">No products found.</p>
          ) : (
            <div className="relative group">
              <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
                {products.map(product => (
                  <div key={product.id} className="snap-start shrink-0 w-[200px] md:w-[240px]">
                    <ProductCard {...toCardProps(product)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 text-right">
            <Link
              to={ctaHref}
              className="text-sm font-bold underline hover:text-gray-600"
            >
              Shop all {title} &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --skipLibCheck`
Expected: No errors related to `CategorySection`

- [ ] **Step 3: Commit**

```bash
git add src/components/CategorySection.tsx
git commit -m "feat(homepage): add CategorySection self-contained component"
```

---

## Task 3: Update `Home.tsx` — Remove Old State and Add Category Sections

**Files:**
- Modify: `src/pages/Home.tsx`

> Before editing, the file at `src/pages/Home.tsx` has these things to **remove**:
> - `LOVED_TABS` constant and `LovedTabKey` type (lines ~43-50)
> - `lovedProducts` state (line ~71)
> - `lovedTab` state (line ~75)
> - `trendingProducts` state (line ~72) — but note: still needed for the "Trending now" carousel
> - `discoverProducts` state (line ~74) — still needed for "Discover more options" carousel
> - `getSectionProducts()` helper (lines ~83-84) — remove entirely
> - The `useEffect` for loved tab switching (lines ~108-139) — remove entirely
> - The `useEffect` that computes `trendingProducts` / `clearanceProducts` / `discoverProducts` (lines ~100-106) — slim to only compute `clearanceProducts` (still used by the clearance carousel)
> - The `Promise.all` that fetches `allProducts` and `homepageSections` — slim to only fetch `allProducts` (still needed for clearance carousel)
> - The `lovedProducts.map(toCardProps)` + `ProductCarousel` with `LOVED_TABS` (the "Loved by us, picked for you" carousel)
> - The inline `Star Rewards` 4-circle category grid (the `<div className="bg-[#fdf3e7]">` with the 4 `<Link>` circles)
> - The 3-column Women's Tops / Men's Shirts promo grid

> Things to **keep**:
> - `HeroSection`
> - 3 `PromoBanner` components
> - `Star Rewards` text block
> - Clearance banner
> - Clearance `ProductCarousel`
> - Star Rewards card promo block
> - "Trending now" `ProductCarousel` (keep trendingProducts)
> - "Discover more options" `ProductCarousel` (keep discoverProducts)
> - `allProducts` state and its initial fetch (needed for trending + discover + clearance carousels)
> - `clearanceProducts` computation
> - `toCardProps` helper function

- [ ] **Step 1: Read current Home.tsx to get exact line context**

Run: `wc -l src/pages/Home.tsx` to confirm line count, then proceed with the edit knowing the structure.

- [ ] **Step 2: Remove LOVED_TABS, LovedTabKey, lovedProducts, lovedTab state**

Find and remove from `Home.tsx`:
```typescript
const LOVED_TABS = [
  { key: 'new-arrivals', label: 'New arrivals' },
  { key: 'deals', label: 'Deals for you' },
  { key: 'dressy', label: 'Dressy looks' },
  { key: 'handbags', label: 'Spring handbags' },
] as const;

type LovedTabKey = (typeof LOVED_TABS)[number]['key'];
```

- [ ] **Step 3: Remove lovedProducts and lovedTab state declarations**

Remove:
```typescript
const [lovedProducts, setLovedProducts] = useState<ApiProductRecord[]>([]);
const [lovedTab, setLovedTab] = useState<LovedTabKey>('new-arrivals');
```

- [ ] **Step 4: Remove getSectionProducts helper and old useEffect blocks**

Remove the `getSectionProducts` function:
```typescript
const getSectionProducts = (section: HomepageSection) =>
  section.productIds.map(id => productMap[id]).filter(Boolean);
```

Remove the `useEffect` that handles loved tab switching (the one that references `lovedTab`, `homepageSections`, `allProducts`).

- [ ] **Step 5: Slim the initial data fetch useEffect**

Replace the existing `Promise.all` useEffect with:
```typescript
useEffect(() => {
  api.products
    .list({ limit: 200, order: 'created_at DESC' })
    .then(({ products }) => {
      setAllProducts(products);
      const withImages = products.filter(p => p.images && p.images.length > 0);
      setTrendingProducts(withImages.slice(0, 6));
      setClearanceProducts(withImages.filter(isProductOnSale).slice(0, 6));
      setDiscoverProducts(withImages.filter(p => !isProductOnSale(p)).slice(0, 6));
    })
    .catch(err => {
      console.error('Homepage data fetch error:', err);
      setError(getErrorMessage(err, 'Failed to load homepage data.'));
    })
    .finally(() => setLoading(false));
}, []);
```

Also remove the separate useEffect that computed trending/clearance/discover — it is now merged above.

- [ ] **Step 6: Remove the Loved tabbed ProductCarousel JSX block**

Remove from the JSX (in the `<main>` render):
```tsx
<ProductCarousel
  title="Loved by us, picked for you"
  tabs={LOVED_TABS.map((tab) => tab.label)}
  activeTab={LOVED_TABS.find((tab) => tab.key === lovedTab)?.label}
  onTabChange={(_, index) => {
    const nextTab = LOVED_TABS[index]?.key;
    if (nextTab) {
      setLovedTab(nextTab);
    }
  }}
  products={lovedProducts.map(toCardProps)}
/>
```

- [ ] **Step 7: Remove the Star Rewards 4-circle category grid**

Remove the `<div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">` block containing the 4 circle Links (Women's Shoes, Blouses, Dresses, Handbags).

- [ ] **Step 8: Remove the 3-column Women's Tops / Men's Shirts promo grid**

Remove the 3-column grid with Links to Women's Tops and Men's Shirts.

- [ ] **Step 9: Add CategorySection import and 8 section rows**

Add to the import section:
```typescript
import { CategorySection } from '../components/CategorySection';
```

Add the section config array after imports but before the component function:
```typescript
const HOMEPAGE_CATEGORY_SECTIONS = [
  {
    key: 'women-shoes',
    title: "Women's Shoes",
    subtitle: 'Step into style',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.women.subcategories.shoes,
    gender: 'women' as const,
    reverse: false,
  },
  {
    key: 'men-shoes',
    title: "Men's Shoes",
    subtitle: 'Fresh finds for every day',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.men.subcategories.shoes,
    gender: 'men' as const,
    reverse: true,
  },
  {
    key: 'women-bags',
    title: 'Handbags',
    subtitle: 'Your perfect carry-along',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.women.subcategories.bags,
    gender: 'women' as const,
    reverse: false,
  },
  {
    key: 'men-shirts',
    title: "Men's Shirts",
    subtitle: 'Tailored to a tee',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.men.subcategories.shirts,
    gender: 'men' as const,
    reverse: true,
  },
  {
    key: 'women-blouses',
    title: 'Blouses',
    subtitle: 'Effortlessly polished',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc7f6f80?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.women.subcategories.blouses,
    gender: 'women' as const,
    reverse: false,
  },
  {
    key: 'men-tshirts',
    title: "Men's T-Shirts",
    subtitle: 'Easy layers, endless style',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.men.subcategories.tshirts,
    gender: 'men' as const,
    reverse: true,
  },
  {
    key: 'women-dresses',
    title: 'Dresses',
    subtitle: 'From desk to dinner',
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.women.subcategories.dresses,
    gender: 'women' as const,
    reverse: false,
  },
  {
    key: 'men-jeans',
    title: "Men's Jeans",
    subtitle: 'Built for comfort',
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=900',
    collectionId: COLLECTION_IDS.men.subcategories.jeans,
    gender: 'men' as const,
    reverse: true,
  },
];
```

- [ ] **Step 10: Replace removed sections with 8 CategorySection rows in JSX**

After `<HeroSection />` in the JSX, add:
```tsx
{HOMEPAGE_CATEGORY_SECTIONS.map(section => (
  <CategorySection key={section.key} {...section} />
))}
```

This replaces the removed "Loved by us" carousel, the 4-circle grid, and the 3-column promo grid.

- [ ] **Step 11: Verify TypeScript compiles**

Run: `npx tsc --noEmit --skipLibCheck`
Expected: No TypeScript errors. If `HOME_PAGE_SECTIONS` is flagged as unused import from `subcategoryMap`, remove that import (the config now uses `COLLECTION_IDS` directly).

- [ ] **Step 12: Run lint check**

Run: `npm run lint`
Expected: No type errors.

- [ ] **Step 13: Run tests**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 14: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat(homepage): replace tabbed carousel with 8 editorial category sections"
```

---

## Self-Review Checklist

- [ ] Spec coverage: All 8 sections present in config? Yes
- [ ] Spec coverage: Alternating reverse layout per section? Yes (even sections reverse)
- [ ] Spec coverage: Each section fetches own products via useEffect? Yes
- [ ] Spec coverage: Loading skeleton shown while fetching? Yes
- [ ] Spec coverage: Empty state if no products? Yes
- [ ] Spec coverage: Error state if fetch fails? Yes
- [ ] Spec coverage: "Shop all X →" CTA per section? Yes
- [ ] Spec coverage: Background alternates cream/white via bg-[#fdf3e7] on content side? Yes
- [ ] Spec coverage: HeroSection preserved at top? Yes
- [ ] Spec coverage: Clearance PromoBanner and carousel preserved? Yes
- [ ] Spec coverage: Removed lovedProducts, LOVED_TABS, lovedTab state? Yes
- [ ] Spec coverage: Removed 4-circle Star Rewards grid? Yes
- [ ] Spec coverage: Removed 3-column Women's Tops/Men's Shirts promo grid? Yes
- [ ] Placeholder scan: No "TBD", "TODO", "fill in later" anywhere — all code is concrete
- [ ] Type consistency: `gender: 'women' as const` / `'men' as const` matches `CategorySectionProps` union type
- [ ] Type consistency: `collectionId` matches `COLLECTION_IDS.women.subcategories.shoes` type (string)
- [ ] No duplicate imports of `ApiProductRecord` (already imported via `api` in Home.tsx)
