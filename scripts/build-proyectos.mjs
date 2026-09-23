#!/usr/bin/env node
/* Comando de generacion de proyectos: `npm run build:proyectos`.
 *
 * Lee y valida `contenido/proyectos/`, cuenta lo que ha encontrado y, para
 * cada proyecto con caso de estudio, escribe su pagina en
 * `proyectos/<identificador>.html` (T3 de la spec 001: RF-11, RF-16 a RF-23,
 * RF-47, RF-48). Esas paginas se sirven en `/proyectos/<identificador>`
 * gracias a `cleanUrls` en `vercel.json`, y se commitean como el resto de lo
 * generado (constitucion, principio 1). Ademas sustituye, en `index.html`,
 * el bloque de tarjetas de la portada con todos los proyectos publicados
 * (T4 de la spec 001: RF-2 a RF-8, RF-12 a RF-15).
 *
 * El comando no se llama `build` a proposito: Vercel ejecutaria un script con
 * ese nombre y el sitio se sirve estatico (ver `.vercelignore`).
 */

import { mkdirSync, writeFileSync, readdirSync, existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { leerProyectos, ErrorDeProyecto } from './proyectos.mjs';
import { generarPaginaProyecto } from './plantilla-proyecto.mjs';
import { generarBloqueProyectos } from './plantilla-portada.mjs';

const DIR_PROYECTOS = 'proyectos';
const SITEMAP = 'sitemap.xml';
const INDEX_HTML = 'index.html';
const MARCA_INICIO = '<!-- proyectos:inicio -->';
const MARCA_FIN = '<!-- proyectos:fin -->';

/* Borra las paginas de una tanda anterior que ya no corresponden a ningun
   proyecto con caso de estudio de hoy (un identificador que cambio de nombre
   o un caso que se quito no debe dejar una pagina huerfana publicada). */
function limpiarPaginasAntiguas(dirProyectos, idsActuales) {
  if (!existsSync(dirProyectos)) return;
  for (const nombre of readdirSync(dirProyectos)) {
    if (!nombre.endsWith('.html')) continue;
    if (!idsActuales.has(nombre.slice(0, -'.html'.length))) {
      unlinkSync(join(dirProyectos, nombre));
    }
  }
}

/* Escribe una pagina por proyecto con caso de estudio. `siguiente` recorre
   los proyectos con caso, en el orden de la portada, en circulo (RF-20,
   RF-21); si solo hay uno, no hay enlace "siguiente" (RF-22). */
export function generarPaginas(conCaso, { dirProyectos = DIR_PROYECTOS } = {}) {
  mkdirSync(dirProyectos, { recursive: true });
  limpiarPaginasAntiguas(dirProyectos, new Set(conCaso.map((p) => p.identificador)));
  for (const [i, proyecto] of conCaso.entries()) {
    const siguiente = conCaso.length > 1 ? conCaso[(i + 1) % conCaso.length] : null;
    const html = generarPaginaProyecto(proyecto, { siguiente });
    writeFileSync(join(dirProyectos, `${proyecto.identificador}.html`), html);
  }
}

/* Reescribe el sitemap conservando las entradas que no son de un proyecto
   (hoy: `/`, `/topnote` y `/privacidad`, con la fecha que ya tuvieran) y
   sustituyendo las de `/proyectos/*` por las de esta tanda (RF-48). */
export function actualizarSitemap(conCaso, { rutaSitemap = SITEMAP } = {}) {
  const original = readFileSync(rutaSitemap, 'utf8');
  const bloque = /<url>\s*<loc>(.*?)<\/loc>\s*<lastmod>(.*?)<\/lastmod>\s*<\/url>/g;
  const entradas = [...original.matchAll(bloque)].map(([, loc, lastmod]) => ({ loc, lastmod }));
  const fijas = entradas.filter((e) => !e.loc.startsWith('https://hugogaliana.com/proyectos/'));
  const hoy = new Date().toISOString().slice(0, 10);
  const nuevas = conCaso.map((p) => ({ loc: `https://hugogaliana.com/proyectos/${p.identificador}`, lastmod: hoy }));
  const todas = [...fijas, ...nuevas];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${
    todas.map((e) => `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n  </url>`).join('\n')
  }\n</urlset>\n`;
  writeFileSync(rutaSitemap, xml);
}

/* Sustituye, dentro de `rutaIndex`, lo que haya entre las marcas
   `proyectos:inicio` y `proyectos:fin` por el bloque de tarjetas generado a
   partir de `proyectos` (todos los publicados, no solo los que tienen caso
   de estudio: RF-2). Si a `index.html` le faltan las marcas, falla nombrando
   cual, igual que un proyecto mal escrito (`ErrorDeProyecto`), y no toca el
   archivo. Ejecutarlo dos veces deja el mismo HTML: se busca la posicion de
   las marcas en cada llamada, nunca se duplican. */
export function actualizarIndex(proyectos, { rutaIndex = INDEX_HTML, raizAssets = 'assets' } = {}) {
  const original = readFileSync(rutaIndex, 'utf8');
  const inicio = original.indexOf(MARCA_INICIO);
  const fin = original.indexOf(MARCA_FIN);
  const faltan = [inicio === -1 ? MARCA_INICIO : null, fin === -1 ? MARCA_FIN : null].filter(Boolean);
  if (faltan.length > 0) {
    throw new ErrorDeProyecto(rutaIndex, `faltan las marcas ${faltan.join(' y ')}`);
  }
  if (fin < inicio) {
    throw new ErrorDeProyecto(rutaIndex, `la marca ${MARCA_FIN} aparece antes que ${MARCA_INICIO}`);
  }
  const bloque = generarBloqueProyectos(proyectos, { raizAssets });
  const nuevo = `${original.slice(0, inicio + MARCA_INICIO.length)}${bloque}\n    ${original.slice(fin)}`;
  writeFileSync(rutaIndex, nuevo);
}

function main() {
  const proyectos = leerProyectos();
  if (proyectos.length === 0) {
    console.log('No hay proyectos publicados en contenido/proyectos/.');
    return;
  }
  console.log(`${proyectos.length} proyecto(s) publicados:`);
  for (const p of proyectos) {
    const marcas = [
      p.destacado ? 'destacado' : null,
      p.caso ? `caso de estudio (${p.apartados.length} apartados)` : 'solo tarjeta',
    ].filter(Boolean);
    console.log(`  ${p.fecha}  ${p.titulo}  ·  /proyectos/${p.identificador}  ·  ${marcas.join(', ')}`);
  }

  const conCaso = proyectos.filter((p) => p.caso);
  generarPaginas(conCaso);
  actualizarSitemap(conCaso);
  actualizarIndex(proyectos);
  console.log(`\n${conCaso.length} pagina(s) de proyecto generadas en ${DIR_PROYECTOS}/, ${SITEMAP} actualizado y ${INDEX_HTML} con sus tarjetas.`);
}

/* `generarPaginas` y `actualizarSitemap` se exportan para las pruebas, que las
   llaman con rutas de una carpeta temporal; por eso `main` solo se ejecuta al
   invocar el archivo como comando, no al importarlo. */
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    main();
  } catch (error) {
    if (error instanceof ErrorDeProyecto) {
      console.error(`\nNo se ha generado nada. ${error.message}\n`);
      process.exit(1);
    }
    throw error;
  }
}
