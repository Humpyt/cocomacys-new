# Homepage Category Strip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the 8 full-width editorial CategorySection rows with a compact horizontal-scrolling category strip at the top of the homepage, restoring the original layout below it unchanged.

**Architecture:** A new `CategoryStrip` component renders a scrollable row of 8 small circular image+label cards. `Home.tsx` is updated to restore the original pre-sprint layout (tabbed carousel, PromoBanners, Star Rewards Challenge, Anticipated Arrivals, etc.) and removes the CategorySection rows. CategoryStrip sits between HeroSection and the first ProductCarousel.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, `Link` from react-router-dom

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/CategoryStrip.tsx` | **Create** | Horizontal scrollable row of 8 category image+label cards |
| `src/pages/Home.tsx` | **Modify** | Restore original layout, remove CategorySection rows, add CategoryStrip |

No backend changes. No database changes.

---

## Task 1: Create `CategoryStrip` Component

**Files:**
- Create: `src/components/CategoryStrip.tsx`

- [ ] **Step 1: Write the CategoryStrip component**

Create `src/components/CategoryStrip.tsx` with this exact content:

```tsx
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { getWomenCategoryHref, getMenCategoryHref } from '../lib/navigation';

interface CategoryStripProps {
  sections: Array<{
    key: string;
    title: string;
    image: string;
    gender: 'men' | 'women';
    categorySlug: string;
  }>;
}

