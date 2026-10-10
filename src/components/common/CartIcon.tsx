'use client';

import { useSyncExternalStore } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface CartIconProps {
  onClick?: () => void;
  isWhiteText?: boolean;
}

const subscribeToCartHydration = (onStoreChange: () => void) =>
  useCart.persist?.onFinishHydration(onStoreChange) ?? (() => undefined);

const getCartHydrationSnapshot = () => useCart.persist?.hasHydrated() ?? false;

export default function CartIcon({ onClick, isWhiteText = false }: CartIconProps) {
  const itemCount = useCart((state) => state.getItemCount());
  const hydrated = useSyncExternalStore(
    subscribeToCartHydration,
    getCartHydrationSnapshot,
    () => false,
  );
  const displayCount = hydrated ? itemCount : 0;

  return (
    <button
      onClick={onClick}
      aria-label={displayCount > 0 ? `Carrito de compras, ${displayCount} productos` : 'Carrito de compras'}
      className={`relative flex h-10 w-10 max-[359px]:w-9 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${
        isWhiteText
          ? 'text-white hover:bg-white/10 focus-visible:outline-white'
          : 'text-[#17191c] hover:bg-[#17191c]/5 focus-visible:outline-[#17191c]'
      }`}
    >
      <ShoppingBag className="h-5 w-5 stroke-[1.75]" />
      {displayCount > 0 && (
        <span
          aria-hidden
          className={`absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${
            isWhiteText
              ? 'bg-[#f6f8f9] text-[#17191c]'
              : 'bg-[#17191c] text-white'
          }`}
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}
