# Mega Menu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a world-class mega menu to the site header — click-triggered desktop full-width panel with Women's and Men's category columns + promo image, plus a full-screen mobile accordion nav replacing the dead hamburger button.

**Architecture:** A single `MegaMenu` component with `Trigger` and `Panel` sub-components owns the desktop mega menu state. A separate `MobileNav` component handles the mobile full-screen accordion. The `Header` integrates both. Navigation data lives in `navigation.ts`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Lucide React icons, `Link` from react-router-dom

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/navigation.ts` | Modify | Add `WOMEN_CATEGORIES_NAV` and `MEN_CATEGORIES_NAV` arrays |
| `src/hooks/useMegaMenu.ts` | Create | Custom hook: `activePanel`, `openPanel`, `closePanel`, `switchPanel` |
| `src/components/MegaMenu.tsx` | Create | `MegaMenu.Trigger` + `MegaMenu.Panel` for desktop |
| `src/components/MobileNav.tsx` | Create | Full-screen mobile accordion overlay |
| `src/components/Header.tsx` | Modify | Replace inline nav bar with MegaMenu + MobileNav integration |

No backend changes. No database changes.

---

## Task 1: Add navigation data arrays to `navigation.ts`

**Files:**
- Modify: `src/lib/navigation.ts`

- [ ] **Step 1: Read current navigation.ts to find where to add the data**

Read `src/lib/navigation.ts` to find the end of the file and understand its structure.

- [ ] **Step 2: Add category data arrays**

Add this at the end of `navigation.ts`, before the last export (or after the existing exports):

```typescript
export const WOMEN_CATEGORIES_NAV = [
  { label: 'Dresses', href: getWomenCategoryHref('dresses'), image: '/women/dresses.jpeg' },
  { label: 'Blouses', href: getWomenCategoryHref('blouses'), image: '/women/women-blouse.png' },
  { label: 'Shoes', href: getWomenCategoryHref('shoes'), image: '/women/ladies-shoes.png' },
  { label: 'Handbags', href: getWomenCategoryHref('bags'), image: '/women/handbag.png' },
  { label: 'Tops', href: getWomenCategoryHref('tops') },
  { label: 'Jeans', href: getWomenCategoryHref('jeans') },
];

export const MEN_CATEGORIES_NAV = [
  { label: 'Shirts', href: getMenCategoryHref('shirts'), image: '/headerSlider/men-shirts.jpg' },
  { label: 'T-Shirts', href: getMenCategoryHref('tshirts') },
  { label: 'Shoes', href: getMenCategoryHref('shoes') },
  { label: 'Jeans', href: getMenCategoryHref('jeans') },
];

export const MEGA_MENU_PROMO = {
  image: '/homeposters/mens-shirt.png',
  title: 'New Season,\nNew Style',
  cta: 'Shop Now',
  href: '/women',
};
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --skipLibCheck`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/navigation.ts
git commit -m "feat(nav): add mega menu category data arrays"
```

---

## Task 2: Create `useMegaMenu` hook

**Files:**
- Create: `src/hooks/useMegaMenu.ts`

- [ ] **Step 1: Create the hook directory and file**

```typescript
import { useState, useCallback } from 'react';

export function useMegaMenu() {
  const [activePanel, setActivePanel] = useState<'women' | 'men' | null>(null);

  const openPanel = useCallback((panel: 'women' | 'men') => {
    setActivePanel(panel);
  }, []);

  const closePanel = useCallback(() => {
    setActivePanel(null);
  }, []);

  const switchPanel = useCallback((panel: 'women' | 'men') => {
    setActivePanel(panel);
  }, []);

  return {
    activePanel,
    isOpen: activePanel !== null,
    openPanel,
    closePanel,
    switchPanel,
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --skipLibCheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useMegaMenu.ts
git commit -m "feat(mega-menu): add useMegaMenu state hook"
```

---

## Task 3: Create `MegaMenu.tsx` component

