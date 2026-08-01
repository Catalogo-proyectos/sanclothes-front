/**
 * Normaliza los assets de `public/img` a WebP con dimensiones razonables.
 *
 * El repo arrastraba JPEGs directos de cámara (4160x6240, 9-17 MB cada uno).
 * `next/image` puede reescalarlos, pero pagar la decodificación de 26 MP en
 * cada variante hace que la optimización tarde segundos por petición en dev y
 * dispara el coste de build. La fuente debe entrar ya acotada.
 *
 * Idempotente: si el .webp existe y es más nuevo que el original, se salta.
 * Los originales se mueven a `.image-originals/` (ignorado por git) en vez de
 * borrarse, para poder regenerar con otros parámetros más adelante.
 *
 *   pnpm images:optimize            # convierte lo que falte
 *   pnpm images:optimize --force    # regenera todo
 *   pnpm images:optimize --dry-run  # sólo informa
 */

import { createRequire } from 'node:module';
import { mkdirSync, readdirSync, renameSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const imagesRoot = join(projectRoot, 'public/img');
const archiveRoot = join(projectRoot, '.image-originals');

const force = process.argv.includes('--force');
const dryRun = process.argv.includes('--dry-run');

/**
 * Techo de resolución por carpeta, en px del lado mayor.
 *
 * Los heroes se muestran a ancho completo, así que 2560 cubre pantallas 2x
 * hasta 1280 CSS px. Las fotos de producto viven en tarjetas y galerías que
 * nunca superan ~800 CSS px, así que 2000 ya es holgado para el zoom del
 * lightbox. Los logos se dejan intactos: son diminutos y el PNG con alfa
 * ya está bien resuelto.
 */
const RULES = [
  { match: /^hero[\\/]/, maxEdge: 2560, quality: 80 },
  { match: /^secciones[\\/]/, maxEdge: 2560, quality: 80 },
  { match: /^products[\\/]/, maxEdge: 2000, quality: 82 },
  { match: /^nav[\\/]/, maxEdge: 1200, quality: 80 },
];
const DEFAULT_RULE = { maxEdge: 2000, quality: 80 };

const CONVERTIBLE = new Set(['.jpg', '.jpeg', '.png']);

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function ruleFor(relPath) {
  return RULES.find((r) => r.match.test(relPath)) ?? DEFAULT_RULE;
}

const mb = (bytes) => `${(bytes / 1048576).toFixed(2)} MB`;

let totalBefore = 0;
let totalAfter = 0;
let converted = 0;
let skipped = 0;

for (const file of walk(imagesRoot)) {
  const ext = extname(file).toLowerCase();
  if (!CONVERTIBLE.has(ext)) continue;

  const relPath = relative(imagesRoot, file);

  // Los logos conservan su PNG: llevan transparencia y pesan pocos KB, así que
  // convertirlos sólo añadiría un formato más que mantener.
  if (relPath.startsWith('logo')) continue;

  const target = file.slice(0, -ext.length) + '.webp';
  const sourceSize = statSync(file).size;

  if (!force) {
    try {
      if (statSync(target).mtimeMs >= statSync(file).mtimeMs) {
        skipped += 1;
        continue;
      }
    } catch {
      /* aún no existe: lo generamos */
    }
  }

  const { maxEdge, quality } = ruleFor(relPath);
  const meta = await sharp(file).metadata();
  const longEdge = Math.max(meta.width, meta.height);
  const needsResize = longEdge > maxEdge;

  if (dryRun) {
    console.log(
      `${relPath}  ${meta.width}x${meta.height}  ${mb(sourceSize)}` +
        `${needsResize ? `  ->  lado mayor ${maxEdge}` : '  ->  sin reescalar'}  q${quality}`
    );
    continue;
  }

  await sharp(file)
    // `withoutEnlargement` evita estirar cualquier asset ya pequeño.
    .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
    .rotate() // aplica la orientación EXIF antes de descartar los metadatos
    .webp({ quality, effort: 6 })
    .toFile(target);

  const outSize = statSync(target).size;
  totalBefore += sourceSize;
  totalAfter += outSize;
  converted += 1;

  const archived = join(archiveRoot, relPath);
  mkdirSync(dirname(archived), { recursive: true });
  renameSync(file, archived);

  const saved = ((1 - outSize / sourceSize) * 100).toFixed(1);
  console.log(
    `${relPath}\n  ${meta.width}x${meta.height} ${mb(sourceSize)}  ->  ` +
      `${needsResize ? `lado mayor ${maxEdge}` : `${meta.width}x${meta.height}`} ` +
      `${mb(outSize)}  (-${saved}%)`
  );
}

if (dryRun) {
  console.log('\n(dry run: no se escribió nada)');
} else {
  console.log(
    `\n${converted} convertidas, ${skipped} sin cambios.\n` +
      `${mb(totalBefore)} -> ${mb(totalAfter)}` +
      (totalBefore ? `  (-${((1 - totalAfter / totalBefore) * 100).toFixed(1)}%)` : '') +
      `\nOriginales archivados en .image-originals/`
  );
}
