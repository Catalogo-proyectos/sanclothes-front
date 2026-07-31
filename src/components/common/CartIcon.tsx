'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface CartIconProps {
  onClick?: () => void;
  isWhiteText?: boolean;
}

export default function CartIcon({ onClick, isWhiteText = false }: CartIconProps) {
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
      className={`relative p-2 transition-colors duration-300 flex items-center gap-1.5 cursor-pointer ${
        isWhiteText ? 'text-white hover:opacity-75' : 'text-[#17191c] hover:opacity-70'
      }`}
    >
      <ShoppingBag className="w-5 h-5 stroke-[2]" />
      <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">
        CARRITO
      </span>
      {displayCount > 0 && (
        <span
          className={`text-[10px] font-black w-4.5 h-4.5 px-1 flex items-center justify-center transition-colors duration-300 ${
            isWhiteText
              ? 'bg-white text-black border border-black'
              : 'bg-black text-white border border-white'
          }`}
          style={{ borderRadius: '0px' }}
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}
