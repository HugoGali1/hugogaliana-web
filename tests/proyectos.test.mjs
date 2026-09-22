/* Pruebas del formato de proyecto (spec 001, RF-24 a RF-31 y RF-5 a RF-7).
 *
 * Cada caso escribe sus archivos en una carpeta temporal: asi se prueban los
 * fallos sin ensuciar `contenido/proyectos/`, y las pruebas no dependen de lo
 * que haya publicado en cada momento.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { leerProyectos, ErrorDeProyecto } from '../scripts/proyectos.mjs';

const VALIDO = `---
titulo: Top Note
identificador: top-note
descripcion: Buscador de perfumes en lenguaje natural.
fecha: 2026
categoria: IA
imagen: foto.jpg
tecnologias: React, Gemini
demo: https://hugogaliana.com/topnote
---

## Que es

Un buscador sobre 30.000 perfumes.

## Como funciona

El navegador filtra y el modelo ordena.
`;

/* Monta una carpeta con los archivos que pida la prueba y una imagen que si
   existe, para que solo falle lo que se esta probando. */
function taller(archivos, { imagenes = ['foto.jpg'] } = {}) {
  const raiz = mkdtempSync(join(tmpdir(), 'proyectos-'));
  const raizContenido = join(raiz, 'contenido');
  const raizAssets = join(raiz, 'assets');
  mkdirSync(raizContenido);
  mkdirSync(raizAssets);
  for (const nombre of imagenes) writeFileSync(join(raizAssets, nombre), '');
  for (const [nombre, texto] of Object.entries(archivos)) {
    writeFileSync(join(raizContenido, nombre), texto);
  }
  return {
    leer: () => leerProyectos({ raizContenido, raizAssets }),
    limpiar: () => rmSync(raiz, { recursive: true, force: true }),
  };
}

/* Comprueba que falla, que el mensaje nombra el archivo y que menciona el dato
   del que se queja: un error que no dice donde mirar no sirve de nada. */
function falla(t, archivos, { archivo, contiene, opciones }) {
  const { leer, limpiar } = taller(archivos, opciones);
  t.after(limpiar);
  /* assert.throws no devuelve el error, y aqui hace falta mirarlo por dentro. */
  let error = null;
  try {
    leer();
  } catch (e) {
    error = e;
  }
  assert.ok(error instanceof ErrorDeProyecto, `esperaba un ErrorDeProyecto y llego ${error}`);
  assert.match(error.message, new RegExp(archivo.replace('.', '\\.')));
  for (const trozo of [].concat(contiene)) assert.match(error.message, new RegExp(trozo, 'i'));
}

test('un proyecto bien escrito se lee entero', (t) => {
  const { leer, limpiar } = taller({ 'top-note.md': VALIDO });
  t.after(limpiar);
  const [proyecto] = leer();
  assert.equal(proyecto.identificador, 'top-note');
  assert.equal(proyecto.titulo, 'Top Note');
  assert.deepEqual(proyecto.tecnologias, ['React', 'Gemini']);
  assert.equal(proyecto.caso, true);
  assert.deepEqual(proyecto.apartados.map((a) => a.titulo), ['Que es', 'Como funciona']);
  assert.equal(proyecto.destacado, false);
});

test('un proyecto sin caso de estudio se publica solo como tarjeta', (t) => {
  const { leer, limpiar } = taller({ 'solo-tarjeta.md': VALIDO.split('\n## ')[0] });
  t.after(limpiar);
  const [proyecto] = leer();
  assert.equal(proyecto.caso, false);
  assert.deepEqual(proyecto.apartados, []);
});

test('RF-26: falta un dato obligatorio', (t) => {
  falla(t, { 'sin-fecha.md': VALIDO.replace('fecha: 2026\n', '') }, {
    archivo: 'sin-fecha.md',
    contiene: ['falta', 'fecha'],
  });
});

test('RF-27: dos proyectos con el mismo identificador', (t) => {
  falla(t, { 'uno.md': VALIDO, 'dos.md': VALIDO.replace('titulo: Top Note', 'titulo: Otro') }, {
    archivo: 'dos.md',
    contiene: ['top-note', 'uno\\.md'],
  });
});

test('RF-28: mas de un proyecto destacado', (t) => {
  const destacado = VALIDO.replace('categoria: IA', 'categoria: IA\ndestacado: si');
  falla(t, {
    'uno.md': destacado,
    'dos.md': destacado.replace('identificador: top-note', 'identificador: otro'),
  }, {
    archivo: 'uno.md',
    contiene: ['destacado', 'dos\\.md'],
  });
});

