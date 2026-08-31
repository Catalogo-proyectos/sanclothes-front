'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function SmoothScrollProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a') as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      if (!href.includes('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
        return;
      }

      const [path, hash] = href.split('#');
      if (!hash) return;

      const isCurrentPage = !path || path === '' || path === pathname || (path === '/' && pathname === '/');
      if (!isCurrentPage) return;

      const targetElement = document.getElementById(hash);
      if (!targetElement) return;

      e.preventDefault();
      e.stopPropagation();

      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      if (window.history.pushState) {
        window.history.pushState(null, '', `#${hash}`);
      } else {
        window.location.hash = hash;
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });

    if (window.location.hash) {
      const initialId = window.location.hash.substring(1);
      const initialElement = document.getElementById(initialId);
      if (initialElement) {
        const timer = setTimeout(() => {
          initialElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 150);
        return () => {
          clearTimeout(timer);
          document.removeEventListener('click', handleAnchorClick, { capture: true });
        };
      }
    }

    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
    };
  }, [pathname]);

  return null;
}