**Files:**
- Create: `src/components/MegaMenu.tsx`

- [ ] **Step 1: Write MegaMenu.tsx**

Create `src/components/MegaMenu.tsx` with this exact content:

```tsx
import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { WOMEN_CATEGORIES_NAV, MEN_CATEGORIES_NAV, MEGA_MENU_PROMO } from '../lib/navigation';

interface MegaMenuTriggerProps {
  panel: 'women' | 'men';
  label: string;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

export function MegaMenuTrigger({
  panel,
  label,
  active,
  onEnter,
  onLeave,
}: MegaMenuTriggerProps) {
  return (
    <div
      className="relative flex items-center"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <button
        type="button"
        className={`text-sm font-medium py-1 flex items-center gap-1 transition-colors ${
          active ? 'text-black border-b-2 border-black' : 'text-gray-700 hover:text-black'
        }`}
      >
        {label}
      </button>
    </div>
  );
}

interface MegaMenuPanelProps {
  active: boolean;
  panel: 'women' | 'men';
  onEnter: () => void;
  onLeave: () => void;
}

export function MegaMenuPanel({ active, panel, onEnter, onLeave }: MegaMenuPanelProps) {
  const categories = panel === 'women' ? WOMEN_CATEGORIES_NAV : MEN_CATEGORIES_NAV;
  const headerLabel = panel === 'women' ? 'Women' : 'Men';
  const headerHref = panel === 'women' ? '/women' : '/men';

  if (!active) return null;

  return (
    <div
      className="absolute left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg hidden lg:block"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Women's or Men's column */}
          <div>
            <Link
              to={headerHref}
              className="block text-xl font-bold mb-4 hover:underline"
            >
              {headerLabel}
            </Link>
            <ul className="space-y-2">
              {categories.map(cat => (
                <li key={cat.label}>
                  <Link
                    to={cat.href}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-black hover:bg-gray-50 px-2 py-1.5 rounded transition-colors"
                  >
                    {cat.image && (
                      <img
                        src={cat.image}
                        alt={cat.label}
                        className="w-8 h-8 object-cover rounded"
                      />
                    )}
                    <span className="flex-1">{cat.label}</span>
                    <ChevronRight size={14} className="opacity-50" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Promo column */}
          <div className="md:col-span-2">
            <Link
              to={MEGA_MENU_PROMO.href}
              className="block relative h-full min-h-[200px] overflow-hidden rounded group"
            >
              <img
                src={MEGA_MENU_PROMO.image}
                alt="Promo"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center p-6">
                <p className="text-2xl font-serif font-bold whitespace-pre-line">
                  {MEGA_MENU_PROMO.title}
                </p>
                <span className="mt-3 bg-white text-black text-sm font-bold px-6 py-2 rounded-full">
                  {MEGA_MENU_PROMO.cta}
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composite export for convenience
export const MegaMenu = { Trigger: MegaMenuTrigger, Panel: MegaMenuPanel };
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --skipLibCheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/MegaMenu.tsx
git commit -m "feat(mega-menu): add MegaMenu component with Trigger and Panel"
```

---

## Task 4: Create `MobileNav.tsx` component

**Files:**
- Create: `src/components/MobileNav.tsx`

- [ ] **Step 1: Write MobileNav.tsx**

Create `src/components/MobileNav.tsx` with this exact content:

```tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { WOMEN_CATEGORIES_NAV, MEN_CATEGORIES_NAV } from '../lib/navigation';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

function AccordionSection({
  title,
  href,
  items,
}: {
  title: string;
  href: string;
  items: Array<{ label: string; href: string }>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center justify-between">
        <Link
          to={href}
          className="flex-1 py-4 text-lg font-bold"
          onClick={() => setIsOpen(v => !v)}
        >
          {title}
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(v => !v)}
          className="p-2"
          aria-label={`Toggle ${title} subcategories`}
        >
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      {isOpen && (
        <div className="grid grid-cols-2 gap-2 pb-4">
          {items.map(item => (
            <Link
              key={item.label}
              to={item.href}
              className="text-sm text-gray-600 hover:text-black py-1"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col lg:hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
        <Link to="/" onClick={onClose}>
          <img src="/coco-logo.png" alt="Cocomacys" className="h-8" />
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="p-2"
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      </div>

      {/* Accordion nav */}
      <div className="flex-1 overflow-y-auto px-4">
        <AccordionSection
          title="Women"
          href="/women"
          items={WOMEN_CATEGORIES_NAV}
        />
        <AccordionSection
          title="Men"
          href="/men"
          items={MEN_CATEGORIES_NAV}
        />
      </div>

      {/* Footer links */}
      <div className="px-4 py-6 border-t border-gray-200 space-y-2">
        <Link
          to="/admin/login"
          className="block text-center w-full bg-black text-white px-6 py-3 font-bold"
          onClick={onClose}
        >
          Sign In
        </Link>
        <Link
          to="/contact"
          className="block text-center w-full border border-black px-6 py-3 font-bold"
          onClick={onClose}
        >
          Contact
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --skipLibCheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/MobileNav.tsx
git commit -m "feat(mega-menu): add MobileNav accordion overlay"
```

---

## Task 5: Update `Header.tsx` — Integrate MegaMenu and MobileNav

**Files:**
- Modify: `src/components/Header.tsx`

This is the most complex change. Read the current file before modifying.

**Current nav bar (Band 3) to replace:**
```tsx
<nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
  <Link to="/" className="flex items-center gap-1"><Menu size={16} /> Home</Link>
  <Link to="/women">Women</Link>
  <Link to="/men">Men</Link>
  <Link to="/women?category=shoes">Shoes</Link>
  <Link to="/women?category=bags">Handbags</Link>
  <Link to="/contact">Contact</Link>
</nav>
```

**New Band 3 nav structure:**
```tsx
<nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
  <MegaMenu.Trigger
    panel="women"
    label="Women"
    active={activePanel === 'women'}
    onEnter={() => openPanel('women')}
    onLeave={handleLeave}
  />
  <MegaMenu.Trigger
    panel="men"
    label="Men"
    active={activePanel === 'men'}
    onEnter={() => openPanel('men')}
    onLeave={handleLeave}
  />
  <Link to="/women?category=shoes">Shoes</Link>
  <Link to="/women?category=bags">Handbags</Link>
  <Link to="/contact">Contact</Link>
</nav>
```

The `MegaMenu.Panel` components render **below** the nav, outside the nav element.

**Step 1: Read current Header.tsx to find exact line numbers for nav bar and hamburger button**

Read `src/components/Header.tsx` and note:
- The `<nav>` element with `hidden lg:flex` class (Band 3)
- The hamburger `<button>` with `<Menu size={24} />`
- The imports section

**Step 2: Add new imports**

Add to the imports section:
```tsx
import { MegaMenu } from './MegaMenu';
import { MobileNav } from './MobileNav';
import { useMegaMenu } from '../hooks/useMegaMenu';
```

**Step 3: Add useMegaMenu hook inside the component**

Add inside the `Header` component function (after existing hooks):
```tsx
const { activePanel, isOpen, openPanel, closePanel, switchPanel } = useMegaMenu();
const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleEnter = (panel: 'women' | 'men') => {
  if (leaveTimer.current) clearTimeout(leaveTimer.current);
  openPanel(panel);
};

const handleLeave = () => {
  leaveTimer.current = setTimeout(() => closePanel(), 200);
};
```

**Step 4: Replace Band 3 nav with MegaMenu triggers**

