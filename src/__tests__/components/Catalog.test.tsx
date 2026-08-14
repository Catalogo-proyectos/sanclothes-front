import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ProductGrid from '@/components/catalog/ProductGrid';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('Catalog Components with Mock Layer', () => {
  it('renders product cards from the catalog once it loads', async () => {
    render(<ProductGrid />);

    await waitFor(
      () => {
        expect(screen.getByText('Remera Oversize Heavyweight 240g')).toBeInTheDocument();
        expect(screen.getByText('Hoodie Acid Wash Drop #01 400G')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('shows the catalog piece count in the header', async () => {
    render(<ProductGrid />);

    await waitFor(() => {
      expect(screen.getByText(/\d+ piezas/i)).toBeInTheDocument();
    });
  });

  /**
   * La card debe mostrar el slot 0 (principal), no el 1. Las dos imágenes son
   * `fill` sin z-index, así que el orden en el DOM decide cuál se ve: la de hover
   * va primero para quedar debajo. Este test es el que atrapa una regresión ahí.
   */
  it('paints the main image on top of the hover image', async () => {
    render(<ProductGrid />);

    await waitFor(() => {
      expect(screen.getByText('Remera Oversize Heavyweight 240g')).toBeInTheDocument();
    });

    const principales = screen.getAllByAltText(/vista principal$/);
    const traseras = screen.getAllByAltText(/vista trasera$/);

    expect(principales.length).toBeGreaterThan(0);
    expect(traseras.length).toBeGreaterThan(0);

    // Dentro de una misma card, la trasera (hover) precede a la principal.
    const card = principales[0].closest('a');
    const imagesInCard = card ? Array.from(card.querySelectorAll('img')) : [];

    expect(imagesInCard).toHaveLength(2);
    expect(imagesInCard[0].getAttribute('alt')).toMatch(/vista trasera$/);
    expect(imagesInCard[1].getAttribute('alt')).toMatch(/vista principal$/);
  });
});
