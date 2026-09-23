/* Pruebas de las paginas de proyecto (spec 001, T3: RF-11, RF-16 a RF-23,
 * RF-47, RF-48).
 *
 * Se prueban dos capas por separado: `generarPaginaProyecto` (la plantilla,
 * pura: recibe un proyecto y devuelve HTML) con proyectos de prueba escritos
 * a mano, y `generarPaginas` / `actualizarSitemap` (la escritura a disco) con
 * una carpeta temporal, igual que hace `tests/proyectos.test.mjs` con
 * `leerProyectos`.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { generarPaginaProyecto } from '../scripts/plantilla-proyecto.mjs';
import { generarPaginas, actualizarSitemap } from '../scripts/build-proyectos.mjs';

/* Un proyecto minimo, con lo que `leerProyecto` habria puesto en el objeto
   tras leer y validar un archivo. Cada prueba sobreescribe lo que necesita. */
function proyecto(datos = {}) {
  return {
    titulo: 'Proyecto de prueba',
    identificador: 'proyecto-de-prueba',
    descripcion: 'Una descripcion de prueba.',
    fecha: '2026',
    categoria: 'Web',
    imagen: 'shot.jpg',
    alt: '',
    papel: 'Diseño y desarrollo',
    estado: 'Demo pública',
    tecnologias: ['React'],
    demo: '',
    codigo: '',
    destacado: false,
    borrador: false,
    apartados: [{ titulo: 'Qué es', parrafos: ['Un párrafo cualquiera.'] }],
    caso: true,
    archivo: 'proyecto-de-prueba.md',
    ...datos,
  };
}

/* ---- la plantilla ---- */

test('el contenido con <, & o comillas sale escapado', (t) => {
  const p = proyecto({
    titulo: 'A & B <script>',
    descripcion: 'Con "comillas" y <etiquetas>',
    apartados: [{ titulo: 'Título', parrafos: ['Texto con <b>html</b> y & sueltos, y "comillas".'] }],
  });
  const html = generarPaginaProyecto(p, { siguiente: null });
  assert.ok(!html.includes('<script>'), 'el <script> del titulo no debe llegar sin escapar');
  assert.ok(!html.includes('<b>html</b>'), 'el <b> del parrafo no debe llegar sin escapar');
  assert.ok(html.includes('A &amp; B &lt;script&gt;'));
  assert.ok(html.includes('&lt;etiquetas&gt;'));
  assert.ok(html.includes('Texto con &lt;b&gt;html&lt;/b&gt; y &amp; sueltos, y &quot;comillas&quot;.'));
});

test('la negrita **asi** se reconoce y nada mas', (t) => {
  const p = proyecto({
    apartados: [{ titulo: 'Título', parrafos: ['Un **dato importante** y ni _cursiva_ ni `código`.'] }],
  });
  const html = generarPaginaProyecto(p, { siguiente: null });
  assert.ok(html.includes('Un <strong>dato importante</strong> y ni _cursiva_ ni `código`.'));
});

test('RF-18: un parrafo que empieza en negrita sale como punto con titular, escapado', (t) => {
  const p = proyecto({
    apartados: [{ titulo: 'Problemas', parrafos: [
      'Intro normal.',
      '**Uno <b>.</b>** Explicación del uno.',
      '**Dos.** Con **otra** negrita dentro.',
      'Cierre normal.',
    ] }],
  });
  const html = generarPaginaProyecto(p, { siguiente: null });
  const puntos = html.match(/<div class="puntos">[\s\S]*?\n      <\/div>/g) || [];
  assert.equal(puntos.length, 1, 'los dos puntos seguidos van en una sola lista');
  assert.match(puntos[0], /<h3>Uno &lt;b&gt;\.&lt;\/b&gt;<\/h3>\s*<p>Explicación del uno\.<\/p>/);
  assert.match(puntos[0], /<h3>Dos\.<\/h3>\s*<p>Con <strong>otra<\/strong> negrita dentro\.<\/p>/);
  assert.ok(html.indexOf('<p>Intro normal.</p>') < html.indexOf('class="puntos"'));
  assert.ok(html.indexOf('<p>Cierre normal.</p>') > html.indexOf('class="puntos"'));
});

