'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryColumn {
  label: string;
  headline: string;
  href: string;
  image: string;
  alt: string;
}

const categories: CategoryColumn[] = [
  {
    label: 'Colección',
    headline: 'Femenino',
    href: '/catalog?cut=FEMENINO',
    image: '/hero/col-1.png',
    alt: 'Colección Femenina — editorial streetwear',
  },
  {
    label: 'Colección',
    headline: 'Masculino',
    href: '/catalog?cut=MASCULINO',
    image: '/hero/col-2.png',
    alt: 'Colección Masculina — editorial streetwear',
  },
];

/**
 * Category Editorial Split — 2 full-width columns, 0px gap.
 * Each column has a full-bleed photo with pill CTA overlay.
 */
export default function CategorySplit() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    const el = document.getElementById('category-split');
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="category-split"
      className="grid grid-cols-1 md:grid-cols-2 w-full"
      style={{ gap: 0, minHeight: '70vh' }}
    >
      {categories.map((cat, i) => (
        <Link
          key={cat.href}
          href={cat.href}
          className="group relative block overflow-hidden"
          style={{ minHeight: '50vh' }}
        >
          {/* Background Image */}
          <Image
            src={cat.image}
            alt={cat.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            style={{ objectPosition: 'center top' }}
          />

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.1) 40%, transparent 60%)',
            }}
          />

          {/* Text content */}
          <div
            className="absolute bottom-0 left-0 w-full"
            style={{
              padding: '48px 32px',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              transition: `opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 150}ms, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) ${i * 150}ms`,
            }}
          >
            <span
              style={{
                display: 'block',
                color: 'var(--white)',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                marginBottom: '8px',
                opacity: 0.7,
              }}
            >
              {cat.label}
            </span>
            <h2
              style={{
                color: 'var(--white)',
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                margin: 0,
                marginBottom: '20px',
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
              }}
            >
              {cat.headline}
            </h2>
            <span className="pill-cta" style={{ fontSize: '12px', padding: '8px 24px' }}>
              Ver Colección
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}
