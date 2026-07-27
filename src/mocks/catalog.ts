import { CatalogProduct, CutInfo } from '@/types/api';

export const MOCK_CUTS: CutInfo[] = [
  { code: 'FEMENINO', label: 'Colección Femenina', productCount: 12 },
  { code: 'MASCULINO', label: 'Colección Masculina', productCount: 14 },
  { code: 'UNISEX', label: 'Colección Unisex (Drop)', productCount: 8 },
];

export const MOCK_PRODUCTS: CatalogProduct[] = [
  {
    productId: 'prod_trece_01',
    slug: 'remera-oversize-trece13',
    title: 'Remera Oversize TRECE13 Heavyweight',
    description: 'Remera oversize 100% algodón 240g/m2. Fit streetwear de caída pesada con logo bordado en el pecho.',
    price: 150000,
    discountPrice: 135000,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        alt: 'Frente Remera Oversize TRECE13',
        cutVariant: 'UNISEX',
      },
      {
        url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
        alt: 'Espalda Remera Oversize TRECE13',
        cutVariant: 'UNISEX',
      },
    ],
    cuts: ['FEMENINO', 'MASCULINO', 'UNISEX'],
    category: 'remeras',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    stockStatus: 'IN_STOCK',
    rating: 4.9,
    reviewCount: 28,
    flashSale: {
      discountPercent: 10,
      endsAt: '2026-08-01T23:59:59Z',
    },
    variants: [
      { variantId: 'var_001', sku: 'REM-TR13-FEM-S', cut: 'FEMENINO', size: 'S', price: 135000, stock: 15 },
      { variantId: 'var_002', sku: 'REM-TR13-FEM-M', cut: 'FEMENINO', size: 'M', price: 135000, stock: 25 },
      { variantId: 'var_003', sku: 'REM-TR13-MAS-L', cut: 'MASCULINO', size: 'L', price: 135000, stock: 10 },
      { variantId: 'var_004', sku: 'REM-TR13-MAS-XL', cut: 'MASCULINO', size: 'XL', price: 135000, stock: 5 },
    ],
  },
  {
    productId: 'prod_trece_02',
    slug: 'hoodie-acid-wash-drop01',
    title: 'Hoodie Acid Wash Drop #01',
    description: 'Hoodie frizado pesado con proceso de acid wash artesanal. Capucha de doble capa y bolsillo canguro.',
    price: 320000,
    discountPrice: null,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        alt: 'Frente Hoodie Acid Wash',
        cutVariant: 'MASCULINO',
      },
    ],
    cuts: ['MASCULINO', 'UNISEX'],
    category: 'hoodies',
    sizes: ['S', 'M', 'L', 'XL'],
    stockStatus: 'LOW_STOCK',
    rating: 4.8,
    reviewCount: 16,
    variants: [
      { variantId: 'var_005', sku: 'HD-ACID-MAS-M', cut: 'MASCULINO', size: 'M', price: 320000, stock: 3 },
      { variantId: 'var_006', sku: 'HD-ACID-MAS-L', cut: 'MASCULINO', size: 'L', price: 320000, stock: 2 },
    ],
  },
  {
    productId: 'prod_trece_03',
    slug: 'top-cropped-streetwear',
    title: 'Top Cropped Raw Edge',
    description: 'Top corto acanalado con bordes al corte. Diseñado para alta comodidad y estética streetwear femenina.',
    price: 110000,
    discountPrice: 95000,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
        alt: 'Top Cropped Raw Edge',
        cutVariant: 'FEMENINO',
      },
    ],
    cuts: ['FEMENINO'],
    category: 'remeras',
    sizes: ['XS', 'S', 'M', 'L'],
    stockStatus: 'IN_STOCK',
    rating: 4.7,
    reviewCount: 9,
    variants: [
      { variantId: 'var_007', sku: 'TOP-RAW-FEM-S', cut: 'FEMENINO', size: 'S', price: 95000, stock: 20 },
      { variantId: 'var_008', sku: 'TOP-RAW-FEM-M', cut: 'FEMENINO', size: 'M', price: 95000, stock: 18 },
    ],
  },
  {
    productId: 'prod_trece_04',
    slug: 'pantalones-cargo-tactical',
    title: 'Pantalón Cargo Tactical Black',
    description: 'Pantalón cargo de gabardina reforzada con 6 bolsillos funcionales y tiras ajustables en tobillos.',
    price: 280000,
    discountPrice: null,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
        alt: 'Pantalón Cargo Tactical',
        cutVariant: 'UNISEX',
      },
    ],
    cuts: ['FEMENINO', 'MASCULINO', 'UNISEX'],
    category: 'pantalones',
    sizes: ['S', 'M', 'L', 'XL'],
    stockStatus: 'IN_STOCK',
    rating: 5.0,
    reviewCount: 14,
    variants: [
      { variantId: 'var_009', sku: 'PA-CARGO-UNI-M', cut: 'UNISEX', size: 'M', price: 280000, stock: 12 },
      { variantId: 'var_010', sku: 'PA-CARGO-UNI-L', cut: 'UNISEX', size: 'L', price: 280000, stock: 8 },
    ],
  },
];
