/* Pruebas del bloque de tarjetas de la portada (spec 001, T4: RF-2 a RF-8,
 * RF-12 a RF-15).
 *
 * Igual que `tests/proyectos.test.mjs` y `tests/paginas-proyecto.test.mjs`:
 * cada caso trabaja en una carpeta temporal, para no tocar ni
 * `contenido/proyectos/` ni el `index.html` de verdad.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { leerProyectos } from '../scripts/proyectos.mjs';
import { generarBloqueProyectos, medidasImagen } from '../scripts/plantilla-portada.mjs';
import { actualizarIndex } from '../scripts/build-proyectos.mjs';

/* Un PNG de 1x1 valido: basta para que `medidasImagen` tenga una cabecera
   real que leer, sin depender de las imagenes de `assets/`. */
const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

/* Un proyecto minimo, con lo que `leerProyecto` habria puesto en el objeto
   tras leer y validar un archivo (mismo patron que en
   `tests/paginas-proyecto.test.mjs`). */
function proyecto(datos = {}) {
  return {
    titulo: 'Proyecto de prueba',
    identificador: 'proyecto-de-prueba',
    descripcion: 'Una descripcion de prueba.',
    fecha: '2026',
    categoria: 'Web',
    imagen: 'pixel.png',
    alt: '',
    papel: 'Diseño y desarrollo',
    estado: 'Demo pública',
    tecnologias: [],
    demo: '',
    codigo: '',
    destacado: false,
    borrador: false,
    apartados: [],
    caso: false,
    archivo: 'proyecto-de-prueba.md',
    ...datos,
  };
}

/* Monta una carpeta temporal con una imagen valida en `assets/`, para que
   `generarBloqueProyectos` pueda leer sus medidas. */
function tallerAssets() {
  const raiz = mkdtempSync(join(tmpdir(), 'portada-'));
  writeFileSync(join(raiz, 'pixel.png'), PIXEL_PNG);
  return { raizAssets: raiz, limpiar: () => rmSync(raiz, { recursive: true, force: true }) };
}

/* ---- medidasImagen ---- */

test('medidasImagen lee el ancho y el alto reales de un PNG', (t) => {
  const { raizAssets, limpiar } = tallerAssets();
  t.after(limpiar);
  assert.deepEqual(medidasImagen(join(raizAssets, 'pixel.png')), { ancho: 1, alto: 1 });
});

test('medidasImagen lee las medidas reales de las imagenes de proyecto ya publicadas', (t) => {
  /* Las mismas medidas que ya llevaba el HTML escrito a mano: si alguien
     cambia la imagen, la tarjeta debe seguir el archivo, no un numero
     inventado. */
  assert.deepEqual(medidasImagen('assets/shot-topnote.jpg'), { ancho: 1600, alto: 800 });
  assert.deepEqual(medidasImagen('assets/shot-aperture.jpg'), { ancho: 1400, alto: 700 });
});

/* ---- generarBloqueProyectos ---- */

