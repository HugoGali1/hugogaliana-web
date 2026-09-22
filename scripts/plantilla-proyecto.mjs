/* Plantilla de la pagina de un proyecto con caso de estudio.
 *
 * Una sola funcion que recibe el proyecto ya leido y validado por
 * `proyectos.mjs` y devuelve el HTML completo de `/proyectos/<identificador>`.
 * El CSS va en linea, como en el resto del sitio, y reutiliza los mismos
 * tokens de color y tipografia que `index.html` (mismas variables, mismas
 * fuentes) para que la pagina no desentone con la portada.
 *
 * Todo lo que viene del contenido se escapa antes de entrar en el HTML: un
 * proyecto no es codigo de confianza, es un archivo de texto que cualquiera
 * puede escribir con datos sueltos (RF-16 a RF-18).
 */

/* Escapa los caracteres que cambiarian el HTML. Vale tanto para texto como
   para el interior de un atributo entre comillas dobles. */
function escaparHtml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* El texto de un parrafo del caso de estudio: se escapa primero y, sobre el
   texto ya escapado, se reconoce **negrita** y nada mas de lo que pudiera
   parecer formato (RF-18, "escapa siempre lo que venga del contenido"). */
function formatearParrafo(texto) {
  return escaparHtml(texto).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function ficha(proyecto) {
  const filas = [
    ['Año', proyecto.fecha],
    ['Papel', proyecto.papel],
    ['Tecnologías', proyecto.tecnologias.join(', ')],
    ['Estado', proyecto.estado],
  ].filter(([, valor]) => valor);
  return filas.map(([etiqueta, valor]) => `
      <div class="ficha-fila">
        <dt>${escaparHtml(etiqueta)}</dt>
        <dd>${escaparHtml(valor)}</dd>
      </div>`).join('');
}

function botones(proyecto) {
  const enlaces = [];
  if (proyecto.demo) enlaces.push(`<a class="btn btn-solid" href="${escaparHtml(proyecto.demo)}" target="_blank" rel="noopener">Ver demo</a>`);
  if (proyecto.codigo) enlaces.push(`<a class="btn btn-ghost" href="${escaparHtml(proyecto.codigo)}" target="_blank" rel="noopener">Ver código</a>`);
  if (enlaces.length === 0) return '';
  return `<div class="botones">${enlaces.join('')}</div>`;
}

function apartados(proyecto) {
  return proyecto.apartados.map((apartado) => `
    <section class="apartado">
      <h2>${escaparHtml(apartado.titulo)}</h2>
      ${apartado.parrafos.map((p) => `<p>${formatearParrafo(p)}</p>`).join('\n      ')}
    </section>`).join('\n');
}

/* `siguiente` es el proximo proyecto con caso de estudio, en el orden de la
   portada, o null si este es el unico (RF-20 a RF-22). */
export function generarPaginaProyecto(proyecto, { siguiente }) {
  const titulo = escaparHtml(proyecto.titulo);
  const descripcion = escaparHtml(proyecto.descripcion);
  const url = `https://hugogaliana.com/proyectos/${proyecto.identificador}`;
  const imagen = `https://hugogaliana.com/assets/${proyecto.imagen}`;
  const alt = escaparHtml(proyecto.alt || proyecto.titulo);

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo} · Hugo Galiana</title>
<meta name="description" content="${descripcion}">
<meta name="theme-color" content="#0B141A">
<meta property="og:type" content="article">
<meta property="og:title" content="${titulo} · Hugo Galiana">
<meta property="og:description" content="${descripcion}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="Hugo Galiana">
<meta property="og:locale" content="es_ES">
<meta property="og:image" content="${imagen}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:alt" content="${alt}">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${url}">
<link rel="icon" href="/assets/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=Instrument+Sans:wght@400;500&family=JetBrains+Mono:wght@400&display=swap">
<style>
/* ============ tokens (mismos que la portada) ============ */
:root{
  --canvas:#0B141A;
  --panel:#122029;
  --panel-2:#0E1A21;
  --accent:#8FD8DA;
  --accent-hover:#B0E7E6;
  --accent-muted:rgba(143,216,218,.16);
  --stone:#B7A793;
  --line:rgba(150,168,180,.18);
  --line-strong:rgba(150,168,180,.44);
  --text-secondary:#96A8B3;
  --text-primary:#EEF3F4;
  --ease:cubic-bezier(.22,.75,.25,1);
  --fd:'Sora',sans-serif;
  --fb:'Instrument Sans',sans-serif;
  --fm:'JetBrains Mono',monospace;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{overflow-x:hidden;background:var(--canvas)}
body{font-family:var(--fb);font-weight:400;color:var(--text-primary);line-height:1.6;font-size:17px}
h1,h2{font-family:var(--fd);font-weight:700;line-height:1.15;letter-spacing:-.015em}
img{max-width:100%;display:block}
a{color:var(--accent)}
a:hover{color:var(--accent-hover)}
::selection{background:var(--accent-muted);color:var(--text-primary)}
:focus-visible{outline:2px solid var(--accent);outline-offset:3px;border-radius:4px}
.skip{position:absolute;left:-9999px;top:0;background:var(--panel);color:var(--text-primary);padding:10px 16px;z-index:99;border-radius:0 0 10px 0}
.skip:focus{left:0}
.wrap{max-width:820px;margin:0 auto;padding:0 clamp(20px,4vw,48px)}
.kicker{font-family:var(--fm);font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--accent)}
/* ============ nav minima ============ */
.nav-min{padding:22px clamp(20px,4vw,48px)}
.nav-min a{display:inline-flex;align-items:center;gap:8px;text-decoration:none;color:var(--text-secondary);font-family:var(--fm);font-size:13px;letter-spacing:.06em;min-height:44px}
.nav-min a:hover{color:var(--text-primary)}
/* ============ cabecera del proyecto ============ */
.proyecto-hero{padding:24px 0 0}
.proyecto-hero h1{font-size:clamp(30px,5vw,48px);margin-top:10px}
.lede{margin-top:16px;color:var(--text-secondary);max-width:60ch;font-size:18px}
.ficha{display:flex;flex-wrap:wrap;gap:20px 40px;margin-top:32px;padding:24px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.ficha-fila dt{font-family:var(--fm);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--text-secondary)}
.ficha-fila dd{margin-top:4px;font-size:15px}
.botones{display:flex;flex-wrap:wrap;gap:14px;margin-top:28px}
.btn{background:transparent;border:0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:10px;font-family:var(--fd);font-weight:600;font-size:15.5px;padding:14px 26px;border-radius:12px;text-decoration:none;min-height:44px;transition:transform .3s var(--ease),background .3s var(--ease),color .3s var(--ease),border-color .3s var(--ease)}
.btn-solid{background:var(--accent);color:#07131A}
.btn-ghost{border:1px solid var(--line-strong);color:var(--text-primary)}
@media (hover:hover){
  .btn-solid:hover{background:var(--accent-hover);color:#07131A;transform:translateY(-2px)}
  .btn-ghost:hover{border-color:var(--accent);color:var(--accent);transform:translateY(-2px)}
}
.proyecto-img{width:100%;height:auto;border-radius:16px;margin-top:36px;border:1px solid var(--line)}
/* ============ caso de estudio ============ */
.caso{padding:48px 0}
.apartado{padding-top:36px}
.apartado:first-child{padding-top:0}
.apartado h2{font-size:clamp(22px,3vw,28px)}
.apartado p{margin-top:16px;color:var(--text-secondary);max-width:68ch}
.apartado strong{color:var(--text-primary);font-weight:600}
/* ============ navegacion entre proyectos ============ */
.proyecto-nav{display:flex;flex-wrap:wrap;justify-content:space-between;gap:16px;padding:32px 0 56px;border-top:1px solid var(--line)}
.proyecto-nav a{text-decoration:none;font-family:var(--fm);font-size:14px;color:var(--text-secondary);min-height:44px;display:inline-flex;align-items:center}
.proyecto-nav a:hover{color:var(--accent)}
/* ============ pie (igual que la portada) ============ */
.foot{border-top:1px solid var(--line);padding:30px 0 42px}
.foot-row{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;align-items:baseline;color:var(--text-secondary);font-size:14px}
.foot a{color:var(--text-secondary);text-decoration:none}
.foot a:hover{color:var(--accent)}
.mono{font-family:var(--fm)}
</style>
</head>
<body>
<a class="skip" href="#main">Ir al contenido</a>
<nav class="nav-min" aria-label="Principal">
  <a href="/">← Hugo Galiana</a>
</nav>
<main id="main">
  <header class="proyecto-hero wrap">
    <span class="kicker">${escaparHtml(proyecto.categoria)}</span>
    <h1>${titulo}</h1>
    <p class="lede">${descripcion}</p>
    <dl class="ficha">${ficha(proyecto)}
    </dl>
    ${botones(proyecto)}
    <img class="proyecto-img" src="/assets/${escaparHtml(proyecto.imagen)}" alt="${alt}" loading="eager">
  </header>
  <div class="caso wrap">${apartados(proyecto)}
  </div>
  <nav class="proyecto-nav wrap" aria-label="Otros proyectos">
    <a href="/#proyectos">← Todos los proyectos</a>${siguiente ? `
    <a href="/proyectos/${siguiente.identificador}">Siguiente: ${escaparHtml(siguiente.titulo)} →</a>` : ''}
  </nav>
</main>
<footer class="foot">
  <div class="wrap foot-row">
    <p>© 2026 Hugo Galiana Real · Valencia</p>
    <p class="mono"><a href="https://github.com/HugoGali1" target="_blank" rel="noopener">GitHub</a> · <a href="https://www.linkedin.com/in/hugo-galiana-real-8a1831329/" target="_blank" rel="noopener">LinkedIn</a></p>
    <p class="mono"><a href="https://buffet.hugogaliana.com" target="_blank" rel="noopener">Brasa y Ascuas</a> · <a href="https://aperturetechnologies.es" target="_blank" rel="noopener">Aperture</a> · <a href="https://hugogaliana.com/topnote" target="_blank" rel="noopener">Top Note</a> · <a href="/privacidad">Privacidad</a></p>
  </div>
</footer>
</body>
</html>
`;
}
