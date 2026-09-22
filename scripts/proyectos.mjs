/* Lector y validador del formato de proyecto.
 *
 * Un proyecto es un archivo de texto en `contenido/proyectos/<identificador>.md`
 * con dos partes: unas claves arriba, entre dos lineas de `---`, y debajo el
 * caso de estudio en apartados `## Titulo`. El caso de estudio es opcional: un
 * archivo sin cuerpo publica solo su tarjeta.
 *
 * No hay dependencias: el formato es lo bastante pequeno como para leerlo aqui,
 * y anadir una libreria obligaria a tocar la spec (constitucion, principio 7).
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/* Claves que tiene que traer todo proyecto, en el orden en que se piden al
   autor cuando falta alguna. */
export const CLAVES_OBLIGATORIAS = ['titulo', 'identificador', 'descripcion', 'fecha', 'categoria', 'imagen'];
export const CLAVES_OPCIONALES = ['papel', 'estado', 'tecnologias', 'demo', 'codigo', 'destacado', 'borrador', 'alt'];
const CLAVES_LISTA = ['tecnologias'];
const CLAVES_SI_NO = ['destacado', 'borrador'];

/* Un identificador vale como trozo de URL: minusculas, numeros y guiones. Sin
   tildes ni mayusculas, que en una URL se escapan y dejan de leerse. */
const IDENTIFICADOR = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/* Una fecha es un ano (2026) o un mes (2026-03). Basta para ordenar y para
   escribirla en la tarjeta. */
const FECHA = /^(\d{4})(?:-(0[1-9]|1[0-2]))?$/;

/* Rutas que el sitio ya sirve. Un proyecto que se llamase asi se pisaria con
   ellas al publicarse en /proyectos/<identificador> o en el sitemap. */
export const RUTAS_RESERVADAS = new Set([
  'topnote', 'privacidad', 'buffet', 'proyectos', 'api', 'assets', 'index', '404', 'sitemap', 'robots',
]);

export class ErrorDeProyecto extends Error {
  constructor(archivo, mensaje) {
    super(`${archivo}: ${mensaje}`);
    this.name = 'ErrorDeProyecto';
    this.archivo = archivo;
  }
}

/* ---- lectura de un archivo ---- */

function partir(texto) {
  const lineas = texto.replace(/^﻿/, '').split(/\r?\n/);
  if (lineas[0]?.trim() !== '---') return null;
  const cierre = lineas.indexOf('---', 1);
  if (cierre === -1) return null;
  return { claves: lineas.slice(1, cierre), cuerpo: lineas.slice(cierre + 1).join('\n').trim() };
}

function leerClaves(lineas, archivo) {
  const datos = {};
  for (const [i, linea] of lineas.entries()) {
    if (!linea.trim() || linea.trimStart().startsWith('#')) continue;
    const corte = linea.indexOf(':');
    if (corte === -1) {
      throw new ErrorDeProyecto(archivo, `la linea ${i + 2} no tiene el formato "clave: valor" (${linea.trim()})`);
    }
    const clave = linea.slice(0, corte).trim().toLowerCase();
    const valor = linea.slice(corte + 1).trim();
    if (clave in datos) throw new ErrorDeProyecto(archivo, `la clave "${clave}" esta repetida`);
    if (!CLAVES_OBLIGATORIAS.includes(clave) && !CLAVES_OPCIONALES.includes(clave)) {
      throw new ErrorDeProyecto(archivo, `la clave "${clave}" no existe. Admitidas: ${[...CLAVES_OBLIGATORIAS, ...CLAVES_OPCIONALES].join(', ')}`);
    }
    datos[clave] = valor;
  }
  return datos;
}

/* El cuerpo son apartados `## Titulo` con sus parrafos. Se guardan en el orden
   en que estan escritos: es el que vera el visitante (RF-18). */
