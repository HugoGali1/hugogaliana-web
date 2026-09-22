# Specs

Una carpeta por funcionalidad: `specs/NNN-nombre-en-kebab-case/`, con número
de tres dígitos correlativo (la primera es la 001).

- `spec.md`: el contrato. Se redacta con la skill `spec-generator`, siempre
  con su entrevista, y no se implementa nada hasta que se aprueba.
  Requisitos en notación EARS (RF-1, RF-2…), sección «Fuera de alcance»
  obligatoria.
- `tasks.md`: las tareas de la spec, una cada vez. Cada tarea cerrada se marca
  `[x]` dentro de su propio commit.

La spec activa es la de número más alto con tareas abiertas. El ciclo
completo está en `docs/flujo-agentes.md`.
