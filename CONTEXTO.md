# Contexto de trabajo — hugogaliana.com

Ultima sesion: **15 de septiembre de 2026**.
Estado: **7 commits en la rama `preparar-despliegue`. Preview desplegado y
verificado. Solo falta activar Web Analytics en el panel y fusionar a `main`.**
Base: `main` en `ae7be8a`.

> Este fichero es una nota de trabajo, no forma parte del sitio.
> Esta excluido en `.vercelignore`. Borralo cuando el proyecto este al dia.

---

## 1. Lo primero al volver

```bash
git log --oneline main..preparar-despliegue   # los 7 commits
npm run build:topnote                          # solo si tocas topnote/src/app.jsx
```

Queda **una cosa** en el panel de Vercel, y fusionar. Seccion 2.

---

## 2. Estado del preview

Desplegado y **verificado** el 15 de septiembre. URL estable de la rama:

```
https://hugogaliana-web-git-preparar-despliegue-hugo-gali1-s-projects.vercel.app
```

Lleva la proteccion de despliegue de Vercel: en el navegador, con la sesion de
Vercel iniciada, entra sola. Desde la terminal hace falta `vercel curl`, porque
`curl` a secas devuelve un 302 al SSO. Ojo: `vercel curl` ignora `-o`, `-D` y
`-w`; usa `-I` para ver cabeceras.

### Comprobado

| Que | Resultado |
|---|---|
| `/api/recommendations/rank` | **Vive.** Un GET devuelve `405 Solo se admite POST` |
| `GEMINI_API_KEY` | **Configurada** en Production y Preview, tipo Sensitive |
| `/` , `/topnote` , `/privacidad` | 200 |
| `/topnote/app.js` | 200, 141 KB |
| `/topnote/data/catalog.json` | 200, 3,39 MB |
| `/_vercel/speed-insights/script.js` | 200, ya activo |
| `/_vercel/insights/script.js` | **404**, falta activarlo |

**Resuelta la duda de `package.json`.** `vercel inspect` lista
`lambda api/recommendations/rank (6.21KB)` entre los builds: la funcion se detecta
y se construye pese a tener `package.json` excluido en `.vercelignore`, porque
`rank.js` no tiene ni un `import` ni un `require`. **No hay que tocar nada.**

### Lo unico que queda

- [ ] **Activar Web Analytics** en el panel de Vercel, en la pestana Analytics del
      proyecto. La etiqueta ya esta en las cuatro paginas, pero
      `/_vercel/insights/script.js` da 404 hasta que se active, asi que no se
      recoge nada. Speed Insights si esta activo y funcionando.
- [ ] **Fusionar `preparar-despliegue` a `main`** tras darle un repaso visual.

---

## 3. Los 7 commits de la rama

```
cb93167 perf(topnote)  compilar el JSX en local y quitar Babel del navegador
2e89585 fix(api)       dejar de recortar los ids largos y acotar el prompt
b992178 feat(portada)  menu de movil, ficha de servicio en JSON-LD, CTA antes
91012c8 chore          quitar 3,1 MB de assets muertos y no publicar copias
b13a1ea feat(analitica) Vercel Analytics + Speed Insights, y privacidad al dia
07bf9a7 chore(seo)     sitemap con las fechas de esta revision
72838f6 docs           actualizar la nota de trabajo al estado de la rama
```

Los cuatro primeros son el trabajo que ya estaba en el indice; los tres ultimos
salieron de esta sesion.

### Lo que hay detras, en corto

- **Top Note** ya no carga Babel standalone (2,87 MB que se descargaban y
  ejecutaban en cada visita). El JSX vive en `topnote/src/app.jsx` y se compila a
  `topnote/app.js` (136 KB) con `scripts/build-topnote.mjs`. `topnote/index.html`
  baja de 5.134 a ~150 lineas. Logo de 794 KB a 38 KB.
- **`rank.js`**: `compactCandidate` cortaba el id a 40 caracteres, pero 543 de los
  5.000 perfumes tienen ids de hasta 86, asi que `parseRanked` los descartaba
  contra `validIds`. Medido: antes **0 de 8** recomendaciones sobrevivian, ahora
  **8 de 8**. Nueva constante `MAX_ID_CHARS = 120`.
- **Portada**: menu de movil (hamburguesa, `inert` sobre el fondo, Escape),
  `ProfessionalService` en el JSON-LD, subtitulo y CTA del hero de la banda p5 a
  la p1 para que se vean en escritorio.
- **Analitica**: la politica de privacidad decia literalmente “no hay analitica”,
  asi que se actualizo a la vez (apartados 02, 04 y 06, y la fecha). Sigue sin
  haber cookies ni banner: la herramienta de Vercel no guarda nada en el
  dispositivo.
- **Borrado**: `assets/hero-scrub-mobile.mp4` (2,1 MB), `assets/hg-favicon.png`
  (1 MB), y las copias de trabajo `index-original.html` e `index-movil.html`,
  que se habrian publicado tal cual.

---

## 4. La bandera CUENTAS — leer antes de tocar Top Note

`topnote/src/app.jsx` habla con **14 rutas** de API. El despliegue publico solo
tiene **una** funcion serverless: `api/recommendations/rank.js`. Las otras trece
(`/auth/signup`, `/auth/login`, `/auth/me`, `/auth/account`, `/favorites`,
`/favorites/bulk`, `/history`, `/history/bulk`...) viven en el backend NestJS de
Top Note, **que no esta desplegado**.

Con la UI de cuenta visible, un visitante pulsaba “Crear cuenta” y se llevaba un
Error 404. Por eso `const CUENTAS = false`: esconde el avatar del header y bloquea
el modal de auth. Favoritos e historial siguen funcionando contra `localStorage`,
que es lo unico que la demo necesita.

**Cuando levantes el NestJS, `CUENTAS = true` y la UI vuelve entera.** No hay que
deshacer nada mas.

Ojo al editar: `topnote/app.js` es **producto**, no fuente. Se edita
`topnote/src/app.jsx` y se reconstruye con `npm run build:topnote`. El despliegue
es estatico y no ejecuta ese script, por eso `app.js` se commitea.

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
- **CDNs de terceros** (unpkg, jsdelivr) para React, ReactDOM, three y
  framer-motion: punto unico de fallo para la demo. Autohospedarlos en
  `/topnote/vendor/` los mete ademas bajo las cabeceras de cache del sitio.

> Descartado: *“framer-motion sin minificar”* figuraba aqui y **era un falso
> positivo**. `dist/framer-motion.js` (142 KB) ya es el build de produccion; el de
> desarrollo es `dist/framer-motion.dev.js` (525 KB), que el proyecto no usa.

### Producto

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
