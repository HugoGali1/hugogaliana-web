# Spec 002 — Enfoque de portfolio en lugar de página de venta

## Contexto y objetivo
La web se lee hoy como una página comercial: el título y el titular hablan de
«el software que hace funcionar tu negocio», «Cuéntame tu proyecto» aparece
cuatro veces en la portada, y tres secciones enteras (servicios, proceso de
encargo y preguntas de precio y plazo) están escritas para vender. Lo que
convierte la web en un portfolio (quién es Hugo, qué ha construido y cómo
trabaja) queda en segundo plano.

El objetivo es que la web sea un lugar donde ver los proyectos sin compromiso,
pensado en primer lugar para las empresas que contratan. La posibilidad de
encargar un proyecto se mantiene, pero como una opción discreta al final, no
como el hilo de la página.

## Usuarios / actores
- Persona de una empresa que evalúa a Hugo para contratarlo (público principal).
- Visitante que llega a ver un proyecto concreto, sin intención previa.
- Posible cliente que busca a alguien para un encargo (público secundario).

## Historias de usuario
- H1: Como persona que contrata quiero saber en los primeros segundos quién es
  Hugo y a qué se dedica para decidir si sigo leyendo.
- H2: Como persona que contrata quiero ver cómo trabaja Hugo por dentro (specs,
  tests, commits, uso de agentes de IA) y poder comprobarlo en su código.
- H3: Como visitante quiero recorrer los proyectos sin sentir que me están
  vendiendo algo.
- H4: Como posible cliente quiero encontrar sin esfuerzo la forma de proponer
  un encargo.
- H5: Como cualquier visitante quiero poder escribir a Hugo por el motivo que
  sea (encargo, oferta de trabajo o simplemente hablar).

## Requisitos funcionales (criterios de aceptación en EARS)

### Hero y navegación (portada)
Textos acordados para las cinco pantallas del hero. Donde hay dos frases, la
primera es el titular y la segunda el subtítulo. Las etiquetas de capa y la
franja superior de la primera pantalla («Hugo Galiana · Full-stack ·
Valencia») no cambian.

| Pantalla | Titular | Subtítulo |
|---|---|---|
| Presentación | Soy Hugo Galiana, desarrollador full-stack. | Creo aplicaciones completas, desde la base de datos hasta la interfaz. |
| Capa 01 · Interfaz | Lo que ves y utilizas. | Interfaces con Angular, Ionic y React, pensadas para web y móvil. |
| Capa 02 · Lógica | Lo que hace que todo funcione. | APIs con NestJS, tiempo real con Socket.io y pagos con Stripe. |
| Capa 03 · Datos | Donde vive la información. | MongoDB y PostgreSQL, con los datos bien estructurados y bajo control. |
| Cierre | Las tres capas, conectadas de principio a fin. | Desde los datos hasta la interfaz, listo para publicar. |

- RF-1: EL SISTEMA mostrará en cada pantalla del hero el titular y el
  subtítulo de la tabla anterior, literalmente.
- RF-2: EL SISTEMA no mostrará en el hero ningún otro texto dirigido al
  negocio del visitante.
- RF-3: EL SISTEMA ofrecerá en la pantalla de presentación y en la de cierre
  una única llamada a la acción, «Ver proyectos», que llevará a los proyectos.
- RF-4: EL SISTEMA presentará «Contacto» en el menú de navegación con el mismo
  estilo que el resto de enlaces del menú.
- RF-5: EL SISTEMA no mostrará en ninguna página la frase «Cuéntame tu
  proyecto».

### Proyectos
- RF-6: EL SISTEMA mantendrá los proyectos como la primera sección tras la
  cabecera principal.
- RF-7: DONDE un proyecto tenga su código en un repositorio público, EL SISTEMA
  enlazará ese repositorio desde su tarjeta en la portada.

### Ensamblado
- RF-8: EL SISTEMA describirá cada capa de la lista del ensamblado con el
  mismo titular que esa capa tiene en el hero (Datos: «donde vive la
  información»; Lógica: «lo que hace que todo funcione»; Interfaz: «lo que
  ves y utilizas»).
- RF-9: EL SISTEMA no mostrará una llamada al contacto dentro de la sección
  del ensamblado.
- RF-10: EL SISTEMA no se referirá a entregar trabajo a un cliente en la
  introducción del ensamblado.

### Cómo trabajo (sección nueva)
- RF-11: EL SISTEMA incluirá en la portada una sección propia que explique cómo
  trabaja Hugo.
- RF-12: EL SISTEMA explicará en esa sección que cada cambio empieza por una
  spec aprobada antes de escribir código.
- RF-13: EL SISTEMA explicará en esa sección que el desarrollo se hace con
  agentes de IA (Claude y Codex) con papeles separados de implementación y
  validación.
- RF-14: EL SISTEMA explicará en esa sección que la decisión final sobre cada
  cambio es de Hugo.
