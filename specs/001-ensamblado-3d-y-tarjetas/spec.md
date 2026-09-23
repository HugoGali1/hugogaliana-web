# Spec 001 — Ensamblado en 3D y tarjetas de proyecto al ancho del texto

## Contexto y objetivo
El momento «Mantén pulsado» de la portada es la única interacción propia de la
web y hoy se ve plano: tres contornos que se juntan. Debe transmitir el
mensaje de la sección (todo software son tres capas que encajan) con un
acabado a la altura del hero. De las tres propuestas probadas en la página de
prueba, el usuario eligió la **A, capas en 3D**: tres placas en perspectiva que
se apilan de la base hacia arriba.

Además, en las páginas de proyecto (`/proyectos/*`) las tarjetas se abren más
anchas que la columna de texto que las introduce, y la página pierde su
estructura. Deben quedar alineadas con el texto.

## Usuarios / actores
- Visitante de la portada, en escritorio (ratón o teclado) y en móvil (dedo).
- Visitante de las páginas de proyecto.

## Historias de usuario
- H1: Como visitante quiero montar las tres capas con un gesto para entender
  de un vistazo qué construye Hugo.
- H2: Como visitante con teclado quiero poder hacer el mismo gesto sin ratón.
- H3: Como visitante que pide menos movimiento quiero ver el resultado final
  sin animación.
- H4: Como visitante de una página de proyecto quiero leer las tarjetas
  alineadas con el texto, sin saltos de anchura.

## Requisitos funcionales (criterios de aceptación en EARS)

### Ensamblado (portada)
- RF-1: EL SISTEMA mostrará en la sección del ensamblado tres placas en
  perspectiva, cada una con un dibujo propio: una base de datos (Datos), un
  circuito (Lógica) y una pantalla (Interfaz).
- RF-2: MIENTRAS el visitante mantiene pulsado el panel, EL SISTEMA acercará
  las placas a su posición apilada.
- RF-3: EL SISTEMA encajará las placas en este orden: primero Datos (abajo),
  después Lógica y por último Interfaz (arriba).
- RF-4: CUANDO una placa llega a su posición, EL SISTEMA la destacará con un
  destello.
- RF-5: CUANDO una placa llega a su posición, EL SISTEMA marcará su capa como
  completada en la lista de la sección.
- RF-6: MIENTRAS el visitante mantiene pulsado y el ensamblado no ha
  terminado, EL SISTEMA mostrará el porcentaje de avance.
- RF-7: CUANDO las tres placas han encajado, EL SISTEMA mostrará el rótulo
  «Ensamblado».
- RF-8: CUANDO las tres placas han encajado, EL SISTEMA hará pasar un reflejo
  de luz por las tres placas.
- RF-9: EL SISTEMA completará el ensamblado tras 1,7 s (±0,2 s) de pulsación
  continua.
- RF-10: SI el visitante suelta antes de completar, ENTONCES EL SISTEMA
  devolverá las placas hacia su posición separada.
- RF-11: CUANDO el visitante pulsa el panel ya ensamblado, EL SISTEMA volverá
  al estado inicial para poder repetir.
- RF-12: MIENTRAS el panel tiene el foco, EL SISTEMA permitirá el mismo gesto
  manteniendo pulsada la tecla Espacio o Intro.
- RF-13: SI el sistema operativo pide menos movimiento, ENTONCES EL SISTEMA
  mostrará las placas ya ensambladas, sin animación.
- RF-14: MIENTRAS la sección no está a la vista, EL SISTEMA no ejecutará
  trabajo de animación por fotograma.
- RF-15: SI el visitante mantiene pulsado en móvil, ENTONCES EL SISTEMA no
  abrirá el menú contextual, no seleccionará texto y no desplazará la página.
- RF-19: EL SISTEMA mostrará la lista de la sección en el orden «01 Datos,
  02 Lógica, 03 Interfaz», el mismo en que encajan las placas.

### Tarjetas (páginas de proyecto)
- RF-16: EL SISTEMA mostrará las tarjetas de «Lo que construí», «Cómo
  funciona» y «Pruébalo tú» con el mismo ancho que la columna de texto, y
  alineadas con sus bordes.
- RF-17: EL SISTEMA apilará esas tarjetas una debajo de otra.
- RF-18: CUANDO la pantalla mida 720 px o más de ancho, EL SISTEMA repartirá
  la lista de puntos de cada tarjeta en dos columnas.

## Requisitos no funcionales
- Peso: el ensamblado no añade imágenes ni recursos de terceros; el aumento de
  la portada se declara en el commit (constitución, art. 7).
- Rendimiento en móvil: durante el gesto, la animación solo mueve posición,
  giro y opacidad; nada que obligue a repintar la página entera.
- Plataformas: Chrome y Safari de escritorio, Safari en iOS y Chrome en
  Android.
- A 360 px de ancho, ninguna de las dos piezas provoca desplazamiento
  horizontal.
- Idioma: textos en español.

## Casos límite
- El visitante suelta y vuelve a pulsar a mitad: el avance continúa desde
  donde esté, sin saltos.
- El dedo sale del panel mientras mantiene pulsado: el gesto sigue contando
  hasta que levanta el dedo.
- El gesto se cancela por el sistema (llamada, cambio de app): cuenta como
  soltar (RF-10).
- La preferencia de menos movimiento cambia con la página abierta: se aplica
  sin recargar.
- La sección sale de pantalla a mitad del gesto: al volver, sigue en el estado
  en que se quedó.

## Fuera de alcance
- Las propuestas B (eco del hero) y C (minimal refinado) de la página de prueba.
- Cambiar el gesto: sigue siendo mantener pulsado.
- Sonido.
- Los textos de la sección del ensamblado, salvo el orden de la lista (RF-19).
- En las páginas de proyecto: la cabecera, la captura principal, «Siguiente
  proyecto» y la llamada final conservan su anchura actual.
- El hero y el resto de secciones de la portada.

## Criterios de finalización
- `npm test` en verde.
- El validador revisa el diff contra RF-1 a RF-19.
- Revisión manual en el preview de Vercel de la rama, en escritorio y en un
  móvil real, del flujo completo: pulsar, soltar a mitad, completar, repetir,
  y con teclado.
- Las tres páginas de proyecto revisadas a 360 px y en escritorio.

## Dudas abiertas
Ninguna. Resuelta el 23/09/2026: la lista se reordena a «01 Datos, 02 Lógica,
03 Interfaz» (RF-19).

## Estado
Aprobada por el usuario el 23/09/2026.