test('RF-29: la imagen no existe', (t) => {
  falla(t, { 'sin-imagen.md': VALIDO.replace('imagen: foto.jpg', 'imagen: no-esta.jpg') }, {
    archivo: 'sin-imagen.md',
    contiene: ['no-esta\\.jpg', 'no existe'],
  });
});

test('RF-30: el identificador choca con una ruta del sitio', (t) => {
  falla(t, { 'topnote.md': VALIDO.replace('identificador: top-note', 'identificador: topnote') }, {
    archivo: 'topnote.md',
    contiene: ['topnote', 'ruta'],
  });
});

test('el identificador no admite mayusculas, tildes ni espacios', (t) => {
  falla(t, { 'malo.md': VALIDO.replace('identificador: top-note', 'identificador: Top Nóte') }, {
    archivo: 'malo.md',
    contiene: ['identificador', 'minusculas'],
  });
});

test('una clave obligatoria escrita pero vacia lo dice asi', (t) => {
  falla(t, { 'vacia.md': VALIDO.replace('titulo: Top Note', 'titulo:') }, {
    archivo: 'vacia.md',
    contiene: ['titulo', 'vacia'],
  });
});

test('una clave repetida no pasa', (t) => {
  falla(t, { 'repe.md': VALIDO.replace('fecha: 2026', 'fecha: 2026\nfecha: 2025') }, {
    archivo: 'repe.md',
    contiene: ['fecha', 'repetida'],
  });
});

/* El repo se edita en Windows: un archivo guardado ahi llega con CRLF y tiene
   que leerse igual que uno con LF. */
test('los finales de linea de Windows se leen igual', (t) => {
  const { leer, limpiar } = taller({ 'crlf.md': VALIDO.replace(/\n/g, '\r\n') });
  t.after(limpiar);
  const [proyecto] = leer();
  assert.equal(proyecto.titulo, 'Top Note');
  assert.deepEqual(proyecto.apartados.map((a) => a.titulo), ['Que es', 'Como funciona']);
  assert.deepEqual(proyecto.tecnologias, ['React', 'Gemini']);
});

test('los acentos del contenido sobreviven', (t) => {
  const { leer, limpiar } = taller({
    'tildes.md': VALIDO.replace('descripcion: Buscador de perfumes en lenguaje natural.',
      'descripcion: Búsqueda por descripción, con razón de cada elección.'),
  });
  t.after(limpiar);
  assert.equal(leer()[0].descripcion, 'Búsqueda por descripción, con razón de cada elección.');
});

test('RF-31: un borrador no se publica', (t) => {
  const { leer, limpiar } = taller({
    'top-note.md': VALIDO,
    'a-medias.md': VALIDO
      .replace('identificador: top-note', 'identificador: a-medias')
      .replace('categoria: IA', 'categoria: IA\nborrador: si'),
  });
  t.after(limpiar);
  assert.deepEqual(leer().map((p) => p.identificador), ['top-note']);
});

test('un apartado sin texto no pasa', (t) => {
  falla(t, { 'vacio.md': `${VALIDO}\n## Que mejoraria\n` }, {
    archivo: 'vacio.md',
    contiene: ['Que mejoraria', 'no tiene texto'],
  });
});

test('RF-5 a RF-7: destacado primero, luego por fecha y a igual fecha por titulo', (t) => {
  const proyecto = (id, { titulo = id, fecha = '2026', destacado = false } = {}) => VALIDO
    .replace('titulo: Top Note', `titulo: ${titulo}`)
    .replace('identificador: top-note', `identificador: ${id}`)
    .replace('fecha: 2026', `fecha: ${fecha}`)
    .replace('categoria: IA', destacado ? 'categoria: IA\ndestacado: si' : 'categoria: IA');

  const { leer, limpiar } = taller({
    'viejo.md': proyecto('viejo', { fecha: '2024' }),
    'zeta.md': proyecto('zeta', { titulo: 'Zeta', fecha: '2026-03' }),
    'alfa.md': proyecto('alfa', { titulo: 'Alfa', fecha: '2026-03' }),
    'estrella.md': proyecto('estrella', { fecha: '2023', destacado: true }),
  });
  t.after(limpiar);
  assert.deepEqual(leer().map((p) => p.identificador), ['estrella', 'alfa', 'zeta', 'viejo']);
});

test('una carpeta sin proyectos no es un error', (t) => {
  const { leer, limpiar } = taller({});
  t.after(limpiar);
  assert.deepEqual(leer(), []);
});
