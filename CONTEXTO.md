# Contexto de trabajo — hugogaliana.com

Ultima sesion: **23 de septiembre de 2026**.
Estado: **spec 001 (escaparate de proyectos) terminada en la rama
`escaparate-proyectos`, con el PR #2 en borrador hacia `main`. Falta la prueba
en moviles reales y fusionar.**

> Este fichero es una nota de trabajo, no forma parte del sitio.
> Esta excluido en `.vercelignore`.

---

## 1. Lo primero al volver

```bash
git switch escaparate-proyectos
npm test                       # 53 pruebas, todas en verde
gh pr view 2                   # el PR hacia main, con las cifras de T8
```

Lo que queda, en este orden:

- [ ] **Demo manual en un iPhone y un Android reales**, sobre el preview:
      portada, deslizamiento (que el bucle del hero no de tirones), pagina de
      proyecto, menu y un envio de verdad del formulario.
- [ ] **Fusionar el PR #2 en `main`**. Eso despliega a produccion
      (constitucion, principio 8). Despues, borrar las ramas `t*-` locales.

Preview de la rama:

```
https://hugogaliana-web-git-escaparate-proyectos-hugo-gali1-s-projects.vercel.app
```

Tiene proteccion de despliegue: en el navegador, con la sesion de Vercel
iniciada, entra sola; desde la terminal, `vercel curl`. Para herramientas que
abren un navegador (Lighthouse, puppeteer), `vercel env run -- <comando>` y la
cabecera `x-vercel-trusted-oidc-idp-token` con `$VERCEL_OIDC_TOKEN`, sin
imprimir el token.

---

## 2. Que cambio con la spec 001

La portada deja de vender servicios a comercios y pasa a ensenar proyectos.
Spec y tareas en `specs/001-escaparate-proyectos/`; cada tarea es un commit
`feat` mas su merge en `escaparate-proyectos`.

- **Proyectos como contenido (T1-T4).** Un archivo por proyecto en
  `contenido/proyectos/` (formato en su `README.md`). `npm run build:proyectos`
  valida, genera las tarjetas de la portada, las paginas de `proyectos/` y sus
  entradas del sitemap. Se ejecuta en local y el resultado se commitea.
- **Portada (T5).** Fuera servicios, proceso, preguntas frecuentes, `Manten
  pulsado` y las tres capas del hero. Nueva seccion `Como trabajo`. JSON-LD
  reducido a Person y WebSite.
- **Hero (T6).** Movil y tactil: bucle `assets/hero-loop.mp4` (392 KB) que
  reproduce el navegador, sin nada ligado al scroll. Escritorio: el metraje
  avanza con el scroll en 2 pantallas (antes 6,4). Movimiento reducido, ahorro
  de datos (clase `hero-still` en `<html>`), fallo del video o sin JavaScript:
  imagen fija. Borrados los 48 fotogramas de `assets/seq/`.
- **Contacto (T7).** Tres campos, correo visible, menu de movil hasta 900 px.
  `privacidad.html` ya no habla del telefono.
- **Medicion (T8).** En el preview: rendimiento movil 97-99, accesibilidad 100,
  CLS maximo 0,083 (en dos paginas de proyecto; es lo mas justo). Cifras en el
  PR #2.

Para las pruebas de navegador se uso ffmpeg-static, puppeteer-core y
lighthouse instalados en una carpeta temporal, no en el repo. Si hay que volver
a sacar el bucle: tramo 0-1,45 s de `hero-scrub.mp4`, recorte 9:16, media
velocidad con `minterpolate`, y los ultimos 15 fotogramas fundidos con los 15
primeros.

### Decisiones abiertas (fuera de la spec 001)

- Filtros por categoria en la portada: a partir de unos 8 proyectos.
- Peso del catalogo de Top Note y CDN de terceros de la demo (seccion 4).
- El caso de Aperture se escribio con lo verificable desde fuera; ampliarlo
  con lo que cuente Hugo.

---

## 3. La bandera CUENTAS — leer antes de tocar Top Note

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

## 4. Mejoras analizadas y no aplicadas

Ordenadas por impacto. Ninguna esta empezada.

### Peso

- **`assets/hero-scrub.mp4`: 6,2 MB.** Desde la spec 001 solo lo descarga el
  escritorio, entero y al acabar la carga, para mover el metraje con el scroll.
  El movil usa `hero-loop.mp4` (392 KB). Recomprimir a AV1 o H.265, o bajar
  bitrate, sigue siendo el mayor ahorro que queda en la portada de escritorio.
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

## 5. Mapa rapido del proyecto

```
index.html              portada, todo en un fichero (CSS y JS en linea, 53 KB)
                        el bloque proyectos:inicio..fin lo genera build:proyectos
404.html  privacidad.html  robots.txt  sitemap.xml
proyectos/<id>.html     paginas de proyecto, GENERADAS
contenido/proyectos/    FUENTE de los proyectos, un .md por proyecto
vercel.json             cleanUrls, redirects de /buffet, cabeceras de cache y seguridad
api/recommendations/rank.js   unica funcion serverless: re-rankeo con Gemini
topnote/index.html      cascaron de la demo (~150 lineas)
topnote/src/app.jsx     FUENTE de la demo (5.121 lineas) <- se edita aqui
topnote/app.js          PRODUCTO, generado, commiteado (138 KB)
topnote/data/catalog.json     5.000 perfumes, 3,4 MB
scripts/                build-topnote.mjs, build-proyectos.mjs y sus plantillas
tests/                  node --test, sin dependencias
specs/  docs/           specs, constitucion y flujo de agentes
assets/                 hero-scrub.mp4 (6,2 MB, escritorio), hero-loop.mp4
                        (392 KB, movil), hero-poster.jpg, hero-loop.webp, capturas
```

Formulario de contacto: Web3Forms, la access key del `<input id="w3f-key">` es
publica por diseno.
