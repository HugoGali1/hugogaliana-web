/**
 * Compila topnote/src/app.jsx -> topnote/app.js
 *
 * Antes esto lo hacia el navegador: la pagina cargaba Babel standalone (2,87 MB)
 * y traducia el JSX en cada visita, antes de pintar nada. La traduccion es
 * siempre la misma, asi que se hace aqui una vez.
 *
 * El fuente legible es topnote/src/app.jsx y es lo que se edita. app.js es
 * producto: se regenera con `npm run build:topnote` y se commitea, porque el
 * despliegue es estatico y no ejecuta este script.
 *
 * Deliberadamente NO se llama "build": Vercel ejecuta solo el script que se
 * llama asi, y este sitio se sirve tal cual. Ver .vercelignore.
 */
import { transformSync } from '@babel/core';
import { minify } from 'terser';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(raiz, 'topnote', 'src', 'app.jsx');
const OUT = join(raiz, 'topnote', 'app.js');

const fuente = readFileSync(SRC, 'utf8');

/* runtime clasico: la pagina expone React como global (UMD), no hay imports */
const { code: compilado } = transformSync(fuente, {
  filename: SRC,
  presets: [['@babel/preset-react', { runtime: 'classic' }]],
  compact: false,
  babelrc: false,
  configFile: false,
});

const { code: minificado } = await minify(compilado, {
  ecma: 2020,
  compress: { passes: 2 },
  mangle: true,
  format: { comments: false },
});

writeFileSync(OUT, minificado);

const kb = (s) => (s.length / 1024).toFixed(1) + ' KB';
console.log(`jsx        ${kb(fuente)}`);
console.log(`compilado  ${kb(compilado)}`);
console.log(`servido    ${kb(minificado)}  -> topnote/app.js`);
