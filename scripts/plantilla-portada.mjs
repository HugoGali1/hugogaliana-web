/* Plantilla del bloque de tarjetas de la portada.
 *
 * Recibe la lista de proyectos que ya ha leido, validado y ordenado
 * `proyectos.mjs` (destacado primero; el resto, de fecha mas reciente a mas
 * antigua y, a igual fecha, por titulo: RF-5 a RF-7) y devuelve el HTML que
 * `build-proyectos.mjs` inserta en `index.html` entre las marcas
 * `<!-- proyectos:inicio -->` y `<!-- proyectos:fin -->` (T4 de la spec 001:
 * RF-2 a RF-8, RF-12 a RF-15).
 *
 * Reutiliza el escapado de `plantilla-proyecto.mjs`: el contenido de un
 * proyecto no es de confianza, es un archivo de texto que cualquiera puede
 * escribir con datos sueltos.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { escaparHtml } from './plantilla-proyecto.mjs';

/* Lee el ancho y el alto reales de una imagen JPEG, PNG, GIF o WebP a partir
   de su cabecera, sin depender de ninguna libreria (constitucion, principio
   7: sin dependencias nuevas). Esos cuatro formatos cubren lo que hoy hay en
   `assets/` y lo que es razonable esperar de una imagen para la web. */
export function medidasImagen(ruta) {
  const buffer = readFileSync(ruta);

  // PNG: firma de 8 bytes seguida del bloque IHDR con ancho y alto en 4+4
  // bytes, big-endian.
  if (buffer.length >= 24 && buffer.readUInt32BE(0) === 0x89504e47 && buffer.toString('ascii', 12, 16) === 'IHDR') {
    return { ancho: buffer.readUInt32BE(16), alto: buffer.readUInt32BE(20) };
  }

  // GIF: cabecera fija de 6 bytes ("GIF87a" o "GIF89a") y despues ancho y
  // alto en 2+2 bytes, little-endian.
  if (buffer.length >= 10 && buffer.toString('ascii', 0, 3) === 'GIF') {
    return { ancho: buffer.readUInt16LE(6), alto: buffer.readUInt16LE(8) };
  }

  // WebP: contenedor RIFF. El formato simple (VP8 ) guarda el tamano a
  // partir del byte 26; el que admite transparencia (VP8L) lo empaqueta en
  // 4 bytes desde el 21.
  if (buffer.length >= 30 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    const formato = buffer.toString('ascii', 12, 16);
    if (formato === 'VP8 ') {
      return { ancho: buffer.readUInt16LE(26) & 0x3fff, alto: buffer.readUInt16LE(28) & 0x3fff };
    }
    if (formato === 'VP8L') {
      const bits = buffer.readUInt32LE(21);
      return { ancho: (bits & 0x3fff) + 1, alto: ((bits >> 14) & 0x3fff) + 1 };
    }
  }

  // JPEG: recorre los segmentos hasta el primer marcador "start of frame".
  if (buffer.length >= 4 && buffer.readUInt16BE(0) === 0xffd8) {
    let i = 2;
    while (i + 9 < buffer.length) {
      if (buffer[i] !== 0xff) { i += 1; continue; }
      const marcador = buffer[i + 1];
      const esSOF = marcador >= 0xc0 && marcador <= 0xcf && marcador !== 0xc4 && marcador !== 0xc8 && marcador !== 0xcc;
      if (esSOF) {
        return { alto: buffer.readUInt16BE(i + 5), ancho: buffer.readUInt16BE(i + 7) };
      }
      i += 2 + buffer.readUInt16BE(i + 2);
    }
  }

  throw new Error(`no se han podido leer las medidas de "${ruta}": formato de imagen no reconocido`);
}

/* Caso de estudio si lo tiene (RF-12); si no, demo (RF-13); si no, codigo
   (RF-14); si no tiene ninguno, sin enlace (RF-15). */
function enlaceProyecto(proyecto) {
  if (proyecto.caso) return { href: `/proyectos/${proyecto.identificador}`, externo: false };
  if (proyecto.demo) return { href: proyecto.demo, externo: true };
  if (proyecto.codigo) return { href: proyecto.codigo, externo: true };
  return null;
}

/* Las tecnologias solo salen si el proyecto las declara (RF-4). */
function tecnologias(proyecto) {
  if (proyecto.tecnologias.length === 0) return '';
  const chips = proyecto.tecnologias.map((t) => `<li class="chip">${escaparHtml(t)}</li>`).join('');
  return `\n            <ul class="chips" aria-label="Tecnologías">${chips}</ul>`;
}

function tarjeta(proyecto, { raizAssets }) {
  const enlace = enlaceProyecto(proyecto);
  const { ancho, alto } = medidasImagen(join(raizAssets, proyecto.imagen));
  const titulo = escaparHtml(proyecto.titulo);
  const alt = escaparHtml(proyecto.alt || proyecto.titulo);
  /* La tarjeta pide "el año" (RF-3), no la fecha completa: si el proyecto
     guarda mes ("2026-03"), se queda solo con los cuatro primeros dígitos. */
  const anio = escaparHtml(proyecto.fecha.slice(0, 4));
  const clase = proyecto.destacado ? 'proj-card proj-card--destacado part' : 'proj-card part';
  const etiqueta = enlace ? 'a' : 'div';
  const atributoHref = enlace
    ? (enlace.externo
      ? ` href="${escaparHtml(enlace.href)}" target="_blank" rel="noopener"`
      : ` href="${escaparHtml(enlace.href)}"`)
    : '';

  return `
      <article class="${clase}">
        <${etiqueta} class="proj-card-link"${atributoHref}>
          <div class="proj-card-media"><img src="assets/${escaparHtml(proyecto.imagen)}" width="${ancho}" height="${alto}" alt="${alt}" loading="lazy" decoding="async"></div>
          <div class="proj-card-body">
            <span class="mono proj-card-tag">${escaparHtml(proyecto.categoria)} · ${anio}</span>
            <h3>${titulo}</h3>
            <p>${escaparHtml(proyecto.descripcion)}</p>${tecnologias(proyecto)}
          </div>
        </${etiqueta}>
      </article>`;
}

/* El bloque completo: el numero de proyectos publicados (RF-8) y la
   cuadricula de tarjetas, con el destacado primero y mas grande (RF-5). El
   orden de `proyectos` ya lo decide `leerProyectos`; esta funcion no
   reordena nada. */
export function generarBloqueProyectos(proyectos, { raizAssets = 'assets' } = {}) {
  const numero = proyectos.length;
  const cuenta = `${numero} proyecto${numero === 1 ? '' : 's'} publicado${numero === 1 ? '' : 's'}`;
  const tarjetas = proyectos.map((p) => tarjeta(p, { raizAssets })).join('');
  return `
    <div class="proj-grid rev">
      <p class="proj-count mono part">${cuenta}</p>${tarjetas}
    </div>`;
}
