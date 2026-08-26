import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ProductGrid from '@/components/catalog/ProductGrid';
import { MOCK_PRODUCTS } from '@/mocks/catalog';
import { toBackendProduct } from '@/mocks/toBackend';
import { toCatalogProduct } from '@/lib/adapters/product';

const CATALOG_PRODUCTS = MOCK_PRODUCTS.map(toBackendProduct).map(toCatalogProduct);


vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Catalog Components with Mock Layer', () => {
  it('renders product cards from the catalog once it loads', async () => {
    render(<ProductGrid initialProducts={CATALOG_PRODUCTS} />);

    await waitFor(
      () => {
        expect(screen.getByText('Remera Oversize Heavyweight 240g')).toBeInTheDocument();
        expect(screen.getByText('Hoodie Acid Wash Drop #01 400G')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('shows the catalog piece count in the header', async () => {
    render(<ProductGrid initialProducts={CATALOG_PRODUCTS} />);

    await waitFor(() => {
      expect(screen.getByText(/\d+ piezas/i)).toBeInTheDocument();
    });
  });


  it('paints the main image on top of the hover image', async () => {
    render(<ProductGrid initialProducts={CATALOG_PRODUCTS} />);

    await waitFor(() => {
      expect(screen.getByText('Remera Oversize Heavyweight 240g')).toBeInTheDocument();
    });

    const principales = screen.getAllByAltText(/vista principal$/);
    const traseras = screen.getAllByAltText(/vista trasera$/);

    expect(principales.length).toBeGreaterThan(0);
    expect(traseras.length).toBeGreaterThan(0);


    const card = principales[0].closest('a');
    const imagesInCard = card ? Array.from(card.querySelectorAll('img')) : [];

    expect(imagesInCard).toHaveLength(2);
    expect(imagesInCard[0].getAttribute('alt')).toMatch(/vista trasera$/);
    expect(imagesInCard[1].getAttribute('alt')).toMatch(/vista principal$/);
  });
});