- RF-15: EL SISTEMA explicará en esa sección que cada tarea termina con los
  tests en verde.
- RF-16: EL SISTEMA explicará en esa sección que los cambios se revisan en un
  despliegue de preview antes de publicarse.
- RF-17: EL SISTEMA enlazará desde esa sección al repositorio público de esta
  web, donde se puede comprobar el método.
- RF-18: EL SISTEMA solo afirmará en esa sección prácticas que se puedan
  comprobar en un repositorio público enlazado.

### Quién soy
- RF-19: EL SISTEMA mostrará la sección «Quién soy» antes de la sección
  «Cómo trabajo».

### Encargos
- RF-20: EL SISTEMA no mostrará las secciones actuales de servicios ni de
  proceso de encargo.
- RF-21: EL SISTEMA no mostrará las preguntas frecuentes actuales.
- RF-22: EL SISTEMA mostrará, antes del contacto, un bloque breve que ofrezca
  encargos de proyectos, de como máximo tres frases.
- RF-23: EL SISTEMA enlazará ese bloque con el formulario de contacto.

### Contacto
- RF-24: EL SISTEMA invitará en la sección de contacto a escribir por un
  encargo, por una oferta de trabajo o por cualquier otro motivo.
- RF-25: EL SISTEMA mantendrá en el formulario de contacto los mismos campos
  que ahora.
- RF-26: EL SISTEMA rotulará el botón de envío sin referirse a un proyecto.

### Páginas de proyecto
- RF-27: EL SISTEMA no cerrará ninguna página de proyecto con una llamada a
  encargar un proyecto parecido.
- RF-28: DONDE un proyecto tenga su código en un repositorio público, EL
  SISTEMA ofrecerá al final de su página el enlace a ese repositorio.
- RF-29: EL SISTEMA ofrecerá al final de cada página de proyecto un enlace a
  otro proyecto.

### Metadatos
- RF-30: EL SISTEMA describirá a Hugo como desarrollador en el título de la
  portada.
- RF-31: EL SISTEMA describirá a Hugo como desarrollador en la descripción de
  la portada.
- RF-32: EL SISTEMA describirá a Hugo como desarrollador en los metadatos para
  compartir en redes de la portada.
- RF-33: EL SISTEMA no declarará en los datos estructurados de la portada
  preguntas frecuentes que ya no se muestran.
- RF-34: EL SISTEMA no declarará en los datos estructurados de la portada una
  oferta de servicios comerciales.

## Requisitos no funcionales
- Idioma: contenido en español, como el resto del sitio.
- Peso: la portada no crecerá en peso de recursos. Todo recurso nuevo o
  cambiado declara su tamaño (constitución, principio 7).
- Privacidad: el formulario no cambia los datos que envía, así que
  `privacidad.html` solo se toca si algún texto suyo deja de ser cierto
  (constitución, principio 5).
- Sin dependencias ni recursos de terceros nuevos.
- Accesibilidad: la jerarquía de titulares de la portada seguirá sin saltos
  (un solo H1 y secciones con H2).

## Casos límite
- Proyecto sin código público (Aperture, que es de un cliente): su tarjeta y
  su página no muestran enlace a código ni un enlace roto.
- Enlaces antiguos a anclas que desaparecen (`/#servicios`, `/#proceso`,
  `/#faq`): SI alguien llega con una de ellas, ENTONCES la portada carga
  normalmente desde arriba, sin error.
- Enlaces a `/#contacto` desde fuera: siguen llevando al formulario.
- Menú de móvil: refleja los mismos cambios que el de escritorio.
- Un repositorio enlazado que pase a ser privado dejaría un enlace roto: los
  enlaces se revisan contra la visibilidad real en GitHub al cerrar la spec.

## Fuera de alcance
- Cambios visuales en el hero (vídeo, imagen de móvil, animaciones, número de
  pantallas) y en el ensamblado en 3D: solo cambian sus textos.
- Rediseño de las páginas de proyecto más allá de su menú y su cierre.
- Campos nuevos en el formulario (por ejemplo, un selector de motivo).
- Una página aparte de encargos o de tarifas.
- Contenido nuevo pendiente de otra decisión: CV en PDF, capturas nuevas,
  cita de Aperture, precios.
- Cambiar la visibilidad de repositorios en GitHub.
- La demo de Top Note.

## Criterios de finalización
- Cada RF comprobado en el preview de la rama, en escritorio y en móvil.
- Ninguna página publicada contiene «Cuéntame tu proyecto» ni «tu negocio»
  (búsqueda en los HTML).
- Todos los enlaces a GitHub añadidos responden 200 sin sesión iniciada.
- `npm test` en verde.
- Aprobación de Hugo sobre los textos finales en el preview antes de fusionar
  en `main`.

## Dudas abiertas
- Ninguna.

## Estado
Aprobada por el usuario el 24/09/2026.
