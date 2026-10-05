import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { CatalogProduct } from '@/types/api';

const realProduct: CatalogProduct = {
  productId: 'prod_real_1',
  slug: 'campera-real',
  title: 'Campera Real Del Catálogo',
  description: 'Suede pesado',
  price: 350_000,
  discountPrice: null,
  images: [],
  cuts: ['CLASSIC'],
  category: 'CHAQUETAS',
  sizes: ['M'],
  stockStatus: 'IN_STOCK',
  styles: ['streetwear'],
  categoryName: 'Chaquetas',
  color: 'Marrón',
  bento: null,
};

vi.mock('@/lib/services/catalog', () => ({
  fetchCatalog: vi.fn(async () => [realProduct]),
}));

import SearchModal from '@/components/common/SearchModal';

describe('SearchModal', () => {
  it('busca en el catálogo real (no en los mocks), por nombre de tipo, color o estilo', async () => {
    render(<SearchModal isOpen onClose={() => {}} />);
    const input = screen.getByRole('textbox');

    for (const query of ['chaquetas', 'marron', 'streetwear']) {
      fireEvent.change(input, { target: { value: query } });
      await waitFor(() => expect(screen.getAllByText('Campera Real Del Catálogo').length).toBeGreaterThan(0));
    }
    // Un producto de prueba de los mocks no aparece.
    fireEvent.change(input, { target: { value: 'Heavyweight 240g' } });
    await waitFor(() => expect(screen.queryByText('Remera Oversize Heavyweight 240g')).not.toBeInTheDocument());
  });
});
