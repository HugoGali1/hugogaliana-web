#!/usr/bin/env node
/* Comando de generacion de proyectos: `npm run build:proyectos`.
 *
 * Por ahora lee y valida `contenido/proyectos/` y cuenta lo que ha encontrado.
 * Las tarjetas de la portada y las paginas de proyecto se generan en las tareas
 * T3 y T4 de la spec 001, y entran aqui.
 *
 * El comando no se llama `build` a proposito: Vercel ejecutaria un script con
 * ese nombre y el sitio se sirve estatico (ver `.vercelignore`).
 */

import { leerProyectos, ErrorDeProyecto } from './proyectos.mjs';

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
}

try {
  main();
} catch (error) {
  if (error instanceof ErrorDeProyecto) {
    console.error(`\nNo se ha generado nada. ${error.message}\n`);
    process.exit(1);
  }
  throw error;
}
