'use client';

import { Star, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CustomerReviewsSection() {
  const reviews = [
    {
      id: 1,
      quote:
        '“LA DENSIDAD DEL ALGODÓN ES INCREÍBLE. LAS REMERAS MANTIENEN LA FORMA TRAS VARIOS LAVADOS Y EL CALCE ATEMPORAL ES IMPECABLE.”',
      author: 'MATÍAS G.',
      location: 'ASUNCIÓN',
      product: 'REMERA HEAVYWEIGHT NEGRA',
      rating: '5.0',
    },
    {
      id: 2,
      quote:
        '“EL HOODIE TIENE LA ESTRUCTURA FIRME QUE BUSCABA HACE TIEMPO. EL PESO DEL FRISO 400G Y LA CAPUCHA DOBLE MARCAN LA DIFERENCIA.”',
      author: 'SOFÍA R.',
      location: 'CIUDAD DEL ESTE',
      product: 'HOODIE ESTRUCTURADO GRIS',
      rating: '5.0',
    },
    {
      id: 3,
      quote:
        '“ATENCIÓN DE PRIMER NIVEL Y ENVÍO RÁPIDO. LAS TELAS DE LOS PANTALONES SON DE EXCELENTE CALIDAD Y EL TALLE ES EXACTO.”',
      author: 'LUCAS M.',
      location: 'ENCARNACIÓN',
      product: 'PANTALÓN CORTE RECTO',
      rating: '4.9',
    },
  ];

  return (
    <section className="py-24 bg-white border-b border-zinc-200">
      <div className="w-full px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6 border-b border-zinc-200 pb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400 block mb-1">
              OPINIONES VERIFICADAS DE COMPRADORES
            </span>
            <h2 className="text-3xl font-black tracking-tight text-black uppercase font-sans">
              EXPERIENCIA DE CLIENTES
            </h2>
          </div>

          <div
            className="flex items-center gap-3 bg-black text-white px-5 py-3 border border-black self-start sm:self-auto"
            style={{ borderRadius: '0px' }}
          >
            <span className="text-2xl font-black font-sans">4.9</span>
            <div className="text-[10px] tracking-[0.2em] uppercase font-bold text-zinc-300">
              <div className="flex items-center gap-1 text-white mb-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3 h-3 fill-white stroke-none" />
                ))}
              </div>
              VALORACIÓN MEDIA
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="bg-white border border-white/10 p-8 flex flex-col justify-between hover:border-black transition-colors"
              style={{ borderRadius: '0px' }}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-black stroke-none" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold tracking-widest text-black uppercase bg-zinc-100 px-2 py-0.5 border border-white/10">
                    <CheckCircle2 className="w-3 h-3" />
                    VERIFICADO
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-black font-bold tracking-wide leading-relaxed uppercase mb-8">
                  {rev.quote}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-black uppercase tracking-wider">
                    {rev.author}
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-bold tracking-widest block uppercase">
                    {rev.location}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {rev.product}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
