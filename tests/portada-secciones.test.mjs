/* Pruebas de las secciones de la portada (spec 001, T5: RF-1, RF-9, RF-10,
 * RF-44, RF-46).
 *
 * A diferencia de `tests/portada.test.mjs`, que prueba el generador de la
 * lista de proyectos con datos de prueba, aqui se lee el `index.html` de
 * verdad: lo que se comprueba es lo que se publica. Sin analizador de HTML,
 * que seria una dependencia nueva; bastan expresiones regulares acotadas a
 * cada seccion.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const raiz = join(import.meta.dirname, '..');
const html = readFileSync(join(raiz, 'index.html'), 'utf8');

/* El trozo de HTML que va de la etiqueta de apertura que casa con `apertura`
   hasta el primer cierre `</etiqueta>`. Vale para secciones sin anidar la
   misma etiqueta, que es el caso de todas las de la portada. */
function tramo(apertura, etiqueta) {
  const i = html.search(apertura);
  assert.ok(i >= 0, `no se encuentra ${apertura}`);
  const j = html.indexOf(`</${etiqueta}>`, i);
  assert.ok(j > i, `sin cierre </${etiqueta}> tras ${apertura}`);
  return html.slice(i, j);
}

test('RF-1: la primera pantalla presenta a Hugo y ofrece «Ver proyectos» y «Escríbeme»', () => {
  const hero = tramo(/<div class="band p1\b/, 'header');
  assert.match(hero, /<h1[^>]*>Hugo Galiana\.<\/h1>/);
  assert.match(hero, /Desarrollador full-stack · Valencia/);
  assert.match(hero, /class="static-sub">[^<]+<\/p>/);
  assert.match(hero, /<a [^>]*href="#proyectos"[^>]*>Ver proyectos<\/a>/);
  assert.match(hero, /<a [^>]*href="#contacto"[^>]*>Escríbeme<\/a>/);
});

test('RF-9: «Cómo trabajo» lleva retrato, un párrafo y tres pasos numerados', () => {
  const seccion = tramo(/<section [^>]*id="como-trabajo"/, 'section');
  assert.match(seccion, /<img [^>]*src="assets\/hugo-retrato\.jpg[^"]*"[^>]*alt="Retrato de Hugo Galiana/);
  assert.match(seccion, /<h2[^>]*>[^<]+<\/h2>/);
  assert.equal((seccion.match(/<p[ >]/g) || []).length, 1);
  const pasos = tramo(/<ol class="steps/, 'ol');
  const numeros = [...pasos.matchAll(/<li><span class="mono">(\d\d)<\/span>[^<]+<\/li>/g)].map((m) => m[1]);
  assert.deepEqual(numeros, ['01', '02', '03']);
});

test('RF-10: no quedan servicios, proceso comercial, preguntas frecuentes ni «Mantén pulsado»', () => {
  for (const id of ['servicios', 'ensamblar', 'proceso', 'faq', 'sobre-mi', 'holdpad']) {
    assert.doesNotMatch(html, new RegExp(`id="${id}"`), `sigue el id="${id}"`);
  }
  assert.doesNotMatch(html, /Mantén pulsado/);
  assert.doesNotMatch(html, /hold-/, 'queda CSS o JavaScript de «Mantén pulsado»');
  assert.doesNotMatch(html, /class="band p[2-5]\b/, 'quedan bandas de «las tres capas» en el hero');
});

test('RF-44: la barra de navegación enlaza a Proyectos, Cómo trabajo y Contacto', () => {
  const menu = tramo(/<ul id="nav-menu">/, 'ul');
  const enlaces = [...menu.matchAll(/<a [^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(enlaces, [
    ['#proyectos', 'Proyectos'],
    ['#como-trabajo', 'Cómo trabajo'],
    ['#contacto', 'Contacto'],
  ]);
  for (const [href] of enlaces) {
    assert.match(html, new RegExp(`id="${href.slice(1)}"`), `el ancla ${href} no existe`);
  }
});

test('RF-46: título, descripción e imagen para redes sin venta a comercios', () => {
  const cabecera = tramo(/<head>/, 'head');
  for (const patron of [/<title>[^<]+<\/title>/, /name="description" content="[^"]+"/,
    /property="og:title" content="[^"]+"/, /property="og:description" content="[^"]+"/,
    /property="og:image" content="[^"]+"/]) {
    assert.match(cabecera, patron);
  }
  assert.doesNotMatch(cabecera, /comercio|negocio|a medida/i);
  const datos = JSON.parse(cabecera.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
  const tipos = datos['@graph'].map((nodo) => nodo['@type']);
  assert.deepEqual(tipos, ['Person', 'WebSite']);
});

test('la página 404 no enlaza a secciones que ya no existen', () => {
  const pagina404 = readFileSync(join(raiz, '404.html'), 'utf8');
  for (const [, ancla] of pagina404.matchAll(/href="\/#([^"]+)"/g)) {
    assert.match(html, new RegExp(`id="${ancla}"`), `la 404 enlaza a /#${ancla}`);
  }
});