function leerApartados(cuerpo, archivo) {
  if (!cuerpo) return [];
  if (!cuerpo.startsWith('##')) {
    throw new ErrorDeProyecto(archivo, 'el caso de estudio tiene texto suelto antes del primer apartado "## Titulo"');
  }
  const apartados = [];
  for (const trozo of cuerpo.split(/^##\s+/m)) {
    const limpio = trozo.trim();
    if (!limpio) continue;
    const [titulo, ...resto] = limpio.split(/\r?\n/);
    const parrafos = resto.join('\n').trim().split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    if (parrafos.length === 0) {
      throw new ErrorDeProyecto(archivo, `el apartado "${titulo.trim()}" no tiene texto`);
    }
    apartados.push({ titulo: titulo.trim(), parrafos });
  }
  if (apartados.length === 0) {
    throw new ErrorDeProyecto(archivo, 'el caso de estudio no tiene ningun apartado "## Titulo"');
  }
  return apartados;
}

/* ---- validacion de un proyecto ---- */

function validar(proyecto, archivo, raizAssets) {
  for (const clave of CLAVES_OBLIGATORIAS) {
    /* Escrita pero sin valor y no escrita en absoluto son dos despistes
       distintos: el mensaje dice cual de los dos es. */
    if (proyecto[clave] === undefined) {
      throw new ErrorDeProyecto(archivo, `falta la clave obligatoria "${clave}"`);
    }
    if (!proyecto[clave]) {
      throw new ErrorDeProyecto(archivo, `la clave obligatoria "${clave}" esta escrita pero vacia`);
    }
  }
  if (!IDENTIFICADOR.test(proyecto.identificador)) {
    throw new ErrorDeProyecto(archivo, `el identificador "${proyecto.identificador}" solo admite minusculas sin tildes, numeros y guiones (ejemplo: top-note)`);
  }
  if (RUTAS_RESERVADAS.has(proyecto.identificador)) {
    throw new ErrorDeProyecto(archivo, `el identificador "${proyecto.identificador}" choca con una ruta que el sitio ya usa`);
  }
  if (!FECHA.test(proyecto.fecha)) {
    throw new ErrorDeProyecto(archivo, `la fecha "${proyecto.fecha}" tiene que ser un ano (2026) o un mes (2026-03)`);
  }
  if (!existsSync(join(raizAssets, proyecto.imagen))) {
    throw new ErrorDeProyecto(archivo, `la imagen "${proyecto.imagen}" no existe en ${raizAssets}/`);
  }
}

export function leerProyecto(ruta, { raizAssets, etiqueta }) {
  /* La etiqueta es lo que ve el autor cuando algo falla: la ruta tal cual la
     escribio, no una absoluta de medio metro. */
  const archivo = etiqueta ?? ruta;
  const partes = partir(readFileSync(ruta, 'utf8'));
  if (!partes) {
    throw new ErrorDeProyecto(archivo, 'faltan las claves de arriba, entre dos lineas de "---"');
  }
  const datos = leerClaves(partes.claves, archivo);
  /* Se comprueba sobre lo escrito, antes de convertirlo: despues ya seria un
     booleano y "quiza" habria pasado por un silencioso false. */
  for (const clave of CLAVES_SI_NO) {
    if (datos[clave] !== undefined && !['si', 'no'].includes(datos[clave])) {
      throw new ErrorDeProyecto(archivo, `la clave "${clave}" solo admite "si" o "no" (esta "${datos[clave]}")`);
    }
  }
  const proyecto = {
    ...datos,
    destacado: datos.destacado === 'si',
    borrador: datos.borrador === 'si',
    apartados: leerApartados(partes.cuerpo, archivo),
    archivo,
  };
  for (const clave of CLAVES_LISTA) {
    proyecto[clave] = (datos[clave] ?? '').split(',').map((v) => v.trim()).filter(Boolean);
  }
  validar(proyecto, archivo, raizAssets);
  /* Con caso de estudio tendra pagina propia (RF-11); sin el, la tarjeta
     enlazara a la demo o al codigo (RF-13, RF-14). */
  proyecto.caso = proyecto.apartados.length > 0;
  return proyecto;
}

/* ---- el conjunto ---- */

/* Destacado primero; el resto, de la fecha mas reciente a la mas antigua, y a
   igual fecha por titulo (RF-5 a RF-7). */
function ordenar(proyectos) {
  const porFecha = (a, b) => (a.fecha === b.fecha
    ? a.titulo.localeCompare(b.titulo, 'es')
    : b.fecha.localeCompare(a.fecha));
  const destacado = proyectos.filter((p) => p.destacado);
  const resto = proyectos.filter((p) => !p.destacado).sort(porFecha);
  return [...destacado, ...resto];
}

export function leerProyectos({ raizContenido = 'contenido/proyectos', raizAssets = 'assets' } = {}) {
  if (!existsSync(raizContenido)) return [];
  /* El README explica el formato a quien escribe: es documentacion de la
     carpeta, no un proyecto. */
  const archivos = readdirSync(raizContenido)
    .filter((n) => n.endsWith('.md') && n.toLowerCase() !== 'readme.md')
    .sort();
  const proyectos = archivos.map((n) => leerProyecto(join(raizContenido, n), {
    raizAssets,
    etiqueta: `${raizContenido}/${n}`,
  }));

  const vistos = new Map();
  for (const p of proyectos) {
    if (vistos.has(p.identificador)) {
      throw new ErrorDeProyecto(p.archivo, `el identificador "${p.identificador}" ya lo usa ${vistos.get(p.identificador)}`);
    }
    vistos.set(p.identificador, p.archivo);
  }

  /* Un borrador no se publica (RF-31), asi que tampoco cuenta para el limite de
     un solo destacado: se puede dejar preparado el relevo del destacado actual. */
  const publicados = proyectos.filter((p) => !p.borrador);
  const destacados = publicados.filter((p) => p.destacado);
  if (destacados.length > 1) {
    throw new ErrorDeProyecto(destacados[0].archivo, `hay ${destacados.length} proyectos destacados y solo puede haber uno: ${destacados.map((p) => p.archivo).join(', ')}`);
  }
  return ordenar(publicados);
}
