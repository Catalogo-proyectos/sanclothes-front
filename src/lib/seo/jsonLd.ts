/**
 * Serializa JSON-LD para un <script type="application/ld+json"> con
 * dangerouslySetInnerHTML (M6, santclothesback/docs/AUDITORIA-SEGURIDAD-CHECKOUT-2026-10-01.md).
 *
 * JSON.stringify no escapa "<": un nombre o descripción de producto con
 * "</script>" cerraba la etiqueta y lo que seguía se ejecutaba como HTML/JS.
 * Se escapan <, >, & y los separadores de línea U+2028/U+2029 como secuencias
 * \uXXXX: el JSON resultante es equivalente para cualquier parser.
 */
const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), 'g');
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), 'g');

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(LINE_SEPARATOR, '\\u2028')
    .replace(PARAGRAPH_SEPARATOR, '\\u2029');
}
