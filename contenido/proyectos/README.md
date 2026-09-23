# Cómo añadir un proyecto

Un archivo por proyecto en esta carpeta, con extensión `.md`. Después:

```bash
npm run build:proyectos
```

Si algo está mal, el comando no genera nada y dice el archivo y el dato exactos.

## El archivo

```markdown
---
titulo: Top Note
identificador: top-note
descripcion: Buscador de perfumes en lenguaje natural que recomienda con razones.
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

El primer párrafo del apartado.

Un segundo párrafo, separado por una línea en blanco.

## Cómo funciona

Lo que haga falta contar.
```

## Las claves

| Clave | Obligatoria | Qué es |
|---|---|---|
| `titulo` | sí | El nombre del proyecto. |
| `identificador` | sí | Su dirección: `/proyectos/<identificador>`. Minúsculas sin tildes, números y guiones. |
| `descripcion` | sí | Una frase para la tarjeta. |
| `fecha` | sí | Un año (`2026`) o un mes (`2026-03`). Ordena la portada. |
| `categoria` | sí | Web, App, IA… Se muestra en la tarjeta. |
| `imagen` | sí | Nombre del archivo dentro de `assets/`. |
| `alt` | no | Descripción de la imagen para quien no la ve. |
| `papel` | no | Qué hiciste tú en el proyecto. |
| `estado` | no | En producción, demo pública, archivado… |
| `tecnologias` | no | Separadas por comas. |
| `demo` | no | Enlace a la web o la demo. |
| `codigo` | no | Enlace al repositorio. Si es privado, se deja fuera. |
| `destacado` | no | `si` para la tarjeta grande. Solo puede haber uno. |
| `borrador` | no | `si` para que no se publique todavía. |

## El caso de estudio

Lo que va debajo del segundo `---`. Cada apartado empieza por `## Título` y
lleva al menos un párrafo; salen en la página en el mismo orden en que los
escribes, numerados y con un índice al lado en escritorio.

Un párrafo que **empieza** en negrita sale como un punto destacado: la frase
en negrita hace de titular y el resto de explicación, en una fila aparte. Va
bien para «problemas que resolví» o «decisiones que tomé»:

```markdown
**Las recomendaciones desaparecían.** Al preparar los candidatos, el
identificador se recortaba a 40 caracteres...
```

La negrita en mitad de un párrafo se queda como negrita normal.

Es opcional: un archivo sin nada debajo publica solo la tarjeta, que enlazará a
la demo o, si no hay, al código.

## Lo que hace fallar al comando

- Falta una clave obligatoria.
- Dos proyectos con el mismo `identificador`.
- Más de un proyecto `destacado`.
- La imagen no existe en `assets/`.
- El identificador choca con una ruta del sitio (`topnote`, `privacidad`,
  `buffet`, `proyectos`, `api`, `assets`, `index`, `404`, `sitemap`, `robots`).
- El identificador lleva mayúsculas, tildes o espacios.
- Un apartado del caso de estudio se queda sin texto.

> Esta carpeta no se publica: está excluida en `.vercelignore`. Lo que llega a
> la web es lo que genera el comando.