test('RF-18: los apartados salen numerados, en orden y con un indice que enlaza a cada uno', (t) => {
  const p = proyecto({
    apartados: [
      { titulo: 'Qué es', parrafos: ['A.'] },
      { titulo: 'Cómo funciona', parrafos: ['B.'] },
      { titulo: 'Qué es', parrafos: ['C.'] },
    ],
  });
  const html = generarPaginaProyecto(p, { siguiente: null });
  const ids = [...html.matchAll(/<section class="apartado" id="([^"]+)">\s*<span class="apartado-n">(\d\d)<\/span>/g)].map((m) => [m[1], m[2]]);
  assert.deepEqual(ids, [['que-es', '01'], ['como-funciona', '02'], ['que-es-3', '03']]);
  const indice = [...html.matchAll(/<li><a href="#([^"]+)">/g)].map((m) => m[1]);
  assert.deepEqual(indice, ['que-es', 'como-funciona', 'que-es-3']);
  /* con un solo apartado no hay indice */
  const uno = generarPaginaProyecto(proyecto(), { siguiente: null });
  assert.doesNotMatch(uno, /class="indice"/);
});

test('el relleno lateral de .wrap no lo pisa ningun padding abreviado', (t) => {
  const html = generarPaginaProyecto(proyecto(), { siguiente: null });
  const css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
  for (const clase of ['proyecto-hero', 'caso', 'proyecto-nav']) {
    const regla = css.match(new RegExp(`\\.${clase}\\{([^}]*)\\}`));
    assert.ok(regla, `falta la regla de .${clase}`);
    assert.doesNotMatch(regla[1], /(^|;)padding:/, `.${clase} usa padding abreviado`);
  }
});

test('RF-17: los botones de demo y codigo salen solo si el proyecto los tiene', (t) => {
  const conAmbos = generarPaginaProyecto(proyecto({ demo: 'https://demo.test', codigo: 'https://codigo.test' }), { siguiente: null });
  assert.match(conAmbos, /Ver demo/);
  assert.match(conAmbos, /Ver código/);

  /* Aperture Technologies hoy: demo si, codigo no (repositorio privado). */
  const soloDemo = generarPaginaProyecto(proyecto({ demo: 'https://aperturetechnologies.es', codigo: '' }), { siguiente: null });
  assert.match(soloDemo, /Ver demo/);
  assert.doesNotMatch(soloDemo, /Ver código/);

  const ninguno = generarPaginaProyecto(proyecto({ demo: '', codigo: '' }), { siguiente: null });
  assert.doesNotMatch(ninguno, /class="botones"/);
});

test('RF-20 a RF-22: el enlace "siguiente" solo sale si se le pasa uno', (t) => {
  const conSiguiente = generarPaginaProyecto(proyecto(), { siguiente: proyecto({ titulo: 'Otro', identificador: 'otro' }) });
  assert.match(conSiguiente, /Siguiente: Otro/);
  assert.match(conSiguiente, /href="\/proyectos\/otro"/);

  const sinSiguiente = generarPaginaProyecto(proyecto(), { siguiente: null });
  assert.doesNotMatch(sinSiguiente, /Siguiente:/);
  /* pero el enlace a todos los proyectos (RF-19) sigue ahi */
  assert.match(sinSiguiente, /Todos los proyectos/);
});

/* ---- la escritura a disco ---- */

/* Monta una carpeta temporal con su propio `proyectos/` y `sitemap.xml`, como
   los tendria el repositorio, para no tocar los de verdad. */
