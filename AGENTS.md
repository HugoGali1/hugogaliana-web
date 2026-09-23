# AGENTS.md — hugogaliana.com

Guía única para cualquier agente (Claude, Codex u otro). `CLAUDE.md` solo la
importa. El reparto de roles y modelos está en `docs/flujo-agentes.md`.
Cada rol tiene allí una reserva de la otra suscripción.

## Proyecto
Web personal y portfolio de Hugo Galiana, desplegada en Vercel. Sitio
estático que se sirve tal cual: la portada (`index.html`, CSS y JS en línea),
`404.html`, `privacidad.html` y la demo de Top Note (`topnote/`). Hay una sola
función serverless, `api/recommendations/rank.js`, que re-rankea con Gemini;
la clave vive en la variable de entorno `GEMINI_API_KEY` de Vercel.

Hay dos pasos de construcción, los dos en local y con el resultado
commiteado, porque el despliegue no ejecuta ningún build:
- La demo: `topnote/src/app.jsx` es la fuente y `topnote/app.js` es producto.
- Los proyectos: cada uno es un archivo en `contenido/proyectos/`, y de ellos
  salen las tarjetas de la portada (entre las marcas `proyectos:inicio` y
  `proyectos:fin` de `index.html`), las páginas de `proyectos/` y sus entradas
  del sitemap (spec 001).

## Comandos
Desde la raíz.

- Tests: `npm test` (usa `node --test`, sin dependencias).
- Compilar la demo: `npm run build:topnote`. Solo si cambió
  `topnote/src/app.jsx`. No se llama `build` a propósito: Vercel ejecutaría
  un script con ese nombre (ver `.vercelignore`).
- Generar los proyectos: `npm run build:proyectos`. Tras añadir o cambiar un
  archivo de `contenido/proyectos/` o sus imágenes; falla nombrando el archivo
  y el dato si algo no cuadra.
- Preview: cada rama subida a GitHub genera un despliegue de preview en
  Vercel. Tiene protección de despliegue: desde la terminal, `vercel curl`
  (no `curl`, que devuelve un 302 al SSO).
- Producción: fusionar en `main`. Eso despliega.

En un worktree de Orca, `orca.yaml` instala `node_modules` al abrirlo.

## Qué leer y qué no
Leer entero solo lo que la tarea necesita. Los archivos grandes se consultan
por partes:

| Archivo | Tamaño | Cómo usarlo |
|---|---:|---|
| `docs/constitution.md` | — | Leer siempre antes de tocar código. |
| `specs/NNN-*/spec.md` y `tasks.md` | — | Leer la spec activa (la de número más alto con tareas abiertas). |
| `CONTEXTO.md` | 7 KB | Punto de retomada: estado, pendientes y decisiones abiertas. |
| `index.html` | 53 KB | **Nunca entero.** Buscar la sección con `grep -n` y leer ese tramo. El bloque entre `proyectos:inicio` y `proyectos:fin` es generado: no se edita a mano. |
| `contenido/proyectos/*.md` | — | Uno por proyecto; el formato está en `contenido/proyectos/README.md`. |
| `proyectos/` | — | Páginas generadas por `npm run build:proyectos`: no se editan a mano. |
| `topnote/src/app.jsx` | 5.100 líneas | **Nunca entero.** Por partes, localizando con `grep -n`. Leer antes la bandera `CUENTAS` en `CONTEXTO.md`. |
| `topnote/app.js` | 136 KB | Producto generado: no se lee ni se edita. |
| `topnote/data/catalog.json` | 3,4 MB | **Nunca entero.** Consultar con `node -e` o `grep`. |
| `api/recommendations/rank.js` | — | Entero si la tarea toca la API. |
| `vercel.json` | 1 KB | Cabeceras de caché y seguridad; leer antes de tocar rutas o recursos estáticos. |
| `privacidad.html` | 18 KB | Por partes; se actualiza en el mismo cambio que toque datos o analítica. |
| `assets/` | — | Binarios: no se leen. |
| `graphify-out/GRAPH_REPORT.md` | — | Para preguntas de arquitectura, antes que abrir archivos a ciegas. |

## Estilo
- Código e identificadores en inglés; contenido, comentarios, mensajes y
  documentación en español.
- Commits al estilo del repo: `tipo(ámbito): descripción` en español
  (`feat(portada): …`, `fix(api): …`, `docs: …`).
- Sin dependencias nuevas en lo que se publica sin actualizar antes la spec.

## Reglas
- No edites `topnote/app.js` a mano: se cambia `topnote/src/app.jsx` y se
  recompila.
- Todo lo que no se publica (docs, specs, agentes, tests, scripts) debe
  quedar excluido en `.vercelignore`.
- Ningún secreto en el repositorio: van a variables de entorno de Vercel. La
  clave de Web3Forms del formulario es pública por diseño.
- Dato que no puedas verificar: no se escribe. Se pregunta.
- No modifiques `specs/` salvo petición explícita.
- Las skills están duplicadas: `.agents/skills/` (Codex) y `.claude/skills/`
  (Claude). Se editan las dos a la vez; `npm test` falla si difieren.
- Una sola tarea cada vez; párate al terminarla.

## Al terminar cualquier tarea
- `npm test` en verde, y dilo en la respuesta.
- Si tocaste `topnote/src/app.jsx`: `npm run build:topnote` y revisa que
  `git diff --stat topnote/app.js` cambia solo por lo esperado.
- Si el cambio se ve en la web: comprobarlo en el preview de la rama antes de
  fusionar.
