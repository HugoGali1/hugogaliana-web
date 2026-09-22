# Constitución — hugogaliana.com

Principios innegociables. Toda spec, plan y tarea debe cumplirlos.

> **Borrador** redactado a partir de `CONTEXTO.md` y del estado del repo el
> 22/09/2026. Revísalo antes de la primera spec: lo que no te represente, se
> cambia aquí y no en cada spec.

1. **Estático por defecto**: el sitio se sirve tal cual, sin build en el
   despliegue. La única excepción es la demo de Top Note, que se compila en
   local (`npm run build:topnote`) y se commitea. Añadir otro paso de
   construcción exige una spec previa.
2. **La spec manda**: ningún comportamiento se implementa si no está en la
   spec activa. Si falta una decisión, se detiene el trabajo y se pregunta.
3. **Lo generado no se edita a mano**: `topnote/app.js` sale siempre de
   `topnote/src/app.jsx`. Quien cambie uno sin el otro rompe el principio.
4. **Solo se publica el sitio**: documentación, specs, agentes, pruebas y
   herramientas de construcción quedan fuera del despliegue
   (`.vercelignore`). Verificable: ninguno de esos archivos responde 200 en el
   preview.
5. **Privacidad que dice la verdad**: sin cookies ni banner. Cualquier cambio
   que añada analítica, formularios o envío de datos actualiza
   `privacidad.html` en el mismo cambio.
6. **Secretos fuera del repo**: las claves privadas viven en variables de
   entorno de Vercel y nunca llegan al navegador. Lo que es público por
   diseño (la clave de Web3Forms) se documenta como tal.
7. **Peso medido**: todo recurso nuevo o cambiado en la portada o en la demo
   declara su tamaño en la spec o en el commit. No se añaden recursos de
   terceros sin una spec que justifique no autohospedarlos.
8. **Producción es `main`**: nada llega a `main` sin haberse visto en el
   preview de su rama.
9. **Tests como puerta**: cada tarea termina con `npm test` en verde.
   Prohibido avanzar con tests en rojo.
10. **Idioma**: código e identificadores en inglés; contenido, comentarios,
    mensajes y documentación en español.
