import { COLLECTION_IDS } from './subcategoryMap';

export type WomenCategorySlug = keyof typeof COLLECTION_IDS.women.subcategories;
export type MenCategorySlug = keyof typeof COLLECTION_IDS.men.subcategories;

export const WOMEN_CATEGORY_LABELS: Record<WomenCategorySlug, string> = {
  dresses: 'Dresses',
  bags: 'Handbags',
  blouses: 'Blouses',
  shoes: 'Shoes',
  tops: 'Tops',
  jeans: 'Jeans',
  waitcoats: 'Coats & Jackets',
  coats: 'Coats',
};

export const MEN_CATEGORY_LABELS: Record<MenCategorySlug, string> = {
  shirts: 'Shirts',
  tshirts: 'T-Shirts',
  shoes: 'Shoes',
  jeans: 'Jeans',
  ties: 'Ties',
  bowties: 'Bow-ties',
};

const WOMEN_CATEGORY_ALIASES: Record<string, WomenCategorySlug> = {
  dresses: 'dresses',
  bags: 'bags',
  handbags: 'bags',
  blouses: 'blouses',
  shoes: 'shoes',
  tops: 'tops',
  jeans: 'jeans',
  waistcoats: 'waitcoats',
  waistcoat: 'waitcoats',
  waitcoats: 'waitcoats',
  coats: 'coats',
  'ladies-coats': 'coats',
  jackets: 'waitcoats',
  'coats-jackets': 'waitcoats',
};

const MEN_CATEGORY_ALIASES: Record<string, MenCategorySlug> = {
  shirts: 'shirts',
  tshirts: 'tshirts',
  't-shirts': 'tshirts',
  shoes: 'shoes',
  jeans: 'jeans',
  pants: 'jeans',
  'pants-jeans': 'jeans',
  ties: 'ties',
  bowties: 'bowties',
  'bow-ties': 'bowties',
  'bow-tie': 'bowties',
};

export function resolveWomenCategorySlug(category: string | null | undefined): WomenCategorySlug | null {
  if (!category) {
    return null;
  }
  return WOMEN_CATEGORY_ALIASES[category.toLowerCase()] ?? null;
}

export function resolveMenCategorySlug(category: string | null | undefined): MenCategorySlug | null {
  if (!category) {
    return null;
  }
  return MEN_CATEGORY_ALIASES[category.toLowerCase()] ?? null;
}

export function getWomenCategoryHref(category?: string) {
  const slug = resolveWomenCategorySlug(category);
  return slug ? `/women?category=${encodeURIComponent(slug)}` : '/women';
}

export function getMenCategoryHref(category?: string) {
  const slug = resolveMenCategorySlug(category);
  return slug ? `/men?category=${encodeURIComponent(slug)}` : '/men';
}

export function getProductHref(id?: string | number | null) {
  if (id == null || id === '') {
    return '/product';
  }
  return `/product?id=${encodeURIComponent(String(id))}`;
}

const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  'women_shoes': 'Women Shoes',
  'women_bags': 'Women Handbags',
  'women_blouses': 'Women Blouses',
  'women_dresses': 'Women Dresses',
  'women_waist-coats': 'Women Waist-Coats',
  'ladies-coats': 'Ladies Coats',
  'men_shoes': 'Men Shoes',
  'men_shirts': 'Men Shirts',
  'men_t-shirts': 'Men T-Shirts',
  'men_jeans': 'Men Jeans',
  'ties': 'Ties',
  'bow-ties': 'Bow-Ties',
};

export function formatProductLabel(brand?: string | null, category?: string | null): string {
  const cleanBrand = brand?.trim();
  if (cleanBrand) {
    return cleanBrand;
  }

  const cleanCategory = category?.trim();
  if (!cleanCategory) {
    return '';
  }

  return CATEGORY_LABEL_OVERRIDES[cleanCategory.toLowerCase()] ?? cleanCategory.replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}
