# Spec 003 — PiezaxPieza en el portfolio

## Contexto y objetivo
PiezaxPieza es una web de comparativas y guías de compra de componentes de
PC, pensada para el programa de afiliados de Amazon. Hoy se publica como demo
sin enlaces de afiliado en un subdominio de esta web. Es el proyecto más
trabajado de Hugo después de su TFG: todas sus páginas se generan a partir de
un catálogo de datos con fuente, se prueba en un navegador real y se ha
desarrollado spec a spec con agentes de IA. Sin embargo, el portfolio no lo
muestra.

El objetivo es presentarlo como segundo proyecto destacado, con su página
propia y un enlace a la demo, contando qué es y cómo está hecho sin enlazar al
código, que sigue siendo privado.

## Usuarios / actores
- Persona de una empresa que evalúa a Hugo para contratarlo (público
  principal, como en la spec 002).
- Visitante que llega a ver un proyecto concreto.

## Historias de usuario
- H1: Como persona que contrata quiero ver un segundo proyecto de peso junto
  al TFG para comprobar que Hugo construye más allá de lo académico.
- H2: Como persona que contrata quiero entender cómo está hecho PiezaxPieza
  (datos, generador, pruebas y método) aunque su código no sea público.
- H3: Como visitante quiero probar la demo de PiezaxPieza desde el portfolio.

## Requisitos funcionales (criterios de aceptación en EARS)

### Portada
- RF-1: EL SISTEMA mostrará PiezaxPieza en la sección de proyectos como un
  bloque destacado con el mismo formato que el de Brasa y Ascuas.
- RF-2: EL SISTEMA colocará el bloque de PiezaxPieza inmediatamente después
  del de Brasa y Ascuas.
- RF-3: EL SISTEMA mantendrá las tarjetas de Aperture y Top Note después de
  los dos bloques destacados.
- RF-4: EL SISTEMA mantendrá a Brasa y Ascuas como el único proyecto rotulado
  como «Proyecto principal».
- RF-5: EL SISTEMA mostrará en el bloque de PiezaxPieza capturas de la demo
  publicada.
- RF-6: EL SISTEMA enlazará desde el bloque de PiezaxPieza a su página propia.
- RF-7: EL SISTEMA enlazará desde el bloque de PiezaxPieza a la demo en
  `https://piezaxpieza.hugogaliana.com`.
- RF-8: EL SISTEMA no mencionará en la entradilla de la sección de proyectos
  un número de proyectos distinto del que se muestra en ella.

### Página propia
- RF-9: EL SISTEMA servirá una página propia de PiezaxPieza en
  `/proyectos/piezaxpieza`, con la misma estructura y el mismo estilo que las
  demás páginas de proyecto.
- RF-10: EL SISTEMA explicará en esa página que PiezaxPieza es una web de
  comparativas y guías de compra de componentes de PC pensada para el
  programa de afiliados de Amazon.
- RF-11: EL SISTEMA explicará en esa página que la demo publicada no lleva
  enlaces de afiliado.
- RF-12: EL SISTEMA explicará en esa página que todas las páginas de la web
  se generan a partir de un único catálogo de datos.
- RF-13: EL SISTEMA explicará en esa página que el generador no publica nada
  si el catálogo tiene un error.
- RF-14: EL SISTEMA explicará en esa página que las especificaciones salen de
  fuentes oficiales y de laboratorios de análisis, citadas en cada ficha.
- RF-15: EL SISTEMA explicará en esa página que un dato que no se puede
  verificar se muestra como «—» en lugar de estimarse.
- RF-16: EL SISTEMA explicará en esa página que las notas de los componentes
  se calculan con la misma fórmula para toda una categoría.
- RF-17: EL SISTEMA describirá en esa página lo que puede hacer quien visita
  la demo: comparar componentes lado a lado, ordenarlos, ver sus notas en
  gráficos y leer guías de compra.
- RF-18: EL SISTEMA explicará en esa página que la web se prueba en un
  navegador real antes de publicarse.
- RF-19: EL SISTEMA explicará en esa página que el proyecto se desarrolló con
  specs y agentes de IA, con el mismo método que describe la sección «Cómo
  trabajo» de la portada.
- RF-20: EL SISTEMA solo dará en esa página cifras (componentes, categorías,
  páginas, pruebas o specs) que coincidan con el repositorio de PiezaxPieza en
  la fecha en que se implemente.
