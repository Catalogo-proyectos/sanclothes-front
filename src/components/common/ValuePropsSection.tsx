'use client';

import { Package, ShieldCheck, CreditCard, Headphones } from 'lucide-react';

export default function ValuePropsSection() {
  const props = [
    {
      num: '01',
      icon: Package,
      title: 'ENVÍOS A TODO EL PAÍS',
      description: 'Entrega rápida a Asunción e Interior',
    },
    {
      num: '02',
      icon: ShieldCheck,
      title: 'PRODUCTOS AUTÉNTICOS',
      description: 'Calidad Atelier & 100% Algodón',
    },
    {
      num: '03',
      icon: CreditCard,
      title: 'PAGOS SEGUROS EN PY',
      description: 'SIPAP Transfer, PagoQR & Tarjetas',
    },
    {
      num: '04',
      icon: Headphones,
      title: 'ATENCIÓN PERSONALIZADA',
      description: 'Soporte vía WhatsApp & Direct',
    },
  ];

  return (
    <section className="py-14 bg-[#f6f8f9] text-[#17191c] border-y border-[#b6b2a7]/40">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {props.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="flex items-center gap-4 py-2 group"
              >
                <div className="p-3 bg-zinc-100 border border-zinc-200 group-hover:border-[#17191c] transition-colors" style={{ borderRadius: '0px' }}>
                  <Icon className="w-5 h-5 text-[#17191c]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-[0.15em] uppercase text-[#17191c] mb-0.5">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-[#50524a] font-medium tracking-wide uppercase">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
