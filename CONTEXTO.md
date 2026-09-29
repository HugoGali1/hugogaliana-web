# Contexto de trabajo — hugogaliana.com

Ultima sesion: **29 de septiembre de 2026**.
Estado: **`main` en produccion y al dia con la rama `nueva-base`.** Spec 003
(PiezaxPieza en el portfolio) cerrada y publicada: T1 a T4 y los cuatro
criterios de cierre. Sin trabajo a medias.

> Este fichero es una nota de trabajo, no forma parte del sitio.
> Esta excluido en `.vercelignore`. Es el punto de retomada para cualquier
> agente (Claude o Codex): mantenlo al dia al cerrar cada sesion.

---

## 1. Lo primero al volver

```bash
git fetch origin && git status          # nueva-base y main deben coincidir
npm test                                 # debe estar en verde
```

- Flujo de trabajo: `AGENTS.md`, `docs/constitution.md` y
  `docs/flujo-agentes.md`. Cambio nuevo = spec con entrevista y aprobacion,
  una tarea cada vez, implementador y validador distintos.
- Produccion es `main`: se publica con avance rapido desde `nueva-base`
  (`git push origin nueva-base:main`) despues de ver el preview de la rama.

---

## 2. Que hay publicado

| Pieza | Estado |
|---|---|
| Portada `/` | Enfoque de portfolio (spec 002): hero que presenta a Hugo, proyectos con enlace al codigo, ensamblado, «Quien soy», «Como trabajo» (el metodo, con enlaces al repo) y contacto abierto. Sin servicios, proceso, FAQ ni bloque de encargos |
| Hero | Escritorio: scrub del video. Tactil o < 900 px: clase `lite` en `<html>` e imagen fija `assets/hero-movil.jpg` (100 KB), sin animacion |
| `/proyectos/brasa-y-ascuas`, `/aperture`, `/top-note` | Pagina propia por proyecto; estilos compartidos en `assets/caso.css` |
| `/proyectos/piezaxpieza` y su bloque en la portada | Spec 003. Segundo destacado tras Brasa y Ascuas, sin enlace al codigo (repo privado). Demo en `piezaxpieza.hugogaliana.com`, que es otro proyecto de Vercel (`piezaxpieza`); responde desde el 29/09 (CNAME en IONOS, abajo) |
| `/proyectos` | Redirige a `/#proyectos` (`vercel.json`) |
| Demo de Brasa y Ascuas | `buffet.hugogaliana.com`, repo aparte `HugoGali1/TFG`, en Render. **Stripe activo en modo de prueba** (ver seccion 4) |

Borrado en esta etapa: `assets/seq/` (48 fotogramas, 804 KB) y el motor de
lienzo que los pintaba en movil.

---

## 3. Historia reciente

### 29/09/2026 · spec 003, PiezaxPieza en el portfolio

```
e999145 feat(proyectos): PiezaxPieza en la navegacion entre proyectos
6362789 feat(portada): PiezaxPieza como segundo proyecto destacado
a5ed514 feat(proyectos): pagina propia de PiezaxPieza
cc6d6f2 feat(proyectos): capturas de la demo de PiezaxPieza
07e8a01 docs(specs): 003 PiezaxPieza en el portfolio
```

- Decisiones de la entrevista: segundo destacado (Brasa y Ascuas sigue como
  proyecto principal); repo de PiezaxPieza privado, asi que sin enlace al
  codigo; demo en el subdominio; se cuenta que nacio para afiliados de
  Amazon.es y que la demo va sin afiliacion, pero no que el proyecto este
  aparcado.
- Cifras de la pagina cotejadas con el repo de PiezaxPieza el 29/09: 63
  componentes en 7 categorias, 76 paginas en la demo, 470 pruebas, 20 specs.
  Si se retoma el proyecto, no se actualizan solas.
- Siguiente proyecto en cadena, en el orden de la portada: Brasa y Ascuas,
  PiezaxPieza, Aperture, Top Note.
- T1 a T4 las implemento el orquestador (Claude, conversacion principal), sin
  implementador aparte; cada una la valido el subagente `validador`.
- Preview de `e999145`:
  https://hugogaliana-exmspm2lx-hugo-gali1-s-projects.vercel.app (protegido:
  navegador con sesion de Vercel). Revisado el 29/09: rutas 200, imagenes,
  sitemap, siguiente proyecto y documentacion en 404.

