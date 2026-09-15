# Contexto de trabajo — hugogaliana.com

Ultima sesion: **15 de septiembre de 2026**.
Estado: **todo en el indice (`git add` hecho), sin commitear, sin desplegar.**
Rama: `main`. Ultimo commit: `ae7be8a feat(contacto): enlaces a GitHub y LinkedIn`.

> Este fichero es una nota de trabajo, no forma parte del sitio.
> Esta excluido en `.vercelignore`. Borralo cuando el proyecto este al dia.

---

## 1. Lo primero al volver

```bash
git status            # deberian seguir los 14 ficheros en el indice
npm run build:topnote # solo si has tocado topnote/src/app.jsx
```

Hay **dos decisiones pendientes** antes de subir nada. Estan en la seccion 4.

---

## 2. Que hay preparado y sin commitear

Son dos tandas: los cambios que hiciste tu antes de la sesion, y los cinco
arreglos que salieron del analisis.

### Tus cambios

- **`index.html`** — menu de movil (hamburguesa + panel, `inert` sobre el fondo,
  cierre con Escape y al pulsar enlace); nodo `ProfessionalService` en el JSON-LD
  con `areaServed` y `OfferCatalog`; el subtitulo y el CTA del hero pasan de la
  banda p5 a la p1, visibles ya en escritorio; `width`/`height` en las capturas;
  el movil del cliente deja de ocultarse por debajo de 640px.
- **Top Note** — el JSX sale del HTML a `topnote/src/app.jsx` y se compila a
  `topnote/app.js` con `scripts/build-topnote.mjs` (Babel + terser). Fuera Babel
  standalone: **2,87 MB** que se descargaban y ejecutaban en cada visita. Los
  scripts pasan a `defer`. `topnote/index.html` baja de 5.134 a ~150 lineas.
  Logo de 794 KB a 38 KB.
- **`api/recommendations/rank.js`** — topes de tamano a todo lo que entra al
  prompt (consulta 400 caracteres, campos 80, listas 12, filtros 500).
- **Borrados** — `assets/hero-scrub-mobile.mp4` (2,1 MB) y `assets/hg-favicon.png`
  (1 MB). Comprobado: no quedaba ni una referencia a ninguno de los dos.

### Los cinco arreglos de la sesion

1. **`topnote/app.js` versionado.** Era lo mas grave: `topnote/index.html` ya solo
   carga `/topnote/app.js`, y el fichero estaba sin seguimiento. Desplegar asi
   habria dejado la demo en la pantalla de "cargando" para siempre. Se anadieron
   tambien `topnote/src/`, `scripts/`, `package.json` y `package-lock.json`.
2. **Recorte del id** (`api/recommendations/rank.js:170`). `compactCandidate`
   cortaba el id a 40 caracteres, pero 543 de los 5.000 perfumes tienen ids mas
   largos (hasta 86). El modelo devolvia el id recortado y `parseRanked` lo
   descartaba contra `validIds`. Nueva constante `MAX_ID_CHARS = 120`.
   Medido: con el recorte a 40, **0 de 8** recomendaciones sobrevivian; con el
   arreglo, **8 de 8**.
3. **UI de cuenta desactivada** con la bandera `CUENTAS = false` en
   `topnote/src/app.jsx`, junto a `API_BASE`. Ver seccion 3.
4. **Borrados `index-movil.html` e `index-original.html`** (copias de trabajo que
   se habrian publicado). Ignorados junto a `graphify-out/`.
5. **Fuera el polyfill de `/api/gemini`** en `topnote/index.html`: ruta que no
   existe y que `app.jsx` no llamaba, resto de cuando esto era un artifact.

De propina: el `package.json` tenia un bloque `dependencies` con 20 transitorios
de Babel que el lock ni reconocia. Limpiado; `npm ls` ya cuadra con el lock.

### Verificado

Servido en local y abierto en Chrome: la demo monta, el catalogo carga los 5.000,
el avatar de cuenta no aparece y **la consola sale limpia**. La portada carga bien
y el CTA nuevo se ve en escritorio. `app.js` reconstruido: 136,2 KB.

---

## 3. La bandera CUENTAS — leer antes de tocar Top Note

`topnote/src/app.jsx` habla con **14 rutas** de API. El despliegue publico solo
tiene **una** funcion serverless: `api/recommendations/rank.js`. Las otras trece
(`/auth/signup`, `/auth/login`, `/auth/me`, `/auth/account`, `/favorites`,
`/favorites/bulk`, `/history`, `/history/bulk`...) viven en el backend NestJS de
Top Note, **que no esta desplegado**.

