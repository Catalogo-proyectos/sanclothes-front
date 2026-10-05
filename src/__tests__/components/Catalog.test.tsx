import { beforeEach, describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CatalogView from '@/components/catalog/CatalogView';
import { MOCK_PRODUCTS } from '@/mocks/catalog';
import { toBackendProduct } from '@/mocks/toBackend';
import { toCatalogProduct } from '@/lib/adapters/product';
import { FALLBACK_TAXONOMY } from '@/lib/services/taxonomy';
import type { CatalogProduct } from '@/types/api';

const CATALOG_PRODUCTS = MOCK_PRODUCTS.map(toBackendProduct).map(toCatalogProduct);

let currentParams = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useSearchParams: () => currentParams,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

const renderCatalog = (products: CatalogProduct[] = CATALOG_PRODUCTS, qs = '') => {
  currentParams = new URLSearchParams(qs);
  return render(<CatalogView initialProducts={products} taxonomy={FALLBACK_TAXONOMY} />);
};

describe('Catálogo v2', () => {
  beforeEach(() => {
    currentParams = new URLSearchParams();
  });

  it('muestra las cards del catálogo', async () => {
    renderCatalog();
    await waitFor(() => {
      expect(screen.getByText('Remera Oversize Heavyweight 240g')).toBeInTheDocument();
      expect(screen.getByText('Hoodie Acid Wash Drop #01 400G')).toBeInTheDocument();
    });
  });

  it('muestra la cantidad de piezas en el encabezado', async () => {
    renderCatalog();
    await waitFor(() => {
      expect(screen.getAllByText(/\d+ piezas/i).length).toBeGreaterThan(0);
    });
  });

  it('sin bentos asignados no aparece ningún panel editorial fijo', () => {
    renderCatalog();
    expect(screen.queryByText(/Camperas & chaquetas — Sant Atelier/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Hoodies & buzos de gramaje alto/i)).not.toBeInTheDocument();
  });

  it('un producto marcado como bento se muestra con su título dentro de su sección', () => {
    const [first, ...rest] = CATALOG_PRODUCTS;
    const withBento: CatalogProduct = {
      ...first!,
      bento: { title: 'Bento de prueba', copy: 'Texto del bento', image: null, priority: 1 },
    };
    renderCatalog([withBento, ...rest]);
    expect(screen.getByText('Bento de prueba')).toBeInTheDocument();
    expect(screen.getByText('Texto del bento')).toBeInTheDocument();
  });

  it('con un filtro activo pasa a grilla simple sin bentos', () => {
    const [first, ...rest] = CATALOG_PRODUCTS;
    const withBento: CatalogProduct = { ...first!, bento: { title: 'Bento oculto', copy: null, image: null, priority: 1 } };
    renderCatalog([withBento, ...rest], `tipo=${encodeURIComponent(first!.category)}`);
    expect(screen.queryByText('Bento oculto')).not.toBeInTheDocument();
    expect(screen.getAllByText(first!.title).length).toBeGreaterThan(0);
  });

  it('agrupa por tipo de prenda con su "Ver todas"', () => {
    renderCatalog();
    expect(screen.getAllByText(/Ver todas \(\d+\) →/).length).toBeGreaterThan(0);
  });

  it('pinta la imagen principal encima de la de hover', async () => {
    renderCatalog();
    await waitFor(() => {
      expect(screen.getByText('Remera Oversize Heavyweight 240g')).toBeInTheDocument();
    });

    const traseras = screen.getAllByAltText(/vista trasera$/);
    expect(screen.getAllByAltText(/vista principal$/).length).toBeGreaterThan(0);
    expect(traseras.length).toBeGreaterThan(0);

    const card = traseras[0].closest('a');
    const imagesInCard = card ? Array.from(card.querySelectorAll('img')) : [];
    expect(imagesInCard).toHaveLength(2);
    expect(imagesInCard[0].getAttribute('alt')).toMatch(/vista trasera$/);
    expect(imagesInCard[1].getAttribute('alt')).toMatch(/vista principal$/);
  });
});