### 29/09/2026 · punto final en las listas de proyecto

```
aadce7c copy(proyectos): punto final en las listas de las paginas de proyecto
```

- A peticion de Hugo, los 46 elementos de las listas de las tarjetas (`.cell
  li`) de las cuatro paginas de proyecto llevan punto final: 15 en Brasa y
  Ascuas, 12 en PiezaxPieza, 10 en Aperture y 9 en Top Note. Antes no lo
  llevaba ninguno. Criterio para lo nuevo: **todas con punto, sin mezclar**.
- La marca de cada elemento no es un caracter del texto: es una rayita de
  acento dibujada con CSS (`.cell li::before` en `assets/caso.css`).
- Visto en el preview y publicado el mismo dia.

### 24/09/2026 · spec 002, enfoque de portfolio

```
246353d feat(portada): quitar el bloque de encargos; los encargos quedan en el contacto
5a4e95f chore(seo): titulo, descripcion y JSON-LD de portfolio, sin FAQ ni ficha de servicio
0e71e50 copy(proyectos): cerrar cada caso con el codigo o la web publicada, no con una venta
e02c65c feat(portada): seccion «Como trabajo», el metodo que se puede comprobar en el repo
885a30e feat(portada): portfolio primero, encargos como opcion y contacto abierto
5f49887 copy(hero): presentar a Hugo en lugar de vender, y el ensamblado con las mismas capas
2d6b4ff docs(specs): 002 enfoque de portfolio en lugar de pagina de venta
```

- Publico principal: empresas que contratan. Los encargos solo aparecen como
  motivo en el contacto.
- T1 la implemento Codex; se quedo sin cuota a mitad de T2 y el resto lo
  implemento el subagente `implementador` (Sonnet). Validacion con el
  `validador` de Claude en todas, por decision del usuario (Codex sin cuota).
- T6 (quitar encargos) se hizo tras ver el preview, sin implementador aparte.
- Se quito `Co-Authored-By: Claude` del historial de `main` (este repo),
  `topnote` y `TFG`; los hashes anteriores al 24/09 cambiaron.

### 23/09/2026

```
3344312 copy(proyectos): Brasa y Ascuas como «Mi TFG · Proyecto principal»
0a34ea3 feat(ensamblar): tres placas en 3D que se apilan de la base arriba
27f0313 docs(agentes): Opus 5.5 con esfuerzo medio para orquestar y redactar specs
a248f63 fix(proyectos): tarjetas al ancho de la columna de texto
24d69a3 docs(specs): 001 ensamblado en 3D y tarjetas al ancho del texto
7b112b6 feat(portfolio): pagina propia por proyecto y hero ligero en movil
361edba docs(agentes): flujo de trabajo con agentes y specs
```

- **La historia de GitHub se reescribio** el 23/09 (mismos arboles, otros
  hashes). Si un clon antiguo no casa con `origin`, no se fuerza nada: se
  recoloca con `git rebase --onto origin/<rama> <commit-viejo-equivalente>`.
- **PR #2 cerrada** (`escaparate-proyectos`): otra version de la portada y de
  las paginas de proyecto, generadas desde Markdown (`contenido/proyectos/`,
  `scripts/build-proyectos.mjs`) y con tests propios. Se descarto en favor de
  `nueva-base`. **La rama sigue en GitHub** por si se quiere recuperar algo.
- Rama local `respaldo-nueva-base-claude`: copia de seguridad del trabajo antes
  de recolocarlo; su arbol es identico al de `main`. Se puede borrar.
- Pagina de prueba de las tres propuestas del ensamblado (se eligio la A):
  https://claude.ai/artifact/G62HMkyZr9o4Tz2zEo2mmA

---

## 4. Stripe en la demo de Brasa y Ascuas

- Modo de **prueba**: nunca se cobra dinero. Tarjeta `4242 4242 4242 4242`
  (3D Secure: `4000 0025 0000 3155`). La pagina del proyecto lo indica.
- Clave publicable en `brasa-ascuas-app/src/environments/environment.prod.ts`
  (repo `TFG`, commit `8f97aad`). La secreta, `STRIPE_SECRET_KEY`, solo en las
  variables de entorno de Render (servicio `buffet-staff`).
- **Sin webhook**: la app confirma cada pago con `POST /api/payments/:id/sync`,
  que consulta el estado a Stripe. Solo se pierde el caso de cerrar el
  navegador a mitad de un Bizum.
