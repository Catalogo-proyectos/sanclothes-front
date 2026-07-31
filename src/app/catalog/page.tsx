import { Suspense } from 'react';
import PageHero from '@/components/common/PageHero';
import ProductGrid from '@/components/catalog/ProductGrid';

export default function CatalogPage() {
  return (
    <div className="bg-[#f6f8f9]">
      {/* Page Hero */}
      <PageHero
        category="CATÁLOGO OFICIAL / SANCLOTHES"
        title="COLECCIÓN CONTEMPORÁNEA & ATEMPORAL"
        subtitle="Explorá prendas esenciales diseñadas con proporciones neutras, siluetas sobrias y materias primas de máxima densidad."
        image="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1600&auto=format&fit=crop&q=85"
      />

      {/* Catalog Grid */}
      <Suspense fallback={<div className="py-12 text-center text-xs font-semibold text-zinc-400 uppercase tracking-widest">Cargando catálogo...</div>}>
        <ProductGrid />
      </Suspense>
    </div>
  );
}
