/**
 * Reaper del lockfile de `next dev`.
 *
 * Next 16 escribe `.next/dev/lock` con el PID del servidor activo y aborta el
 * arranque si ese PID sigue vivo. En Windows, cerrar la terminal integrada de
 * VS Code termina el proceso `pnpm` pero NO propaga la señal al nieto
 * `next dev`: queda huérfano escuchando el puerto y el lock apuntando a él.
 * El siguiente `pnpm dev` falla con "Another next dev server is already running".
 *
 * Este script corre como `predev` y deja el lock en un estado coherente:
 *   - lock ausente o ilegible          -> lo borra y sigue
 *   - PID muerto (lock rancio)         -> lo borra y sigue
 *   - PID vivo pero NO es de este repo -> lo borra y sigue (reciclaje de PID)
 *   - PID vivo y es un `next` de aquí  -> mata el árbol de procesos y borra el lock
 *
 * Nunca mata nada que no haya podido verificar como un servidor Next de este
 * directorio, así que es seguro tenerlo siempre activo.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lockPath = resolve(projectRoot, '.next/dev/lock');

const log = (msg) => console.log(`[dev-guard] ${msg}`);

/** Borra el lock; ausente o bloqueado no es un error. */
function dropLock() {
  try {
    rmSync(lockPath, { force: true });
  } catch {
    /* el propio next lo reescribirá al arrancar */
  }
}

/** ¿Existe el proceso? La señal 0 no lo toca, sólo comprueba. */
function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM'; // vive, pero pertenece a otro usuario
  }
}

/**
 * Línea de comandos del proceso, o null si no se puede determinar.
 * Sirve para no matar un PID reciclado por otro programa cualquiera.
 */
function commandLineOf(pid) {
  try {
    if (process.platform === 'win32') {
      const out = execFileSync(
        'powershell.exe',
        [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          `(Get-CimInstance Win32_Process -Filter "ProcessId=${pid}").CommandLine`,
        ],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      );
      return out.trim() || null;
    }
    return execFileSync('ps', ['-o', 'command=', '-p', String(pid)], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim() || null;
  } catch {
    return null;
  }
}

/**
 * ¿Es esta línea de comandos un servidor Next de ESTE proyecto?
 * Exigir la ruta del repo evita cargarnos el `next dev` de otro proyecto que
 * casualmente tenga el mismo PID reciclado o el mismo puerto.
 */
function isProjectNextServer(cmd, pid) {
  if (!cmd || pid === process.pid) return false;
  // `[\\/]next[\\/]` casa con node_modules/next/... pero no con `.next/`,
  // así que no confundimos el servidor con sus artefactos de build.
  return cmd.includes(projectRoot) && /[\\/]next[\\/]/.test(cmd);
}

/**
 * Todos los servidores Next vivos de este proyecto, sin pasar por el lock.
 *
 * Es la vía de escape para cuando el lock existe pero no se puede leer: Next lo
 * mantiene abierto y, según el modo de compartición con que lo abra el lector,
 * un `readFileSync` puede fallar con EBUSY/EACCES. Sin esta segunda vía nos
 * quedaríamos sin saber a quién matar justo en el caso que vinimos a resolver.
 */
function findProjectNextServers() {
  try {
    if (process.platform === 'win32') {
      const out = execFileSync(
        'powershell.exe',
        [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | " +
            'ForEach-Object { "$($_.ProcessId)`t$($_.CommandLine)" }',
        ],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      );
      return out
        .split('\n')
        .map((line) => {
          const [pid, ...rest] = line.trim().split('\t');
          return { pid: Number(pid), cmd: rest.join('\t') };
        })
        .filter(({ pid, cmd }) => Number.isInteger(pid) && isProjectNextServer(cmd, pid));
    }
    return execFileSync('ps', ['-eo', 'pid=,command='], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .split('\n')
      .map((line) => {
        const m = line.trim().match(/^(\d+)\s+(.*)$/);
        return m ? { pid: Number(m[1]), cmd: m[2] } : null;
      })
      .filter((p) => p && isProjectNextServer(p.cmd, p.pid));
  } catch {
    return [];
  }
}

/** Mata el proceso y toda su descendencia (los workers de Next son hijos). */
function killTree(pid) {
  if (process.platform === 'win32') {
    execFileSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
  } else {
    process.kill(-pid, 'SIGKILL');
  }
}

/** Termina el proceso y borra el lock. Devuelve true si el puerto queda libre. */
function reap(pid, etiqueta) {
  log(`servidor huérfano en PID ${pid}${etiqueta} — terminando árbol de procesos.`);
  try {
    killTree(pid);
  } catch (err) {
    log(`no se pudo terminar el PID ${pid}: ${err.message}`);
    return false;
  }
  return true;
}

let lock = null;
let lockIlegible = false;
try {
  // replace() quita el BOM: JSON.parse lo rechaza y cualquier herramienta que
  // reescriba el lock a mano en Windows puede dejarlo (Out-File lo añade).
  lock = JSON.parse(readFileSync(lockPath, 'utf8').replace(/^﻿/, ''));
} catch (err) {
  // ENOENT = no hay servidor previo, el caso normal. Cualquier otro error
  // (EBUSY, EACCES, JSON corrupto) significa que hay un lock que no sabemos
  // interpretar, y ahí sí conviene mirar la tabla de procesos.
  lockIlegible = err.code !== 'ENOENT';
}

const pidDelLock = Number(lock?.pid);
const lockUtilizable = Number.isInteger(pidDelLock) && pidDelLock > 0;

if (lockUtilizable && !isAlive(pidDelLock)) {
  log(`lock rancio del PID ${pidDelLock} (ya no existe) — eliminado.`);
  dropLock();
  process.exit(0);
}

if (lockUtilizable) {
  // Sólo reclamamos el puerto si el proceso es, demostrablemente, un Next de
  // este repo. Cualquier otra cosa se deja intacta: el PID pudo reciclarse.
  if (!isProjectNextServer(commandLineOf(pidDelLock), pidDelLock)) {
    log(`PID ${pidDelLock} vive pero no es un next dev de este proyecto — lock descartado.`);
    dropLock();
    process.exit(0);
  }
  if (!reap(pidDelLock, ` (puerto ${lock.port ?? '?'})`)) {
    log('ciérralo manualmente y vuelve a ejecutar `pnpm dev`.');
    process.exit(1);
  }
  dropLock();
  log('puerto liberado.');
  // Dar 300ms al stack TCP del sistema operativo para liberar completamente el puerto 3000
  try {
    execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', 'Start-Sleep -Milliseconds 300'], { stdio: 'ignore' });
  } catch {}
  process.exit(0);
}

// Sin PID fiable. Si además el lock era ilegible, es justo el caso que este
// script existe para resolver: buscamos al huérfano en la tabla de procesos.
if (lockIlegible) {
  const huerfanos = findProjectNextServers();
  if (huerfanos.length === 0) {
    log('lock ilegible pero no hay ningún next dev vivo de este proyecto — lock descartado.');
  }
  for (const { pid } of huerfanos) {
    if (!reap(pid, ' (hallado por tabla de procesos)')) {
      log('ciérralo manualmente y vuelve a ejecutar `pnpm dev`.');
      process.exit(1);
    }
  }
  if (huerfanos.length) log('puerto liberado.');
}

dropLock();
