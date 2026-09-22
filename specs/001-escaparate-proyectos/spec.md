# Spec 001 — Escaparate de proyectos

## Contexto y objetivo
La portada actual está escrita para vender servicios a comercios: tiene precios,
proceso comercial y FAQ, y cuenta la metáfora de "las tres capas". Además, su
animación de scroll va a tirones en el móvil. Hugo quiere otra cosa: un sitio
donde la gente vea sus proyectos y cómo trabaja, y pueda contactarle si le
interesa. El centro pasan a ser los proyectos, cada uno con su caso de estudio
opcional. Añadir un proyecto nuevo tiene que costar poco, o no se añadirán.
Diseño de referencia aprobado: la maqueta "Portfolio · Escaparate oscuro"
(https://claude.ai/artifact/VCZYfFEdLT5Xxcka4o9woV).

## Usuarios / actores
- **Visitante**: cualquiera que llega a la web, desde el móvil o el escritorio,
  para ver qué ha hecho Hugo (posibles clientes, empresas, otros desarrolladores).
- **Hugo (autor)**: añade y edita proyectos.

## Historias de usuario
- H1: Como visitante quiero ver todos los proyectos nada más entrar para hacerme
  una idea rápida de lo que Hugo sabe hacer.
- H2: Como visitante quiero leer cómo se construyó un proyecto (decisiones y
  problemas resueltos) para valorar la forma de trabajar de Hugo.
- H3: Como visitante quiero contactar con Hugo desde la propia web para
  proponerle un trabajo.
- H4: Como visitante de móvil quiero que la página responda sin tirones al
  deslizar.
- H5: Como autor quiero añadir un proyecto rellenando un archivo de texto y
  añadiendo sus imágenes, sin editar la portada a mano.

## Requisitos funcionales (criterios de aceptación en EARS)

### Portada
- RF-1: EL SISTEMA mostrará en la primera pantalla de la portada el nombre de Hugo, su rol y ubicación, una frase de presentación y dos accesos: "Ver proyectos" y "Escríbeme".
- RF-2: EL SISTEMA mostrará en la portada una tarjeta por cada proyecto publicado.
- RF-3: Cada tarjeta mostrará la imagen, el título, la descripción corta, la categoría y el año del proyecto.
- RF-4: DONDE el proyecto declare tecnologías, EL SISTEMA las mostrará en su tarjeta.
- RF-5: DONDE un proyecto esté marcado como destacado, EL SISTEMA lo mostrará el primero y en formato de tarjeta grande.
- RF-6: EL SISTEMA ordenará los proyectos no destacados del más reciente al más antiguo según su fecha.
- RF-7: SI dos proyectos tienen la misma fecha, ENTONCES EL SISTEMA los ordenará alfabéticamente por título.
- RF-8: EL SISTEMA mostrará en la portada el número total de proyectos publicados.
- RF-9: EL SISTEMA mostrará en la portada una sección "Cómo trabajo" con el retrato de Hugo, un párrafo de presentación y tres pasos numerados.
- RF-10: EL SISTEMA no mostrará en la portada las secciones de servicios, proceso comercial, preguntas frecuentes ni la interacción "Mantén pulsado".

### Tarjetas y páginas de proyecto
- RF-11: DONDE un proyecto tenga caso de estudio, EL SISTEMA publicará su página en `/proyectos/<identificador>`.
- RF-12: DONDE un proyecto tenga caso de estudio, su tarjeta enlazará a esa página.
- RF-13: DONDE un proyecto no tenga caso de estudio y tenga demo, su tarjeta enlazará a la demo.
- RF-14: DONDE un proyecto no tenga caso de estudio ni demo y tenga enlace al código, su tarjeta enlazará al código.
- RF-15: SI un proyecto no tiene caso de estudio, ni demo, ni enlace al código, ENTONCES su tarjeta se mostrará sin enlace.
- RF-16: La página de proyecto mostrará título, descripción, año, papel de Hugo, tecnologías y estado.
- RF-17: DONDE el proyecto tenga demo o código, su página mostrará un botón por cada enlace disponible.
- RF-18: La página de proyecto mostrará el texto del caso de estudio con los apartados que el autor haya escrito, en el orden en que los escribió.
- RF-19: La página de proyecto mostrará un enlace para volver a todos los proyectos.
- RF-20: La página de proyecto mostrará un enlace al siguiente proyecto con caso de estudio, siguiendo el orden de la portada.
- RF-21: SI el proyecto es el último con caso de estudio, ENTONCES el enlace "siguiente" llevará al primero.
- RF-22: SI solo hay un proyecto con caso de estudio, ENTONCES EL SISTEMA no mostrará el enlace "siguiente".
- RF-23: CUANDO se pida una dirección `/proyectos/<identificador>` que no existe, EL SISTEMA responderá con la página 404 del sitio y el estado HTTP 404.

### Añadir proyectos
- RF-24: CUANDO el autor añade el archivo de un proyecto, sus imágenes y ejecuta el comando de generación, EL SISTEMA creará su tarjeta en la portada.
- RF-25: CUANDO el autor añade el archivo de un proyecto que tiene caso de estudio y ejecuta el comando de generación, EL SISTEMA creará su página.
- RF-26: SI al archivo de un proyecto le falta un dato obligatorio (título, identificador, descripción corta, fecha, categoría o imagen), ENTONCES el comando de generación fallará indicando el archivo y el dato que falta.
- RF-27: SI dos proyectos comparten identificador, ENTONCES el comando de generación fallará indicando los dos archivos.
- RF-28: SI más de un proyecto está marcado como destacado, ENTONCES el comando de generación fallará indicando cuáles.
- RF-29: SI una imagen referenciada por un proyecto no existe, ENTONCES el comando de generación fallará indicando el archivo del proyecto y la imagen.
- RF-30: SI el identificador de un proyecto choca con una ruta existente del sitio, ENTONCES el comando de generación fallará indicando el choque.
- RF-31: DONDE un proyecto esté marcado como borrador, EL SISTEMA no lo publicará ni en la portada ni como página.

### Hero y animación
- RF-32: MIENTRAS el dispositivo sea táctil o la ventana mida 900 px de ancho o menos, EL SISTEMA mostrará de fondo en la primera pantalla un vídeo corto en bucle, sin sonido y sin controles.
- RF-33: MIENTRAS el dispositivo sea táctil o la ventana mida 900 px de ancho o menos, EL SISTEMA no descargará ni el vídeo de escritorio ni la secuencia de fotogramas actual.
- RF-34: MIENTRAS el dispositivo no sea táctil y la ventana mida más de 900 px de ancho, EL SISTEMA hará avanzar el metraje de fondo con el scroll a lo largo de 2 pantallas como máximo.
- RF-35: MIENTRAS el sistema operativo pida reducir el movimiento, EL SISTEMA mostrará de fondo una imagen fija en lugar de vídeo o animación.
- RF-36: MIENTRAS el navegador tenga activado el ahorro de datos, EL SISTEMA mostrará de fondo una imagen fija en lugar de vídeo.
- RF-37: SI el vídeo de fondo no carga, ENTONCES EL SISTEMA mostrará la imagen fija y el texto de la primera pantalla seguirá legible.

### Contacto
- RF-38: EL SISTEMA ofrecerá al final de la portada un formulario de contacto con tres campos obligatorios: nombre, correo y mensaje.
- RF-39: EL SISTEMA mostrará junto al formulario el correo de contacto y los enlaces a GitHub y LinkedIn.
- RF-40: EL SISTEMA exigirá aceptar la política de privacidad antes de enviar el formulario.
- RF-41: CUANDO el formulario se envía con éxito, EL SISTEMA mostrará una confirmación sin salir de la página.
- RF-42: SI el envío falla, ENTONCES EL SISTEMA mostrará un mensaje de error sin borrar lo escrito.
- RF-43: SI falta un campo obligatorio o el correo no es válido, ENTONCES EL SISTEMA no enviará el formulario y señalará el campo.

### Navegación y metadatos
- RF-44: EL SISTEMA mostrará una barra de navegación con enlaces a Proyectos, Cómo trabajo y Contacto.
- RF-45: MIENTRAS la ventana mida 900 px de ancho o menos, la navegación se abrirá desde un botón de menú accesible por teclado, que se cerrará con Escape.
- RF-46: EL SISTEMA dará a la portada un título, una descripción e imagen para redes que presenten a Hugo como desarrollador que enseña sus proyectos, sin mensajes de venta a comercios.
- RF-47: EL SISTEMA dará a cada página de proyecto su propio título, descripción e imagen para redes.
- RF-48: EL SISTEMA incluirá cada página de proyecto publicada en el sitemap.
- RF-49: EL SISTEMA mantendrá sin cambios las direcciones `/topnote`, `/privacidad`, `/buffet` y `/buffet/*`.

## Requisitos no funcionales
- **Peso en móvil**: el vídeo en bucle del móvil pesará 1 MB o menos y se obtendrá de los primeros segundos del metraje actual.
- **Rendimiento en móvil**: la portada obtendrá 90 o más en Rendimiento de Lighthouse, en modo móvil y sobre el despliegue de preview.
- **Estabilidad visual**: la portada y las páginas de proyecto tendrán un CLS de 0,1 o menos.
- **Accesibilidad**: la portada y las páginas de proyecto obtendrán 95 o más en Accesibilidad de Lighthouse. Todo el texto tendrá un contraste de al menos 4,5:1 y los elementos táctiles medirán al menos 44 × 44 px.
- **Sin tirones al deslizar**: en el móvil, ningún cálculo de la portada ligado al scroll correrá en el hilo principal.
- **Constitución**: sigue siendo un sitio estático. El paso de generación se ejecuta en local y su resultado se commitea (principio 1; esta spec es la que lo autoriza). Todo recurso nuevo o cambiado declara su tamaño en el commit (principio 7).
- **Privacidad**: si cambia algún dato recogido o algún servicio de terceros, `privacidad.html` se actualiza en el mismo cambio (principio 5).
- **Idioma**: todo el contenido en español.

## Casos límite
- Portada sin ningún proyecto publicado: se muestra la sección vacía con un texto neutro, no un error.
- Ningún proyecto destacado: no hay tarjeta grande y todos se ordenan por fecha.
- Proyecto con título o descripción muy largos: la tarjeta no desborda ni corta palabras a la mitad.
- Proyecto sin tecnologías declaradas: la tarjeta omite esa línea sin dejar hueco.
- Proyecto con caso de estudio pero sin apartados escritos: el comando de generación falla indicando el archivo.
- Identificador con mayúsculas, espacios o tildes: el comando de generación falla y dice qué caracteres se admiten.
- Móvil en apaisado: el vídeo cubre la pantalla y el texto sigue legible.
- Tablet táctil de más de 900 px: se comporta como móvil (RF-32), no como escritorio.
- JavaScript desactivado: los proyectos, las páginas de proyecto y los enlaces de contacto siguen visibles.

## Fuera de alcance
- Filtros por categoría en la portada (se reconsiderarán a partir de unos 8 proyectos).
- "Me gusta", comentarios, votos o cualquier interacción de visitantes con los proyectos.
- Panel web para añadir proyectos, cuentas o base de datos.
- Versión en otro idioma.
- Cambios en la demo de Top Note (`/topnote`), en su API o en la bandera CUENTAS.
- Blog, notas o artículos que no sean casos de estudio.
- Rediseño de `/privacidad` y de la página 404 más allá de lo que obliguen la nueva navegación y RF-40.
- Mejoras de peso de Top Note (catálogo, CDN de terceros).

## Criterios de finalización
- Cada RF-26 a RF-31 tiene un test automático, y `npm test` está en verde.
- Los tres proyectos de «Datos acordados» están publicados, cada uno con su caso de estudio.
- Demo manual en el preview de la rama, en un iPhone y un Android reales: portada, deslizamiento, página de proyecto, menú y envío del formulario.
- Las cifras de Lighthouse de los requisitos no funcionales están medidas en el preview y anotadas en el PR.
- Ninguna ruta de RF-49 cambia de comportamiento (comprobado en el preview).

## Datos acordados

### Proyectos de la primera versión
Los tres tienen caso de estudio y su página en `/proyectos/<identificador>`.

| Proyecto | Año | Papel | Tecnologías | Demo | Código |
|---|---|---|---|---|---|
| Top Note | 2026 | Diseño y desarrollo completos | React, Three.js, Framer Motion, Gemini, Vercel | hugogaliana.com/topnote | github.com/HugoGali1/topnote |
| Brasa y Ascuas | 2026 | Diseño y desarrollo completos | Angular 20, Ionic 8, Capacitor, NestJS 11, MongoDB, Socket.IO, Stripe, Render | buffet.hugogaliana.com | github.com/HugoGali1/TFG |
| Aperture Technologies | 2026 | Diseño y desarrollo completos | React, Vite, Vercel | aperturetechnologies.es | privado, sin botón |

### Hero
- Escritorio: el efecto de scroll ocupa como máximo 2 pantallas (hoy son 6,4).
- Móvil: vídeo en bucle tomado de los primeros segundos del metraje actual; el corte exacto se elige para que el bucle empalme sin salto.

### Contacto
- El correo `hgalianareal@gmail.com` se muestra como enlace junto al formulario, además de GitHub y LinkedIn.

## Dudas abiertas
Ninguna. El repositorio de Aperture Technologies es privado, así que su página
se publica sin botón de código (RF-17 solo muestra los enlaces disponibles).
