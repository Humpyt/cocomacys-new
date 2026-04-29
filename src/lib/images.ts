import type { SyntheticEvent } from 'react';

const PRODUCT_PLACEHOLDER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160" role="img" aria-label="No image available">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f6f6f6" />
      <stop offset="100%" stop-color="#e8e8e8" />
    </linearGradient>
  </defs>
  <rect width="120" height="160" fill="url(#bg)" />
  <rect x="20" y="30" width="80" height="100" rx="8" fill="none" stroke="#cccccc" stroke-width="3" stroke-dasharray="6 6" />
  <circle cx="60" cy="65" r="18" fill="#d0d0d0" />
  <path d="M42 108c6-24 20-36 18-40s4-4 10 0 12 16 18 40" fill="#d0d0d0" />
</svg>
`.trim();

export const PRODUCT_IMAGE_PLACEHOLDER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(PRODUCT_PLACEHOLDER_SVG)}`;

export function getImageSrc(image: string | null | undefined): string {
  return typeof image === 'string' && image.trim().length > 0
    ? image
    : PRODUCT_IMAGE_PLACEHOLDER;
}

export const COLOR_HEX_MAP: Record<string, string> = {
  'black': '#000000',
  'white': '#ffffff',
  'navy': '#000080',
  'navy blue': '#000080',
  'red': '#cc0000',
  'burgundy': '#800020',
  'burgundy red': '#7a1e2c',
  'pink': '#ffc0cb',
  'hot pink': '#ff69b4',
  'pink rose gem': '#ffb6c1',
  'rose': '#ff007f',
  'gray': '#808080',
  'grey': '#808080',
  'heather grey': '#9ea2a5',
  'heather gray': '#9ea2a5',
  'olive': '#556b2f',
  'olive green': '#556b2f',
  'camel': '#c19a6b',
  'tan': '#d2b48c',
  'mustard': '#ffdb58',
  'yellow': '#f5c842',
  'teal': '#008080',
  'denim': '#1560bd',
  'blue': '#0000ff',
  'dark blue': '#003366',
  'light blue': '#add8e6',
  'royal blue': '#4169e1',
  'royal': '#4169e1',
  'green': '#008000',
  'forest green': '#228b22',
  'brown': '#8b4513',
  'chocolate': '#7b3f00',
  'beige': '#f5f5dc',
  'cream': '#fffdd0',
  'ivory': '#fffff0',
  'purple': '#800080',
  'lavender': '#b57edc',
  'orange': '#ff6600',
  'coral': '#ff7f50',
  'blush': '#de5d83',
  'sand': '#c2b280',
  'charcoal': '#36454f',
  'charcoal gray': '#36454f',
  'taupe': '#483c32',
  'mint': '#98ff98',
  'sky blue': '#87ceeb',
  'slate': '#708090',
  'slate blue': '#6a5acd',
  'wine': '#722f37',
  'crimson': '#dc143c',
  'maroon': '#800000',
  'gold': '#ffd700',
  'silver': '#c0c0c0',
  'stone': '#8d8c8a',
  'stones': '#8d8c8a',
  'nude': '#e3bc9a',
  'peach': '#ffcba4',
  'checked': '#6b7280',
  'floral': '#d16ba5',
  'pattern': '#7c3aed',
  'print': '#6b7280',
  'sequin': '#a8a29e',
  'pearl': '#f0ead6',
  'multi': '#888888',
  'multicolor': '#888888',
  'white multiple': '#f5f5f5',
  'black multiple': '#1a1a1a',
};

export function getColorHex(colorName: string | null | undefined): string {
  if (!colorName) return '#888888';
  return COLOR_HEX_MAP[colorName.toLowerCase()] ?? '#888888';
}

const COLOR_LABEL_OVERRIDES: Record<string, string> = {
  'burgundy red': 'Burgundy Red',
  'dark blue': 'Dark Blue',
  'hot pink': 'Hot Pink',
  'light blue': 'Light Blue',
  'stones': 'Stone',
};

export function getColorLabel(colorName: string | null | undefined): string {
  if (!colorName) return '';

  const normalized = colorName.trim().toLowerCase();
  if (!normalized) return '';

  return COLOR_LABEL_OVERRIDES[normalized] ?? colorName.trim().replace(/\s+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function handleImageFallback(event: SyntheticEvent<HTMLImageElement>): void {
  const target = event.currentTarget;

  if (target.src === PRODUCT_IMAGE_PLACEHOLDER) {
    return;
  }

  target.onerror = null;
  target.src = PRODUCT_IMAGE_PLACEHOLDER;
}
