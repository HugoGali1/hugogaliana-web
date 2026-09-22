# spec-generator — instalación

La skill es una carpeta autocontenida con dos ficheros: `SKILL.md` (las
instrucciones, con frontmatter YAML) y `spec-template.md` (la plantilla).
El contenido es agnóstico de la herramienta; solo cambia dónde se coloca.

## Dónde vive en este proyecto

- Claude Code la lee de `.claude/skills/spec-generator/`.
- Codex la lee de `.agents/skills/spec-generator/`.

Son dos copias idénticas porque cada herramienta solo mira su carpeta. Se
editan las dos a la vez; `npm test` falla si dejan de ser iguales.

Para tenerla en todos tus proyectos de Claude Code:

```bash
cp -R .claude/skills/spec-generator ~/.claude/skills/
```

Se activa sola cuando pides una spec, o a mano con `/spec-generator`.
