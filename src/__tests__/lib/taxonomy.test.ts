import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/config', () => ({ config: { api: { origin: 'https://api.test' } } }));

describe('fetchTaxonomy', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules(); 
  });

  it('si la API falla usa el respaldo y no la vuelve a llamar durante 60 s', async () => {
    const fetchMock = vi.fn(async () => {
      throw new Error('API caída');
    });
    vi.stubGlobal('fetch', fetchMock);
    const { fetchTaxonomy, FALLBACK_TAXONOMY } = await import('@/lib/services/taxonomy');

    expect(await fetchTaxonomy()).toBe(FALLBACK_TAXONOMY);
    expect(await fetchTaxonomy()).toBe(FALLBACK_TAXONOMY);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('con la API sana devuelve la taxonomía del admin', async () => {
    const taxonomy = {
      styles: [{ code: 'y2k', name: 'Y2K', description: null, sortOrder: 10, coverImage: null, coverImageMobile: null, categories: [] }],
      categories: [],
    };
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(taxonomy), { status: 200 })));
    const { fetchTaxonomy } = await import('@/lib/services/taxonomy');
    expect((await fetchTaxonomy()).styles.map((s) => s.code)).toEqual(['y2k']);
  });
});