- RF-21: EL SISTEMA enlazará desde esa página a la demo en
  `https://piezaxpieza.hugogaliana.com`.
- RF-22: EL SISTEMA dará a esa página su propio título, descripción,
  dirección canónica y metadatos para compartir en redes, como las demás
  páginas de proyecto.

### Lo que no se dice ni se enlaza
- RF-23: EL SISTEMA no dirá en ninguna página que PiezaxPieza está aparcado,
  parado o abandonado.
- RF-24: EL SISTEMA no enlazará al código de PiezaxPieza desde ninguna
  página.
- RF-25: EL SISTEMA no invitará a comprobar en el código nada de lo que
  cuenta sobre PiezaxPieza.
- RF-26: EL SISTEMA no incluirá una etiqueta de afiliado en ningún enlace a
  Amazon.

### Navegación entre proyectos
- RF-27: EL SISTEMA encadenará el enlace al siguiente proyecto, al final de
  cada página de proyecto, en el orden de la portada: Brasa y Ascuas →
  PiezaxPieza → Aperture → Top Note → Brasa y Ascuas.
- RF-28: EL SISTEMA incluirá PiezaxPieza en la lista de proyectos del pie de
  la portada y de cada página de proyecto.
- RF-29: EL SISTEMA declarará la página de PiezaxPieza en el mapa del sitio.

## Requisitos no funcionales
- Idioma: contenido en español, como el resto del sitio.
- Peso: cada captura nueva pesará como máximo 90 KB, en línea con las
  actuales (de 76 a 88 KB), y declarará su tamaño en el commit (constitución,
  principio 7).
- Sin dependencias ni recursos de terceros nuevos: las capturas se
  autohospedan.
- Móvil: el bloque destacado y la página propia se verán sin desplazamiento
  horizontal a 360 px de ancho.
- Accesibilidad: la jerarquía de titulares sigue sin saltos (un solo H1 por
  página y secciones con H2).
- Privacidad: no cambia. La demo es un sitio aparte, como la de Brasa y
  Ascuas, y no carga analítica ni recursos de terceros (comprobado el
  29/09/2026: solo tiene enlaces salientes).

## Casos límite
- El subdominio de la demo no resuelve todavía, porque falta el CNAME en el
  DNS: se puede trabajar y revisar el preview igualmente, pero no se fusiona
  en `main` hasta que responda (ver criterios de finalización).
- La demo muestra una franja de «Proyecto en desarrollo · Demo sin enlaces de
  afiliado». Puede aparecer en las capturas: es cierta y no contradice RF-23.
- Si en el futuro el repositorio pasa a ser público, añadir el enlace al
  código será un cambio aparte (RF-7 y RF-28 de la spec 002).
- Las cifras del proyecto pueden cambiar si se retoma: la página refleja las
  de la fecha de implementación (RF-20), no se actualizan solas.

## Fuera de alcance
- Hacer público el repositorio de PiezaxPieza o enlazar su código.
- Cualquier cambio en PiezaxPieza o en su demo, incluida su franja superior.
- Crear el CNAME en el DNS: lo hace Hugo en IONOS.
- La versión con afiliación y el dominio `piezaxpieza.es`.
- Cambios en los bloques y tarjetas de los otros proyectos, salvo el enlace
  al siguiente proyecto y el pie (RF-27 y RF-28).
- Cambios en la sección «Cómo trabajo», el hero, el ensamblado o el contacto.
- Los metadatos y los datos estructurados de la portada.
- La página 404 y la de privacidad.

## Criterios de finalización
- `https://piezaxpieza.hugogaliana.com` responde 200 sin sesión iniciada
  antes de fusionar en `main`.
- Cada RF comprobado en el preview de la rama, en escritorio y a 360 px.
- Las cifras de la página cotejadas con el repositorio de PiezaxPieza.
- Ninguna página publicada contiene un enlace a
  `github.com/HugoGali1/piezaxpieza` ni la etiqueta de afiliado (búsqueda en
  los HTML).
- `npm test` en verde.
- Aprobación de Hugo sobre los textos finales en el preview antes de fusionar
  en `main`.

## Dudas abiertas
- Ninguna. Los textos concretos (etiqueta del bloque, titulares y cuerpo de
  la página) se proponen en la implementación y se aprueban en el preview,
  como en la spec 002.

## Estado
Aprobada por el usuario el 29/09/2026.