test('RF-2, RF-8: una tarjeta por proyecto publicado, y el numero total en el bloque', (t) => {
  const { raizAssets, limpiar } = tallerAssets();
  t.after(limpiar);
  const tres = ['uno', 'dos', 'tres'].map((id) => proyecto({ identificador: id, titulo: id }));
  const html = generarBloqueProyectos(tres, { raizAssets });
  assert.equal((html.match(/<article class="proj-card/g) || []).length, 3);
  assert.match(html, /3 proyectos publicados/);
  for (const id of ['uno', 'dos', 'tres']) assert.match(html, new RegExp(`>${id}<`));
});

test('un borrador no llega a generarBloqueProyectos porque leerProyectos ya lo ha quitado', (t) => {
  const raiz = mkdtempSync(join(tmpdir(), 'portada-borrador-'));
  t.after(() => rmSync(raiz, { recursive: true, force: true }));
  const raizContenido = join(raiz, 'contenido');
  const raizAssets = join(raiz, 'assets');
  mkdirSync(raizContenido);
  mkdirSync(raizAssets);
  writeFileSync(join(raizAssets, 'foto.jpg'), '');
  writeFileSync(join(raizAssets, 'pixel.png'), PIXEL_PNG);
  writeFileSync(join(raizContenido, 'publicado.md'), `---
titulo: Publicado
identificador: publicado
descripcion: Un proyecto publicado.
fecha: 2026
categoria: Web
imagen: pixel.png
---
`);
  writeFileSync(join(raizContenido, 'sin-publicar.md'), `---
titulo: Sin publicar
identificador: sin-publicar
descripcion: Un borrador.
fecha: 2026
categoria: Web
imagen: pixel.png
borrador: si
---
`);
  const proyectos = leerProyectos({ raizContenido, raizAssets });
  assert.deepEqual(proyectos.map((p) => p.identificador), ['publicado']);
  const html = generarBloqueProyectos(proyectos, { raizAssets });
  assert.equal((html.match(/<article class="proj-card/g) || []).length, 1);
  assert.doesNotMatch(html, /Sin publicar/);
});

test('RF-5: el proyecto destacado sale primero y con su propia clase', (t) => {
  const { raizAssets, limpiar } = tallerAssets();
  t.after(limpiar);
  /* Se pasan en el orden que ya devolveria `leerProyectos` (destacado
     primero); esta funcion no reordena, solo pinta. */
  const conDestacado = [
    proyecto({ identificador: 'el-destacado', titulo: 'El destacado', destacado: true }),
    proyecto({ identificador: 'otro', titulo: 'Otro' }),
  ];
  const html = generarBloqueProyectos(conDestacado, { raizAssets });
  const posDestacado = html.indexOf('el-destacado');
  const posOtro = html.indexOf('>Otro<');
  assert.ok(posDestacado < posOtro, 'el destacado debe salir antes que el resto');
  assert.match(html, /proj-card proj-card--destacado part/);
});

test('RF-12 a RF-15: el enlace de la tarjeta sigue caso > demo > codigo > ninguno', (t) => {
  const { raizAssets, limpiar } = tallerAssets();
  t.after(limpiar);

  const conCaso = generarBloqueProyectos([proyecto({ caso: true, demo: 'https://demo.test', codigo: 'https://codigo.test' })], { raizAssets });
  assert.match(conCaso, /<a class="proj-card-link" href="\/proyectos\/proyecto-de-prueba">/);

  const soloDemo = generarBloqueProyectos([proyecto({ caso: false, demo: 'https://demo.test', codigo: 'https://codigo.test' })], { raizAssets });
  assert.match(soloDemo, /<a class="proj-card-link" href="https:\/\/demo\.test" target="_blank" rel="noopener">/);

  const soloCodigo = generarBloqueProyectos([proyecto({ caso: false, demo: '', codigo: 'https://codigo.test' })], { raizAssets });
  assert.match(soloCodigo, /<a class="proj-card-link" href="https:\/\/codigo\.test" target="_blank" rel="noopener">/);

  const ninguno = generarBloqueProyectos([proyecto({ caso: false, demo: '', codigo: '' })], { raizAssets });
  assert.doesNotMatch(ninguno, /<a class="proj-card-link"/);
  assert.match(ninguno, /<div class="proj-card-link">/);
});

test('RF-4: las tecnologias solo salen si el proyecto las declara', (t) => {
  const { raizAssets, limpiar } = tallerAssets();
  t.after(limpiar);
  const conTecnologias = generarBloqueProyectos([proyecto({ tecnologias: ['React', 'Vercel'] })], { raizAssets });
  assert.match(conTecnologias, /<li class="chip">React<\/li><li class="chip">Vercel<\/li>/);

  const sinTecnologias = generarBloqueProyectos([proyecto({ tecnologias: [] })], { raizAssets });
  assert.doesNotMatch(sinTecnologias, /class="chips"/);
});

test('el contenido con <, & o comillas sale escapado', (t) => {
  const { raizAssets, limpiar } = tallerAssets();
  t.after(limpiar);
  const html = generarBloqueProyectos([proyecto({
    titulo: 'A & B <script>',
    descripcion: 'Con "comillas" y <etiquetas>',
    tecnologias: ['<b>x</b>'],
  })], { raizAssets });
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<b>x</b>'));
  assert.match(html, /A &amp; B &lt;script&gt;/);
  assert.match(html, /&lt;etiquetas&gt;/);
});

/* ---- actualizarIndex ---- */

function tallerIndex(contenidoInicial) {
  const raiz = mkdtempSync(join(tmpdir(), 'index-'));
  const rutaIndex = join(raiz, 'index.html');
  writeFileSync(rutaIndex, contenidoInicial);
  writeFileSync(join(raiz, 'pixel.png'), PIXEL_PNG);
  return { rutaIndex, raizAssets: raiz, limpiar: () => rmSync(raiz, { recursive: true, force: true }) };
}

const INDEX_CON_MARCAS = `<section id="proyectos">
    <!-- proyectos:inicio -->
    <!-- proyectos:fin -->
</section>`;

test('actualizarIndex sustituye el bloque entre las marcas', (t) => {
  const { rutaIndex, raizAssets, limpiar } = tallerIndex(INDEX_CON_MARCAS);
  t.after(limpiar);
  actualizarIndex([proyecto()], { rutaIndex, raizAssets });
  const html = readFileSync(rutaIndex, 'utf8');
  assert.match(html, /class="proj-card/);
  assert.equal((html.match(/<!-- proyectos:inicio -->/g) || []).length, 1);
  assert.equal((html.match(/<!-- proyectos:fin -->/g) || []).length, 1);
});

test('si faltan las marcas, el comando falla nombrandolas y no toca el archivo', (t) => {
  const { rutaIndex, raizAssets, limpiar } = tallerIndex('<section id="proyectos"></section>');
  t.after(limpiar);
  const original = readFileSync(rutaIndex, 'utf8');
  assert.throws(
    () => actualizarIndex([proyecto()], { rutaIndex, raizAssets }),
    /proyectos:inicio.*proyectos:fin/s,
  );
  assert.equal(readFileSync(rutaIndex, 'utf8'), original);
});

test('ejecutar actualizarIndex dos veces deja el mismo HTML, sin duplicar el bloque', (t) => {
  const { rutaIndex, raizAssets, limpiar } = tallerIndex(INDEX_CON_MARCAS);
  t.after(limpiar);
  actualizarIndex([proyecto(), proyecto({ identificador: 'otro', titulo: 'Otro' })], { rutaIndex, raizAssets });
  const primero = readFileSync(rutaIndex, 'utf8');
  actualizarIndex([proyecto(), proyecto({ identificador: 'otro', titulo: 'Otro' })], { rutaIndex, raizAssets });
  const segundo = readFileSync(rutaIndex, 'utf8');
  assert.equal(primero, segundo);
  assert.equal((segundo.match(/<!-- proyectos:inicio -->/g) || []).length, 1);
  assert.equal((segundo.match(/<article class="proj-card/g) || []).length, 2);
});
