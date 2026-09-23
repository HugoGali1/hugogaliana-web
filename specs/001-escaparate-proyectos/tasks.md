# Tareas — Spec 001 · Escaparate de proyectos

Una tarea cada vez, un commit por tarea, la casilla se marca `[x]` dentro de
ese commit. Toda tarea termina con `npm test` en verde. Lo que se ve en la web
se comprueba en el preview de su rama antes de fusionar.

Orden pensado para que el sitio nunca quede roto a medias: primero el motor de
contenidos (T1–T2), que no cambia nada visible; luego las páginas nuevas (T3);
después la portada (T4–T7); y al final la medición y el cierre (T8–T9).

## T1 · Formato de proyecto y comando de generación
- [x] Definir el formato del archivo de un proyecto y el comando que genera a
      partir de él.
- **Alcance**: el comando, su validación y sus pruebas. No toca `index.html`
      todavía; en esta tarea el generador puede escribir su salida sin que la
      portada la use.
- **Criterios**: RF-24 a RF-31. Un proyecto de ejemplo se genera sin errores; los
      seis fallos (dato que falta, identificador repetido, más de un destacado,
      imagen inexistente, choque con una ruta del sitio, identificador con
      caracteres no admitidos) salen con el archivo y el dato nombrados.
- **Notas**: el comando se ejecuta en local y su resultado se commitea
      (constitución, principio 1). No se llama `build` (ver `.vercelignore`).
      Sin dependencias nuevas en lo que se publica.

## T2 · Migrar los tres proyectos a archivos de contenido
- [x] Escribir el archivo de Top Note, Brasa y Ascuas y Aperture Technologies,
      con los datos de «Datos acordados» y el texto de sus casos de estudio.
      El caso de Aperture se queda en dos apartados: es lo único verificable
      desde fuera. Pendiente de ampliar con lo que cuente Hugo.
- **Alcance**: contenido e imágenes. Nada de maquetación.
- **Criterios**: los tres archivos pasan la validación de T1. Cada dato es
      verificable: año, papel, tecnologías y enlaces son los de la spec, y
      Aperture no lleva enlace al código.
- **Notas**: el caso de Top Note ya tiene su material en la maqueta y en
      `CONTEXTO.md`. El de Brasa y Ascuas puede apoyarse en el `render.yaml` y
      el README de `HugoGali1/TFG`. Dato que no se pueda verificar, se pregunta.

## T3 · Páginas de proyecto en `/proyectos/<identificador>`
- [x] Generar la página de cada proyecto con caso de estudio.
- **Criterios**: RF-11, RF-16 a RF-23, RF-47, RF-48.
- **Comprobar en el preview**: las tres páginas responden 200, una dirección
      inventada bajo `/proyectos/` responde 404, el enlace «siguiente» recorre
      los tres en círculo y cada página tiene su propio título y descripción.

## T4 · Portada: la lista de proyectos
- [x] Sustituir las secciones «Mi mejor proyecto» y «Proyectos» por la lista
      generada.
- **Criterios**: RF-2 a RF-8, RF-12 a RF-15.
- **Notas**: desaparece la duplicidad actual de Brasa y Ascuas. La portada
      entera vive en `index.html`: ninguna otra tarea debe editarlo a la vez.

## T5 · Portada: podar lo comercial y rehacer «Cómo trabajo»
- [x] Quitar servicios, proceso, preguntas frecuentes y «Mantén pulsado», y
      dejar la presentación nueva.
- **Criterios**: RF-1, RF-9, RF-10, RF-44, RF-46.
- **Notas**: al quitar «Mantén pulsado» se va también su CSS y su JavaScript.
      El JSON-LD deja de declarar un servicio profesional.

## T6 · Hero: bucle en móvil, dos pantallas en escritorio
- [x] Rehacer el fondo de la primera pantalla.
- **Criterios**: RF-32 a RF-37, y el peso de 1 MB o menos del bucle.
- **Comprobar en el preview, en un móvil real**: al deslizar no hay tirones, no
      se descargan ni el vídeo de escritorio ni los 48 fotogramas, y con
      «reducir movimiento» o ahorro de datos se ve la imagen fija.
- **Notas**: declarar en el commit el tamaño del vídeo nuevo (constitución,
      principio 7). Aquí se corrigen los cinco problemas detectados el
      22/09/2026: memoria de los fotogramas en iOS, dibujo en el hilo principal,
      desenfoque animado del texto, degradados a pantalla completa y altura de
      288svh.

## T7 · Contacto y navegación de móvil
- [x] Dejar el formulario en tres campos, añadir el correo visible y revisar el
      menú de móvil.
- **Criterios**: RF-38 a RF-43, RF-45.
- **Notas**: el formulario sigue siendo Web3Forms y su clave es pública por
      diseño. Si cambia algún dato recogido, `privacidad.html` se actualiza en
      este mismo cambio (constitución, principio 5).

## T8 · Medición y rutas heredadas
- [x] Medir en el preview y comprobar que nada de lo viejo se ha roto.
- **Criterios**: los requisitos no funcionales (Lighthouse de 90+ en rendimiento
      móvil y 95+ en accesibilidad, CLS de 0,1 o menos) y RF-49.
- **Entrega**: las cifras anotadas en el PR, y `/topnote`, `/privacidad`,
      `/buffet` y `/buffet/*` comprobadas una a una.

## T9 · Cierre de la spec
- [ ] Dejar la documentación al día y fusionar.
- **Incluye**: `CONTEXTO.md` con el estado nuevo, la tabla de `AGENTS.md` si
      cambian los archivos de referencia, y el sitemap con las fechas de la
      revisión.
- **Notas**: producción es `main` y nada llega ahí sin verse antes en el
      preview (constitución, principio 8).

## Pendiente de decidir más adelante
- Filtros por categoría en la portada, a partir de unos 8 proyectos.
- Peso del catálogo de Top Note y CDNs de terceros de la demo: fuera de esta
      spec, anotados en `CONTEXTO.md`.
