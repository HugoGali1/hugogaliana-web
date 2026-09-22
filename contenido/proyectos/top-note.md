---
titulo: Top Note
identificador: top-note
descripcion: Buscador de perfumes en el que describes lo que buscas con tus palabras y la IA recomienda con razones.
fecha: 2026
categoria: IA
imagen: shot-topnote.jpg
alt: Buscador Top Note con una búsqueda escrita en lenguaje natural
papel: Diseño y desarrollo completos
estado: Demo pública
tecnologias: React, Three.js, Framer Motion, Gemini, Vercel
demo: https://hugogaliana.com/topnote
codigo: https://github.com/HugoGali1/topnote
destacado: si
---

## Qué es

Un buscador sobre un catálogo de 30.000 perfumes. En lugar de filtrar por marca
o por familia olfativa, escribes algo como «algo fresco para el verano, que no
sea dulce» y te devuelve una selección con el motivo de cada recomendación.

La demo pública trabaja con 5.000 de ellos. La misma idea sirve para cualquier
catálogo grande en el que el cliente no sabe el nombre de lo que quiere.

## Cómo funciona

El catálogo se filtra en el propio navegador y se eligen hasta 120 candidatos.
Esos candidatos, junto con la búsqueda escrita, viajan a una función sin
servidor, que es quien habla con el modelo: la clave de la IA nunca llega al
dispositivo del visitante.

El modelo ordena los candidatos y explica por qué encaja cada uno. La respuesta
se cruza con el catálogo antes de pintarla, de forma que un perfume que el
modelo se invente no llega a la pantalla.

## Problemas que resolví

**Las recomendaciones desaparecían.** Al preparar los candidatos, el
identificador de cada perfume se recortaba a 40 caracteres para ahorrar tamaño,
pero 543 de los 5.000 lo tienen más largo. La respuesta volvía con
identificadores recortados, no casaba con el catálogo y se descartaba entera.
Medido antes y después: de 8 recomendaciones sobrevivían 0; ahora sobreviven 8.

**La página cargaba un compilador entero.** El navegador descargaba y ejecutaba
2,87 MB de Babel en cada visita para traducir el código de la interfaz. Ahora esa
traducción se hace una sola vez antes de publicar y lo que llega al visitante son
136 KB ya compilados.

**Cada búsqueda cuesta dinero.** Un modelo se paga por texto enviado, y el texto
lo escribe quien busca. Puse un tope por dirección IP, otro por instancia y un
límite al tamaño de lo que se manda al modelo, para que nadie pueda disparar la
factura con un script.

## Qué mejoraría

El catálogo pesa 3,4 MB y se descarga entero antes de poder buscar nada. El
siguiente paso es partirlo en un índice ligero, con lo justo para buscar, y
cargar el detalle de cada perfume solo cuando se abre.
