import { describe, expect, it } from 'vitest';
import { serializeJsonLd } from '@/lib/seo/jsonLd';

describe('serializeJsonLd (M6)', () => {
  it('no deja cerrar el <script> con un </script> en los datos', () => {
    const out = serializeJsonLd({ name: 'Remera </script><script>alert(1)</script>', description: 'a & b > c' });
    expect(out).not.toContain('</script>');
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(out).not.toContain('&');
  });

  it('el resultado sigue siendo el mismo JSON', () => {
    const data = { '@type': 'Product', name: 'Remera </script> & <b>', text: 'línea siguiente' };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
