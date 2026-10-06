


export type BackendCut = string;

export type DropType = 'DROP_01' | 'DROP_02' | 'ESPECIAL';

export interface BackendVariant {
  sku: string;
  stock: number;
}

export interface BackendFlashSale {
  discountType: 'PERCENTAGE' | 'FIXED' | 'OVERRIDE';
  discountValue: number;
  overridePrice?: number | null;
  startAt?: string | null;
  endAt?: string | null;
  isActive?: boolean;
}

export interface BackendQuantityDiscount {
  minQty: number;
  discountType: 'PERCENTAGE' | 'FIXED' | 'OVERRIDE';
  discountValue: number;
}

export interface BackendComboItem {
  productId: string;
  qty: number;
  allowedSizes: string[];
  name?: string;
  images?: string[];
  /** Talle fijo: el cliente no lo elige. */
  fixed?: boolean;
  /** Talles elegibles en el formato que acepta el checkout ("M" o "MASCULINO M"). */
  options?: Array<{ token: string; cut: string; size: string; sku: string; stock: number }>;
}

export interface BackendBento {
  title: string | null;
  copy: string | null;
  image: string | null;
  priority: number;
}

export interface BackendProduct {
  productId: string;
  slug: string;
  name: string;
  category: string;
  dropType: DropType;

  price: number;
  isDropActive: boolean;


  images: string[];


  imagesByCut?: Record<BackendCut, string[]>;


  variants: Record<BackendCut, Record<string, BackendVariant>>;

  variantsByCut?: Record<BackendCut, Record<string, BackendVariant>>;
  availableCuts?: BackendCut[];

  discountPercent: number;
  quantityDiscounts?: BackendQuantityDiscount[];
  tags: string[];
  isLimitedDrop: boolean;
  purchaseType?: string;
  badge?: string | null;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  successMessage?: string;
  shippingEstimated?: string | null;
  flashSale?: BackendFlashSale | null;

  isCombo?: boolean;
  comboItems?: BackendComboItem[];

  showHypeCountdown?: boolean;
  publishAt?: string | null;
  unpublishAt?: string | null;


  isFeatured?: boolean;

  // Catálogo v2 (aditivos: un backend viejo no los manda)
  createdAt?: string;
  styles?: string[];
  categoryName?: string;
  color?: string | null;
  bento?: BackendBento | null;

  description?: string | null;
  care?: string | null;
}