Con la UI de cuenta visible, un visitante pulsaba "Crear cuenta" y se llevaba un
Error 404. Por eso `const CUENTAS = false`: esconde el avatar del header y bloquea
el modal de auth. Favoritos e historial siguen funcionando contra `localStorage`,
que es lo unico que la demo necesita.

**Cuando levantes el NestJS, `CUENTAS = true` y la UI vuelve entera.** No hay que
deshacer nada mas.

Ojo al editar: `topnote/app.js` es **producto**, no fuente. Se edita
`topnote/src/app.jsx` y se reconstruye con `npm run build:topnote`. El despliegue
es estatico y no ejecuta ese script, por eso `app.js` se commitea.

---

## 4. Decisiones pendientes (aqui se retoma)

**a) Como subirlo.** Estas en `main`. Si el proyecto de Vercel esta conectado a
git, un push a `main` despliega a produccion directamente.

- Opcion A: commitear en `main` y desplegar al hacer push.
- Opcion B *(recomendada)*: sacar una rama, dejar que Vercel genere el preview, y
  fusionar tu cuando lo veas.

Recomendada la B porque **hay algo que no se pudo verificar en local**: que
`/api/recommendations/rank` siga funcionando con `package.json` excluido en
`.vercelignore`. El preview es el unico sitio donde se comprueba. La demo necesita
esa ruta viva; si falla, quitar `package.json` de `.vercelignore`.

**b) `GEMINI_API_KEY`.** No se ha tocado ni visto en la sesion. Confirmar que esta
configurada en el proyecto de Vercel para el entorno al que se despliegue, o la
demo devolvera el 503 de "el perfumista no esta configurado".

---

## 5. Mejoras analizadas y no aplicadas

Ordenadas por impacto. Ninguna esta empezada.

### Peso

- **`assets/hero-scrub.mp4`: 6,2 MB.** El fichero mas pesado del proyecto.
  `preload="none"` esta bien puesto, pero cuando entra, entra. Recomprimir a AV1 o
  H.265, o bajar bitrate. Es el mayor ahorro que queda en la portada.
- **`topnote/data/catalog.json`: 3,4 MB** que el visitante descarga antes de poder
  buscar nada. Brotli lo deja sobre 600 KB, pero sigue siendo mucho para un primer
  contacto. Partirlo en un indice ligero (id, nombre, casa, familia) + detalle bajo
  demanda quitaria la mayor parte.
- **framer-motion sin minificar.** `dist/framer-motion.js` es el build de
  desarrollo. Cambiar al minificado es gratis.
- **CDNs de terceros** (unpkg, jsdelivr) para React, ReactDOM, three y
  framer-motion: punto unico de fallo para la demo. Autohospedarlos en
  `/topnote/vendor/` los mete ademas bajo las cabeceras de cache del sitio.

### Producto

- **No hay ninguna analitica.** Para una web cuyo trabajo es traer clientes, no
  saber cuantos llegan al formulario es el punto ciego mas caro. Vercel Analytics
  + Speed Insights son dos etiquetas.
- **`sitemap.xml` con `lastmod` de agosto.** Actualizar al subir.
- **Limite por IP en `rank.js`**: `underLimit(ip)` se consume *antes* de validar el
  cuerpo, asi que una peticion malformada gasta una de las 5. Moverlo detras de
  las validaciones.
- **Allowlist de origen**: acepta cualquier `*.vercel.app` y la cabecera `Origin`
  se falsifica con un curl. El dia que la demo tenga trafico real, BotID o Redis
  del marketplace de Vercel. El techo de verdad ahora es el limite de gasto de la
  cuenta de Google.

---

## 6. Mapa rapido del proyecto

```
index.html              portada, todo en un fichero (CSS y JS en linea, ~103 KB)
404.html  privacidad.html  robots.txt  sitemap.xml
vercel.json             cleanUrls, redirects de /buffet, cabeceras de cache y seguridad
api/recommendations/rank.js   unica funcion serverless: re-rankeo con Gemini
topnote/index.html      cascaron de la demo (~150 lineas)
topnote/src/app.jsx     FUENTE de la demo (5.121 lineas) <- se edita aqui
topnote/app.js          PRODUCTO, generado, commiteado (136 KB)
topnote/data/catalog.json     5.000 perfumes, 3,4 MB
scripts/build-topnote.mjs     jsx -> js (Babel + terser)
assets/                 hero-scrub.mp4 (6,2 MB), seq/ (48 webp, 804 KB), capturas
```

Formulario de contacto: Web3Forms, la access key del `<input id="w3f-key">` es
publica por diseno.