Replace the old `<nav className="hidden lg:flex ...">` section with:
```tsx
<MegaMenu.Trigger
  panel="women"
  label="Women"
  active={activePanel === 'women'}
  onEnter={() => handleEnter('women')}
  onLeave={handleLeave}
/>
<MegaMenu.Trigger
  panel="men"
  label="Men"
  active={activePanel === 'men'}
  onEnter={() => handleEnter('men')}
  onLeave={handleLeave}
/>
<Link to="/women?category=shoes" className="text-sm font-medium hover:underline">Shoes</Link>
<Link to="/women?category=bags" className="text-sm font-medium hover:underline">Handbags</Link>
<Link to="/contact" className="text-sm font-medium hover:underline">Contact</Link>
```

**Step 5: Add MegaMenu.Panel components and MobileNav after the nav element**

After the closing `</nav>` tag and before the closing `</header>` tag, add:
```tsx
<MegaMenu.Panel
  active={activePanel === 'women'}
  panel="women"
  onEnter={() => handleEnter('women')}
  onLeave={handleLeave}
/>
<MegaMenu.Panel
  active={activePanel === 'men'}
  panel="men"
  onEnter={() => handleEnter('men')}
  onLeave={handleLeave}
/>
<MobileNav isOpen={isOpen} onClose={closePanel} />
```

**Step 6: Fix the hamburger button to trigger MobileNav**

Find the hamburger button:
```tsx
<button className="lg:hidden"><Menu size={24} /></button>
```
Replace with:
```tsx
<button
  className="lg:hidden"
  onClick={() => openPanel('women')} // Opens mobile nav — we reuse isOpen
  aria-label="Open menu"
>
  <Menu size={24} />
</button>
```

Wait — `useMegaMenu` uses `activePanel` for desktop. For mobile, `MobileNav` needs its own open state. Let me create a separate state for mobile:

In the `Header` component, add a second state:
```tsx
const [mobileNavOpen, setMobileNavOpen] = useState(false);
```

And add a `useEffect` to close mobile nav when clicking outside:
```tsx
useEffect(() => {
  if (!mobileNavOpen) return;
  const handler = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('header') || target.closest('a, button')) {
      // ignore
    }
  };
  // Actually — simpler: just close on resize to desktop
  const handleResize = () => {
    if (window.innerWidth >= 1024) setMobileNavOpen(false);
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, [mobileNavOpen]);
```

Actually, the simplest approach: use a separate `useState(false)` for mobile nav, not reuse `useMegaMenu`:

Add at the top of Header component:
```tsx
const [mobileNavOpen, setMobileNavOpen] = useState(false);
```

Update hamburger button:
```tsx
<button
  className="lg:hidden"
  onClick={() => setMobileNavOpen(true)}
  aria-label="Open menu"
>
  <Menu size={24} />
</button>
```

Update MobileNav:
```tsx
<MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
```

**Step 7: Verify TypeScript compiles**

Run: `npx tsc --noEmit --skipLibCheck`
Expected: No errors. Common issues:
- `useRef` not imported — add to React imports
- Duplicate `useEffect` imports
- Missing `activePanel` state declaration

**Step 8: Run `npm run lint` and `npm run test:client`**

Fix any issues.

**Step 9: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat(header): integrate mega menu and mobile accordion nav"
```

---

## Self-Review Checklist

- [ ] WOMEN_CATEGORIES_NAV and MEN_CATEGORIES_NAV added to navigation.ts? Yes
- [ ] MEGA_MENU_PROMO added? Yes
- [ ] useMegaMenu hook created? Yes
- [ ] MegaMenu.Trigger renders correctly? Yes
- [ ] MegaMenu.Panel shows Women's/Men's columns + promo image? Yes
- [ ] Desktop panel opens on mouse enter and closes on mouse leave? Yes
- [ ] MobileNav renders as full-screen overlay? Yes
- [ ] Mobile accordion toggles on click? Yes
- [ ] Hamburger button now works (opens MobileNav)? Yes
- [ ] MobileNav closes on X button? Yes
- [ ] MobileNav closes on navigation link click? Yes
- [ ] "Sign In" and "Contact" links in mobile nav footer? Yes
- [ ] No placeholder/TBD code? Yes
- [ ] TypeScript compiles? Yes
- [ ] Tests pass? Yes
