'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { CatalogProduct, ProductVariant } from '@/types/api';
import { formatCurrency } from '@/utils/format';
import { useCart } from '@/hooks/useCart';

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const { data: product, loading, error } = useFetch<CatalogProduct>('GET', `/catalog/${productId}`);
  const addItem = useCart((state) => state.addItem);

  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedCut, setSelectedCut] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="w-10 h-10 border-2 border-zinc-950 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Cargando prenda...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <p className="text-zinc-950 font-bold uppercase tracking-wider text-sm">No se pudo cargar la prenda.</p>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [{ url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800', alt: product.title }];
  const effectivePrice = product.discountPrice || product.price;

  // Available variants
  const activeCut = selectedCut || product.cuts[0] || 'UNISEX';
  const activeSize = selectedSize || product.sizes[0] || 'M';

  const selectedVariant: ProductVariant = product.variants?.find(
    (v) => v.cut === activeCut && v.size === activeSize
  ) || {
    variantId: `var_${product.productId}_${activeCut}_${activeSize}`,
    sku: `${product.slug}-${activeCut}-${activeSize}`,
    cut: activeCut as any,
    size: activeSize,
    price: effectivePrice,
    stock: 10,
  };

  const handleAddToCart = () => {
    addItem({
      variantId: selectedVariant.variantId,
      productId: product.productId,
      productName: product.title,
      sku: selectedVariant.sku,
      size: activeSize,
      cut: activeCut,
      unitPrice: effectivePrice,
      image: images[selectedImage]?.url || images[0].url,
      quantity,
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 sm:gap-16 items-start">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-zinc-50 border border-zinc-200 overflow-hidden relative">
            <img
              src={images[selectedImage]?.url || images[0].url}
              alt={images[selectedImage]?.alt || product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 aspect-[3/4] overflow-hidden border transition-all ${
                    selectedImage === idx ? 'border-zinc-950 opacity-100' : 'border-zinc-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Options */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {product.cuts.map((c) => (
                <span key={c} className="bg-zinc-100 text-zinc-900 border border-zinc-200 text-[10px] font-semibold px-2.5 py-1 uppercase tracking-widest">
                  {c}
                </span>
              ))}
              {product.stockStatus === 'IN_STOCK' && (
                <span className="bg-zinc-950 text-white text-[10px] font-semibold px-2.5 py-1 uppercase tracking-widest">
                  DISPONIBLE
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-950 uppercase tracking-tight font-sans">{product.title}</h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-3 font-light leading-relaxed">{product.description}</p>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 flex items-baseline gap-3">
            {product.discountPrice ? (
              <>
                <span className="text-2xl sm:text-3xl font-bold text-zinc-950">{formatCurrency(product.discountPrice)}</span>
                <span className="text-sm text-zinc-400 line-through font-normal">{formatCurrency(product.price)}</span>
                <span className="bg-zinc-950 text-white text-[10px] font-semibold px-2 py-1 uppercase tracking-wider ml-auto">
                  Ahorro {formatCurrency(product.price - product.discountPrice)}
                </span>
              </>
            ) : (
              <span className="text-2xl sm:text-3xl font-bold text-zinc-950">{formatCurrency(product.price)}</span>
            )}
          </div>

          {/* Cut Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              SELECCIONAR CORTE:
            </label>
            <div className="flex gap-2">
              {product.cuts.map((cut) => (
                <button
                  key={cut}
                  onClick={() => setSelectedCut(cut)}
                  className={`px-4 py-2 text-xs font-semibold border transition-all ${
                    activeCut === cut
                      ? 'border-zinc-950 bg-zinc-950 text-white'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  {cut}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              TALLE:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`w-12 h-12 text-xs font-semibold border flex items-center justify-center transition-all ${
                    activeSize === sz
                      ? 'border-zinc-950 bg-zinc-950 text-white'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              CANTIDAD:
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-zinc-200 bg-zinc-50 font-semibold text-zinc-900 flex items-center justify-center hover:bg-zinc-100"
              >
                -
              </button>
              <span className="font-semibold text-sm w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-zinc-200 bg-zinc-50 font-semibold text-zinc-900 flex items-center justify-center hover:bg-zinc-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Action */}
          <button
            onClick={handleAddToCart}
            className={`w-full py-4 text-xs font-semibold tracking-widest uppercase transition-all border ${
              addedSuccess
                ? 'bg-zinc-800 text-white border-zinc-800'
                : 'bg-zinc-950 text-white border-zinc-950 hover:bg-zinc-800'
            }`}
          >
            {addedSuccess ? '✓ AGREGADO AL CARRITO' : 'AGREGAR AL CARRITO'}
          </button>
        </div>
      </div>
    </div>
  );
}
