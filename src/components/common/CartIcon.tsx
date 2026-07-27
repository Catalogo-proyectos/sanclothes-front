'use client';

import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface CartIconProps {
  onClick?: () => void;
}

export default function CartIcon({ onClick }: CartIconProps) {
  const itemCount = useCart((state) => state.getItemCount());

  return (
    <button
      onClick={onClick}
      aria-label="Carrito de compras"
      className="relative p-2 text-black hover:opacity-60 transition-opacity flex items-center gap-1.5"
    >
      <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
      <span className="text-[11px] font-extrabold uppercase tracking-wider hidden sm:inline">
        CARRITO
      </span>
      {itemCount > 0 && (
        <span
          className="bg-black text-white text-[10px] font-black w-4.5 h-4.5 px-1 flex items-center justify-center border border-white"
          style={{ borderRadius: '0px' }}
        >
          {itemCount}
        </span>
      )}
    </button>
  );
}
