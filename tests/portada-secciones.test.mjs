/* Pruebas de las secciones de la portada (spec 001, T5: RF-1, RF-9, RF-10,
 * RF-44, RF-46; T6: RF-32 a RF-37; T7: RF-38 a RF-43, RF-45).
 *
 * A diferencia de `tests/portada.test.mjs`, que prueba el generador de la
 * lista de proyectos con datos de prueba, aqui se lee el `index.html` de
 * verdad: lo que se comprueba es lo que se publica. Sin analizador de HTML,
 * que seria una dependencia nueva; bastan expresiones regulares acotadas a
 * cada seccion.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
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
  const hero = tramo(/<div class="hero-text">/, 'header');
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

/* Hero (T6: RF-32 a RF-37 y el peso del bucle). Lo que depende del
   dispositivo --que no haya tirones, que el movil no descargue nada de mas--
   se comprueba en el preview; aqui, lo que se puede leer en los archivos. */
const MOBILE = '(pointer:coarse),(max-width:900px)';

test('RF-32: el bucle del móvil existe y pesa 1 MB o menos', () => {
  const bucle = join(raiz, 'assets', 'hero-loop.mp4');
  assert.ok(existsSync(bucle), 'falta assets/hero-loop.mp4');
  assert.ok(statSync(bucle).size <= 1024 * 1024, `pesa ${statSync(bucle).size} bytes`);
  assert.ok(html.includes(`matchMedia('${MOBILE}')`), 'el script no usa la condición de móvil de la spec');
  assert.match(html, /video\.loop=true/);
});

test('RF-33: la secuencia de fotogramas ya no existe y el móvil tiene su propia imagen de fondo', () => {
  assert.ok(!existsSync(join(raiz, 'assets', 'seq')), 'sigue la carpeta assets/seq');
  assert.doesNotMatch(html, /assets\/seq\//);
  const movil = tramo(new RegExp(`@media ${MOBILE.replace(/[()]/g, '\\$&')}\\{`), 'style');
  assert.match(movil, /background-image:url\('assets\/hero-loop\.webp'\)/);
});

test('RF-34: el hero de escritorio ocupa como mucho 2 pantallas', () => {
  const alturas = [...html.matchAll(/\.hero\{height:(\d+)(?:vh|svh|lvh)\}/g)].map((m) => Number(m[1]));
  assert.ok(alturas.length > 0, 'no se encuentra la altura del hero');
  for (const altura of alturas) assert.ok(altura <= 200, `el hero mide ${altura}vh`);
});

test('RF-35 a RF-37: con movimiento reducido o ahorro de datos, imagen fija; sin vídeo, también', () => {
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)\{[^}]*\{[^}]*\}\s*\.stage\{[^}]*\}\s*\.stage video\{display:none\}/);
  assert.match(html, /navigator\.connection;if\(\(c&&c\.saveData\)/);
  assert.match(html, /\.hero-still \.stage video\{display:none\}/);
  /* la imagen fija es el fondo del escenario: esta ahi antes de que el video llegue */
  assert.match(html, /\.stage\{[^}]*url\('assets\/hero-poster\.jpg'\)/);
  assert.match(html, /\.stage video\{[^}]*opacity:0/);
});

/* Contacto y navegacion de movil (T7: RF-38 a RF-43, RF-45). El envio real se
   prueba en el preview; aqui, la estructura y las reglas del script. */
test('RF-38: el formulario tiene tres campos obligatorios, nombre, correo y mensaje', () => {
  const form = tramo(/<form class="cform/, 'form');
  const campos = [...form.matchAll(/<(input|textarea)\b[^>]*\bid="(f-[a-z]+)"[^>]*>/g)].map((m) => [m[2], /\brequired\b/.test(m[0])]);
  assert.deepEqual(campos, [['f-name', true], ['f-mail', true], ['f-msg', true], ['f-legal', true]]);
  assert.doesNotMatch(html, /f-tel|name="phone"|phone:/, 'queda el teléfono');
});

test('RF-39: junto al formulario, el correo, GitHub y LinkedIn', () => {
  const contacto = tramo(/<section [^>]*id="contacto"/, 'section');
  assert.match(contacto, /<a href="mailto:hgalianareal@gmail\.com">hgalianareal@gmail\.com<\/a>/);
  assert.match(contacto, /<a href="https:\/\/github\.com\/HugoGali1"/);
  assert.match(contacto, /<a href="https:\/\/www\.linkedin\.com\/in\/hugo-galiana-real-8a1831329\/"/);
});

test('RF-40 a RF-43: casilla de privacidad, éxito solo confirmado, error sin borrar y campo señalado', () => {
  assert.match(html, /if\(fLegal&&!fLegal\.checked\)return fieldError\(fLegal,/);
  /* el unico camino a la confirmacion es la respuesta success:true de la API */
  assert.equal((html.match(/markDelivered\(\)/g) || []).length, 2, 'markDelivered se define y se llama una sola vez');
  assert.match(html, /if\(res\.status===200&&d\.success===true\)return markDelivered\(\);/);
  /* nada vacia los campos */
  assert.doesNotMatch(html, /cform\.reset\(\)|\.value=''/);
  assert.match(html, /function fieldError\(el,t\)\{[^}]*setAttribute\('aria-invalid','true'\)/);
  assert.match(html, /if\(!isMail\(m\)\)return fieldError\(fMail,/);
});

test('RF-45: hasta 900 px el menú va en un panel que abre un botón y cierra Escape', () => {
  assert.match(html, /<button class="nav-toggle" id="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-menu"/);
  assert.match(html, /@media \(max-width:900px\)\{\s*\.nav\{align-items:center\}\s*\.nav-toggle\{display:inline-flex\}/);
  assert.match(html, /matchMedia\('\(min-width:901px\)'\)/);
  assert.match(html, /e\.key==='Escape'&&menuVisible\(\)\)\{menu\(false\);navToggle\.focus\(\)\}/);
});

test('principio 5: la política de privacidad ya no habla del teléfono', () => {
  const privacidad = readFileSync(join(raiz, 'privacidad.html'), 'utf8');
  assert.doesNotMatch(privacidad, /tel[eé]fono/i);
});

test('la página 404 no enlaza a secciones que ya no existen', () => {
  const pagina404 = readFileSync(join(raiz, '404.html'), 'utf8');
  for (const [, ancla] of pagina404.matchAll(/href="\/#([^"]+)"/g)) {
    assert.match(html, new RegExp(`id="${ancla}"`), `la 404 enlaza a /#${ancla}`);
  }
});