export function CategoryStrip({ sections }: CategoryStripProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: number) => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: 300 * direction, behavior: 'smooth' });
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Shop by category</p>

        <div className="relative flex items-center">
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
            className="hidden md:flex shrink-0 w-10 h-10 bg-white border border-gray-300 rounded-full items-center justify-center mr-4 hover:bg-gray-50 z-10"
          >
            <span className="text-lg">&lsaquo;</span>
          </button>

          {/* Scrollable cards */}
          <div
            ref={scrollRef}
            className="flex space-x-6 overflow-x-auto pb-2 snap-x snap-start hide-scrollbar"
          >
            {sections.map(section => {
              const href = section.gender === 'women'
                ? getWomenCategoryHref(section.categorySlug)
                : getMenCategoryHref(section.categorySlug);

              return (
                <Link
                  key={section.key}
                  to={href}
                  className="group shrink-0 flex flex-col items-center cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-2 group-hover:scale-105 transition-transform duration-200">
                    <img
                      src={section.image}
                      alt={section.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-center text-gray-800 group-hover:underline">
                    {section.title}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Scroll right"
            className="hidden md:flex shrink-0 w-10 h-10 bg-white border border-gray-300 rounded-full items-center justify-center ml-4 hover:bg-gray-50 z-10"
          >
            <span className="text-lg">&rsaquo;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit --skipLibCheck`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add src/components/CategoryStrip.tsx
git commit -m "feat(homepage): add CategoryStrip horizontal category navigation"
```

---

## Task 2: Update `Home.tsx` — Restore Layout + Add Strip

**Files:**
- Modify: `src/pages/Home.tsx`

### What to Remove from Current Home.tsx

1. Remove `HOMEPAGE_CATEGORY_SECTIONS` config array
2. Remove the `CategorySection` import
3. Remove the `<CategorySection key={section.key} {...sectionProps} />` map
4. Remove `trendingProducts` and `discoverProducts` state if they were only used by removed sections (they are still used by the carousels, so keep them)
5. Remove any unused imports from removed code

### What to Add to Home.tsx

1. Add `CategoryStrip` import:
```typescript
import { CategoryStrip } from '../components/CategoryStrip';
```

2. Add `STRIP_CATEGORIES` constant (after imports, before the component):
```typescript
const STRIP_CATEGORIES = [
  { key: 'women-shoes',  title: "Women's Shoes",  image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200', gender: 'women' as const, categorySlug: 'shoes'   },
  { key: 'men-shoes',   title: "Men's Shoes",    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200', gender: 'men'   as const, categorySlug: 'shoes'   },
  { key: 'women-bags',  title: 'Handbags',       image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200', gender: 'women' as const, categorySlug: 'bags'    },
  { key: 'men-shirts',  title: "Men's Shirts",   image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=200', gender: 'men'   as const, categorySlug: 'shirts'  },
  { key: 'women-blouses',title:'Blouses',        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc7f6f80?auto=format&fit=crop&q=80&w=200', gender: 'women' as const, categorySlug: 'blouses' },
  { key: 'men-tshirts', title: "Men's T-Shirts", image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200', gender: 'men'   as const, categorySlug: 'tshirts' },
  { key: 'women-dresses',title:'Dresses',        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=200', gender: 'women' as const, categorySlug: 'dresses' },
  { key: 'men-jeans',   title: "Men's Jeans",    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=200', gender: 'men'   as const, categorySlug: 'jeans'   },
];
```

3. Add `<CategoryStrip sections={STRIP_CATEGORIES} />` after `<HeroSection />` in JSX:
```tsx
<HeroSection />
<CategoryStrip sections={STRIP_CATEGORIES} />
```

4. Restore the loved products tabbed carousel and lovedTab state — the current Home.tsx has already removed `LOVED_TABS` and `lovedTab` state. These need to be restored so the "Loved by us, picked for you" tabbed carousel works again.

**Restoring LOVED_TABS and lovedTab:**

Add before the component function:
```typescript
const LOVED_TABS = [
  { key: 'new-arrivals', label: 'New arrivals' },
  { key: 'deals', label: 'Deals for you' },
  { key: 'dressy', label: 'Dressy looks' },
  { key: 'handbags', label: 'Spring handbags' },
] as const;

type LovedTabKey = (typeof LOVED_TABS)[number]['key'];
```

Add to the `Home` component state:
```typescript
const [lovedProducts, setLovedProducts] = useState<ApiProductRecord[]>([]);
const [lovedTab, setLovedTab] = useState<LovedTabKey>('new-arrivals');
```

5. Add the loved tab useEffect (fetch products based on selected tab) — restore from the pre-sprint version:
```typescript
useEffect(() => {
  if (lovedTab === 'new-arrivals') {
    api.products.list({ limit: 6, order: 'created_at DESC' })
      .then(({ products }) => setLovedProducts(products.filter(p => p.images && p.images.length > 0).slice(0, 6)));
  } else if (lovedTab === 'deals') {
    api.products.list({ limit: 20, order: 'created_at DESC' })
      .then(({ products }) => setLovedProducts(products.filter(p => isProductOnSale(p)).slice(0, 6)));
  } else if (lovedTab === 'dressy') {
    api.products.list({ collection_id: COLLECTION_IDS.women.subcategories.dresses, limit: 6, order: 'created_at DESC' })
      .then(({ products }) => setLovedProducts(products.filter(p => p.images && p.images.length > 0)));
  } else if (lovedTab === 'handbags') {
    api.products.list({ collection_id: COLLECTION_IDS.women.subcategories.bags, limit: 6, order: 'created_at DESC' })
      .then(({ products }) => setLovedProducts(products.filter(p => p.images && p.images.length > 0)));
  }
}, [lovedTab]);
```

6. Restore the tabbed ProductCarousel JSX in the render:
```tsx
<ProductCarousel
  title="Loved by us, picked for you"
  tabs={LOVED_TABS.map(tab => tab.label)}
  activeTab={LOVED_TABS.find(tab => tab.key === lovedTab)?.label}
  onTabChange={(_, index) => {
    const nextTab = LOVED_TABS[index]?.key;
    if (nextTab) setLovedTab(nextTab);
  }}
  products={lovedProducts.map(toCardProps)}
/>
```

7. Restore the 3 PromoBanners (Spring layers, Denim, Men's shirts) — these were changed to slightly different content in the current version. Restore the original ones from commit `425ce6c`:
```tsx
<PromoBanner
  image="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=2000"
  title="Spring break finds<br/>for fun in the sun"
  buttonText="Shop now"
  align="left"
/>

<PromoBanner
  image="https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&q=80&w=2000"
  title="Denim for him<br/>& her 30% OFF"
  subtitle="Shop fits & trends for the season ahead."
  buttonText="Shop by category ▼"
  align="left"
/>

<PromoBanner
  image="https://images.unsplash.com/photo-1518605368461-1e1e111e1b6a?auto=format&fit=crop&q=80&w=2000"
  title="World Soccer HQ"
  subtitle="Dedicated team gear worthy of every fan."
  buttonText="Shop now"
  align="left"
/>
```

8. Restore the Star Rewards Challenge 4-circle grid section (from commit `425ce6c`) — replace the current Star Rewards section with the original that had the 4 circle category links. The current version shows only text; restore the full version with the image circles.

Note: Compare the current `425ce6c` Star Rewards block in Home.tsx against the current version and restore the exact JSX.

- [ ] **Step 1: Read current Home.tsx to understand its exact state**

Read `src/pages/Home.tsx` to see what currently exists — you'll need to understand what's already there before making changes.

- [ ] **Step 2: Remove CategorySection rows and config**

Remove the `HOMEPAGE_CATEGORY_SECTIONS` config array and the `<CategorySection map>` from the JSX.

- [ ] **Step 3: Add CategoryStrip import and STRIP_CATEGORIES**

- [ ] **Step 4: Restore LOVED_TABS, LovedTabKey, lovedProducts, lovedTab state**

- [ ] **Step 5: Add CategoryStrip after HeroSection**

- [ ] **Step 6: Restore loved tab ProductCarousel and useEffect**

- [ ] **Step 7: Restore 3 PromoBanners and Star Rewards Challenge section**

- [ ] **Step 8: Run `npx tsc --noEmit --skipLibCheck`**

Fix any TypeScript errors. Common issues: unused imports from removed code, missing `LovedTabKey` type, `isProductOnSale` import check.

- [ ] **Step 9: Run `npm test` (or `npm run test:client`)**

Fix any test failures. Home.test.tsx may need updating if it tests specific elements that changed.

- [ ] **Step 10: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "feat(homepage): restore original layout with category strip navigation"
```

---

## Self-Review Checklist

- [ ] CategoryStrip component created with horizontal scroll + arrow buttons? Yes
- [ ] 8 category cards with circular images (80x80) and labels? Yes
- [ ] CategoryStrip uses `getWomenCategoryHref`/`getMenCategoryHref` for links? Yes
- [ ] `STRIP_CATEGORIES` has all 8 categories? Yes
- [ ] CategoryStrip rendered after HeroSection? Yes
- [ ] LOVED_TABS, lovedTab state, lovedProducts state restored? Yes
- [ ] Tabbed "Loved by us" ProductCarousel restored? Yes
- [ ] 3 PromoBanners restored (Spring break, Denim, World Soccer)? Yes
- [ ] Star Rewards Challenge 4-circle grid restored? Yes
- [ ] Anticipated Arrivals 3-column grid restored? Yes
- [ ] Trending, Clearance, Discover, Recently Viewed carousels preserved? Yes
- [ ] CategorySection rows removed from Home.tsx? Yes
- [ ] TypeScript compiles cleanly? Yes
- [ ] Tests pass? Yes
- [ ] No placeholder code (TBD, TODO)? Yes
