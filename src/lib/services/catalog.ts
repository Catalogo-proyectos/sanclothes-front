import { apiCall } from '@/lib/api';
import { config } from '@/lib/config';
import { toCatalogProduct } from '@/lib/adapters/product';
import type { BackendProduct } from '@/types/backend';
import type {
  CatalogProduct,
  CutInfo,
  SearchSuggestion,
  ProductReview,
} from '@/types/api';

export interface CatalogQuery {
  cut?: string;
  category?: string;
  size?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
  isFeatured?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}

export function buildCatalogPath(query: CatalogQuery = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'isFeatured' && value === true) {
        params.set(key, 'true');
      } else if (key === 'priceMin' || key === 'priceMax') {
        params.set(key, String(value));
      } else {
        params.set(key, String(value));
      }
    }
  }
  const qs = params.toString();
  return qs ? `/catalog?${qs}` : '/catalog';
}

export async function fetchCatalog(query: CatalogQuery = {}): Promise<CatalogProduct[]> {
  const raw = await apiCall<BackendProduct[]>('GET', buildCatalogPath(query));
  return (raw ?? []).map(toCatalogProduct);
}

export async function fetchProduct(productId: string): Promise<CatalogProduct | null> {
  try {
    const raw = await apiCall<BackendProduct>('GET', `/catalog/${productId}`);
    return raw ? toCatalogProduct(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchCuts(): Promise<CutInfo[]> {
  const res = await apiCall<{ cuts: CutInfo[] }>('GET', '/catalog/cuts');
  return res.cuts ?? [];
}

export async function searchCatalog(query: string): Promise<SearchSuggestion[]> {
  if (!query.trim()) return [];
  const url = `${config.api.origin}/api/v1/catalog/search?q=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data.suggestions ?? [];
}

export async function fetchSizeGuide(category: string): Promise<{
  id?: string;
  category: string;
  chart: Record<string, Record<string, string>>;
}> {
  const url = `${config.api.origin}/api/v1/catalog/size-guide/${encodeURIComponent(category)}`;
  const res = await fetch(url);
  if (!res.ok) {
    return { category, chart: {} };
  }
  return res.json();
}

export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
  try {
    return await apiCall<ProductReview[]>('GET', `/catalog/${productId}/reviews`);
  } catch {
    return [];
  }
}

export async function submitProductReview(
  productId: string,
  review: { rating: number; comment?: string; guestName?: string; photoUrl?: string },
): Promise<ProductReview> {
  return apiCall<ProductReview>('POST', `/catalog/${productId}/reviews`, review);
}

export async function joinWaitlist(
  sku: string,
  email: string,
): Promise<{ success: boolean; message: string }> {
  return apiCall('POST', `/catalog/${sku.toUpperCase()}/waitlist`, { email });
}
