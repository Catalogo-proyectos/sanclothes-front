'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCut = searchParams.get('cut') || '';
  const currentCategory = searchParams.get('category') || '';

  const handleFilter = (type: 'cut' | 'category', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(type, value);
    } else {
      params.delete(type);
    }
    router.push(`/catalog?${params.toString()}`);
  };

  const categories = [
    { value: '', label: 'Novedades' },
    { value: 'remeras', label: 'Camisetas' },
    { value: 'hoodies', label: 'Sudaderas' },
    { value: 'pantalones', label: 'Pantalones' },
    { value: 'polos', label: 'Polos' },
    { value: 'accesorios', label: 'Accesorios' },
  ];

  const cuts = [
    { value: '', label: 'Todo' },
    { value: 'MASCULINO', label: 'Hombre' },
    { value: 'FEMENINO', label: 'Mujer' },
    { value: 'UNISEX', label: 'Unisex' },
  ];

  return (
    <div className="w-full bg-white border-b border-zinc-200 py-3 mb-6 overflow-hidden">
      <div className="flex items-center justify-between gap-6 overflow-x-auto no-scrollbar scroll-smooth">
        {/* Category horizontal scroll tabs */}
        <div className="flex items-center gap-6 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.label}
              onClick={() => handleFilter('category', cat.value)}
              className={`text-[12px] font-medium uppercase tracking-wider whitespace-nowrap transition-all ${
                currentCategory === cat.value && !currentCut
                  ? 'text-black font-bold border-b-2 border-black pb-0.5'
                  : 'text-zinc-600 hover:text-black'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gender / Cut tabs */}
        <div className="flex items-center gap-2 shrink-0 border-l border-zinc-200 pl-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mr-1">Filtro:</span>
          {cuts.map((c) => (
            <button
              key={c.value}
              onClick={() => handleFilter('cut', c.value)}
              className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                currentCut === c.value
                  ? 'bg-white text-black'
                  : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
              }`}
              style={{ borderRadius: '0px' }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