function taller() {
  const raiz = mkdtempSync(join(tmpdir(), 'paginas-proyecto-'));
  const dirProyectos = join(raiz, 'proyectos');
  const rutaSitemap = join(raiz, 'sitemap.xml');
  writeFileSync(rutaSitemap, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hugogaliana.com/</loc>
    <lastmod>2026-09-15</lastmod>
  </url>
  <url>
    <loc>https://hugogaliana.com/topnote</loc>
    <lastmod>2026-09-15</lastmod>
  </url>
  <url>
    <loc>https://hugogaliana.com/privacidad</loc>
    <lastmod>2026-09-15</lastmod>
  </url>
</urlset>
`);
  return { dirProyectos, rutaSitemap, limpiar: () => rmSync(raiz, { recursive: true, force: true }) };
}

test('un proyecto sin caso de estudio no genera pagina', (t) => {
  const { dirProyectos, limpiar } = taller();
  t.after(limpiar);
  /* Simula lo que hace `main`: solo pasan a `generarPaginas` los proyectos
     con caso; uno sin caso (`caso: false`, sin apartados) queda fuera. */
  const conCaso = [proyecto(), proyecto({ identificador: 'sin-caso', caso: false, apartados: [] })]
    .filter((p) => p.caso);
  generarPaginas(conCaso, { dirProyectos });
  assert.deepEqual(readdirSync(dirProyectos), ['proyecto-de-prueba.html']);
});

test('RF-20, RF-21: el enlace "siguiente" recorre los proyectos en circulo', (t) => {
  const { dirProyectos, limpiar } = taller();
  t.after(limpiar);
  const tres = ['uno', 'dos', 'tres'].map((id) => proyecto({ identificador: id, titulo: id }));
  generarPaginas(tres, { dirProyectos });
  const siguienteDe = (id) => {
    const html = readFileSync(join(dirProyectos, `${id}.html`), 'utf8');
    return html.match(/href="\/proyectos\/([^"]+)">Siguiente/)[1];
  };
  assert.equal(siguienteDe('uno'), 'dos');
  assert.equal(siguienteDe('dos'), 'tres');
  assert.equal(siguienteDe('tres'), 'uno');
});

test('RF-22: con un solo proyecto con caso no hay enlace "siguiente"', (t) => {
  const { dirProyectos, limpiar } = taller();
  t.after(limpiar);
  generarPaginas([proyecto({ identificador: 'unico' })], { dirProyectos });
  const html = readFileSync(join(dirProyectos, 'unico.html'), 'utf8');
  assert.doesNotMatch(html, /Siguiente:/);
});

test('generarPaginas borra la pagina de un proyecto que ya no tiene caso', (t) => {
  const { dirProyectos, limpiar } = taller();
  t.after(limpiar);
  mkdirSync(dirProyectos, { recursive: true });
  writeFileSync(join(dirProyectos, 'huerfano.html'), 'restos de una tanda anterior');
  generarPaginas([proyecto()], { dirProyectos });
  assert.deepEqual(readdirSync(dirProyectos), ['proyecto-de-prueba.html']);
});

test('RF-48: el sitemap conserva las tres rutas de siempre y anade las de proyecto', (t) => {
  const { rutaSitemap, limpiar } = taller();
  t.after(limpiar);
  const conCaso = ['top-note', 'brasa-y-ascuas'].map((id) => proyecto({ identificador: id }));
  actualizarSitemap(conCaso, { rutaSitemap });
  const xml = readFileSync(rutaSitemap, 'utf8');
  for (const loc of [
    'https://hugogaliana.com/',
    'https://hugogaliana.com/topnote',
    'https://hugogaliana.com/privacidad',
    'https://hugogaliana.com/proyectos/top-note',
    'https://hugogaliana.com/proyectos/brasa-y-ascuas',
  ]) {
    assert.ok(xml.includes(`<loc>${loc}</loc>`), `falta ${loc} en el sitemap`);
  }
});

test('actualizarSitemap no deja entradas de proyecto duplicadas al repetirse', (t) => {
  const { rutaSitemap, limpiar } = taller();
  t.after(limpiar);
  actualizarSitemap([proyecto({ identificador: 'top-note' })], { rutaSitemap });
  actualizarSitemap([proyecto({ identificador: 'top-note' }), proyecto({ identificador: 'otro' })], { rutaSitemap });
  const xml = readFileSync(rutaSitemap, 'utf8');
  const veces = xml.split('proyectos/top-note').length - 1;
  assert.equal(veces, 1);
  assert.ok(xml.includes('proyectos/otro'));
});
