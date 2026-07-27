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
  it('should render catalog filter tabs and product cards from mock dataset', async () => {
    render(<ProductGrid />);

    // Should display category filter tabs
    expect(screen.getByText(/Novedades/i)).toBeInTheDocument();

    // Wait for mock API response to populate UI
    await waitFor(
      () => {
        expect(screen.getByText('Remera Oversize TRECE13 Heavyweight')).toBeInTheDocument();
        expect(screen.getByText('Hoodie Acid Wash Drop #01')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });
});