- Comprobacion rapida: `curl https://buffet.hugogaliana.com/api/payments/config`
  debe devolver `{"stripeEnabled":true}`.
- Orden importante si se cambia de claves: la app usa Stripe con solo tener la
  publicable, asi que **primero la secreta en Render, despues la publicable**.

---

## 5. La bandera CUENTAS — leer antes de tocar Top Note

`topnote/src/app.jsx` habla con **14 rutas** de API. El despliegue publico solo
tiene **una** funcion serverless: `api/recommendations/rank.js`. Las otras trece
(`/auth/*`, `/favorites*`, `/history*`...) viven en el backend NestJS de Top
Note, **que no esta desplegado**. Por eso `const CUENTAS = false`: esconde la UI
de cuenta; favoritos e historial van contra `localStorage`.

**Cuando levantes el NestJS, `CUENTAS = true` y la UI vuelve entera.**

`topnote/app.js` es **producto**: se edita `topnote/src/app.jsx` y se
reconstruye con `npm run build:topnote`.

---

## 6. Pendiente y mejoras no aplicadas

### Spec 003, cerrada el 29/09

Hugo aprobo los textos en el preview tal como estaban, con el bloque de
PiezaxPieza en el mismo sentido que el de Brasa y Ascuas (imagen a la
izquierda). Lista de cierre completa en
`specs/003-piezaxpieza-en-portfolio/tasks.md`.

- **CNAME en IONOS** (DNS de `hugogaliana.com`): `piezaxpieza` →
  `92def13e8ff2a577.vercel-dns-017.com`, TTL 1 hora. Lo creo Claude desde
  Chrome con la sesion que abrio Hugo (IONOS pide login: nunca lo hace un
  agente). Vercel lo dio por valido y emitio el certificado en minutos;
  `https://piezaxpieza.hugogaliana.com` responde 200 sin sesion.
- En el repo de PiezaxPieza queda por cerrar la T2 de su Spec 022 (revision
  en vivo en el subdominio), que esperaba a este DNS.
- **`piezaxpieza.es`: se queda sin usar** (decision de Hugo, opcion 1 de
  tres: sin usar, redirigir al subdominio o usarlo como direccion de la
  demo). Seria el dominio de una futura version con afiliacion; al renovarlo
  se decide si se mantiene.

### Mejoras

Ordenadas por impacto. Ninguna esta empezada.


- **`assets/hero-scrub.mp4`: 6,2 MB**, ahora solo lo descarga el escritorio.
  Recomprimir (AV1/H.265 o menos bitrate) es el mayor ahorro que queda.
- **`topnote/data/catalog.json`: 3,4 MB** antes de poder buscar. Partirlo en
  indice ligero + detalle bajo demanda.
- **CDNs de terceros** en Top Note (React, three, framer-motion): autohospedar
  en `/topnote/vendor/`.
- **`rank.js`**: el limite por IP se gasta antes de validar el cuerpo; moverlo
  detras. La allowlist de origen acepta cualquier `*.vercel.app`.
- **Aperture**: la pagina dice React + Vite + EmailJS, deducido del codigo
  publicado de su web; confirmarlo.
- CSS muerto menor: `.cols.dos` en `assets/caso.css`.
- Ideas de contenido: cita de Aperture, capturas de detalle por proyecto, CV en
  PDF, precios orientativos en la FAQ.

---

## 7. Mapa rapido del proyecto

```
index.html              portada, todo en un fichero (CSS y JS en linea, ~97 KB)
proyectos/*.html        una pagina por proyecto (4, con piezaxpieza.html)
assets/caso.css         estilos de las paginas de proyecto
404.html  privacidad.html  robots.txt  sitemap.xml
vercel.json             cleanUrls, redirects (/buffet, /proyectos), cache y seguridad
api/recommendations/rank.js   unica funcion serverless: re-rankeo con Gemini
topnote/src/app.jsx     FUENTE de la demo <- se edita aqui
topnote/app.js          PRODUCTO, generado, commiteado
specs/001-*/            spec 001 (cerrada) y sus tareas
assets/                 hero-scrub.mp4 (6,2 MB, solo escritorio), hero-movil.jpg, capturas
```

Formulario de contacto: Web3Forms, la access key del `<input id="w3f-key">` es
publica por diseno.
