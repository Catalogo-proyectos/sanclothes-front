'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface CartIconProps {
  onClick?: () => void;
}

export default function CartIcon({ onClick }: CartIconProps) {
  const itemCount = useCart((state) => state.getItemCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayCount = mounted ? itemCount : 0;

  return (
    <button
      onClick={onClick}
      aria-label="Carrito de compras"
      className="relative p-2 text-black hover:opacity-60 transition-opacity flex items-center gap-1.5 cursor-pointer"
    >
      <ShoppingBag className="w-5 h-5 stroke-[2]" />
      <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline text-[#17191c]">
        CARRITO
      </span>
      {displayCount > 0 && (
        <span
          className="bg-black text-white text-[10px] font-black w-4.5 h-4.5 px-1 flex items-center justify-center border border-white"
          style={{ borderRadius: '0px' }}
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}
