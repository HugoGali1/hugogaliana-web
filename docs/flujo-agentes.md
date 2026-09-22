# Flujo de trabajo con agentes

Cómo se reparte el trabajo entre agentes, sean de Claude o de Codex. Las
reglas del proyecto están en `AGENTS.md`; aquí solo el ciclo, los roles y qué
modelo usar en cada uno. Copiado de Pieza a Pieza el 22/09/2026 y adaptado a
este repo.

## Ciclo

Analizar → especificar → aprobar → implementar → validar. No se saltan fases
ni se mezclan tareas independientes. Separar planificación, implementación y
validación evita que una hipótesis llegue a producción sin comprobar.

1. El orquestador lee `AGENTS.md`, `docs/constitution.md`, la spec activa,
   `CONTEXTO.md`, el estado de Git y los archivos afectados (por partes,
   según la tabla de `AGENTS.md`).
2. Si hace falta, lanza hasta dos investigadores en paralelo y en solo
   lectura: uno para código y pruebas, otro para contenido, datos o
   documentación.
3. El orquestador propone una sola tarea con sus límites, archivos
   previsibles, riesgos y comprobaciones. Si el comportamiento es nuevo, se
   redacta antes la spec (skill `spec-generator`, con entrevista) y se espera
   aprobación explícita.
4. Un único implementador ejecuta la tarea aprobada. No amplía alcance ni
   edita `topnote/app.js` a mano. Si el plan no se sostiene, se detiene y
   devuelve el hallazgo al orquestador.
5. El implementador pasa `npm test`; si tocó la demo, recompila y revisa el
   diff de `topnote/app.js`.
6. El validador, siempre distinto de quien implementó, comprueba el diff
   contra la spec y las pruebas. Si algo falla, informa; no improvisa una
   solución.
7. El orquestador comunica el resultado y para. Un commit por tarea, con su
   casilla marcada `[x]` en el `tasks.md` de la spec. La siguiente tarea
   empieza cuando el usuario lo dice.
8. Al cerrar la spec: subir la rama, revisar el preview de Vercel y, solo
   entonces, fusionar en `main` (producción).

## Roles y modelos

| Rol | Principal | Reserva | Entrega |
|---|---|---|---|
| Orquestador | Claude Opus, alto; conversación principal | Codex `gpt-6-astra`, alto; si no está, `gpt-5.6-sol`, alto | Tarea acotada y verificable |
| Redactor de spec | Claude Opus, alto; entrevista con `spec-generator` | Codex `gpt-6-astra`, alto; misma skill en `.agents/skills/spec-generator` | Spec con EARS pendiente de aprobación |
| Investigador | Codex `gpt-5.6-terra`, medio, solo lectura | Subagente `investigador` de Claude: Haiku; Sonnet si cruza muchas fuentes | Hechos con rutas, impacto y dudas abiertas |
| Implementador | Codex `gpt-5.6-sol`, medio; alto si toca la API o la demo | Subagente `implementador` de Claude: Sonnet; Opus si toca la API o la demo | Cambio mínimo, pruebas y diff revisado |
| Validador | Subagente `validador` de Claude, Sonnet | Codex `gpt-5.6-luna`, solo lectura; el orquestador pasa las pruebas | Pruebas y revisión contra la spec |

El orquestador y el redactor de spec son la conversación principal de Claude.
Los subagentes de Claude están en `.claude/agents/` y los de Codex, con el
mismo encargo, en `.codex/agents/`. Cada principal tiene una reserva de la
otra suscripción.

### Relevo por falta de cuota

El relevo se activa cuando el principal falla por límite de uso. En Claude es
el error «You've hit your session limit» (HTTP 429, `rate_limit`), que puede
cortar al subagente a mitad; en Codex, el aviso de límite de uso o que termine
sin escribir su archivo de respuesta.

1. El orquestador revisa lo que dejó el principal con `git status` y
   `git diff`.
2. Decide si la reserva parte de ese trabajo, tras revisarlo, o de un árbol
   limpio.
3. Le da el mismo encargo y añade en qué punto se quedó el anterior.

El validador nunca es el mismo agente que implementó: si implementa la reserva
de Claude, valida Codex, y al revés. Si quien agota la cuota es el orquestador,
el usuario abre Codex en el checkout y le pide retomar. `AGENTS.md`, este
documento, `CONTEXTO.md` y el `tasks.md` de la spec activa le dan todo lo
necesario, por lo que deben estar siempre al día.

### Cómo lanzar a Codex

Codex se lanza en una pestaña visible de Orca dentro del worktree de la tarea,
que debe estar registrado en Orca:

```powershell
orca worktree create --repo path:<repo> --name <tarea> --base-branch main --setup run --no-parent --json
orca terminal create --worktree path:<worktree> --title "Codex - <tarea>" --command "powershell -ExecutionPolicy Bypass -File <script>.ps1" --focus
```

El script lee el encargo de un archivo y ejecuta, dentro de ese worktree:

```powershell
$OutputEncoding = [System.Text.UTF8Encoding]::new($false)
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
Get-Content -Raw -Encoding UTF8 <archivo-de-encargo> | codex exec -C <worktree> -m <modelo> -c model_reasoning_effort="<esfuerzo>" -s workspace-write -o <archivo-de-respuesta> -
```

Las dos primeras líneas hacen falta en Windows PowerShell 5.1: sin ellas, las
tildes del encargo llegan a Codex estropeadas. El orquestador espera a que
aparezca el archivo de respuesta —o usa `orca terminal wait`— y lo lee. La
carpeta se pasa con `-C`, no mediante `cd`.

## Paralelismo

- Solo se paralelizan labores de lectura: investigación, auditoría de impacto
  y revisión de contenido.
- Nunca dos agentes editan el mismo árbol de trabajo, ni se cambian a la vez
  `index.html`, `topnote/src/app.jsx`, la API o `vercel.json` de un mismo
  cambio.
- No se recompila la demo mientras otro agente modifica `topnote/src/app.jsx`.

## Worktrees con Orca

Orca abre cada tarea en su propio worktree de git, en una rama aparte. Así
dos agentes nunca editan el mismo árbol, pero las reglas de paralelismo
siguen valiendo: dos tareas que tocan `index.html` chocarán al fusionar,
porque la portada entera vive en ese archivo.

- Un worktree por tarea aprobada. Al terminar y validar, se fusiona en la
  rama de la spec y se archiva el worktree.
- `orca.yaml` instala `node_modules` en cada worktree nuevo y el agente
  espera a que termine.
- Cada rama subida genera su propio preview en Vercel: es la forma de ver
  una tarea desplegada sin tocar producción.

### Conflictos en `topnote/app.js` al fusionar

`topnote/app.js` está en git pero es producto. Si dos ramas lo recompilaron,
chocará siempre. No se resuelve a mano:

1. Se resuelven solo los conflictos de `topnote/src/app.jsx`.
2. Se recompila con `npm run build:topnote`: rehace `app.js` entero, marcas
   de conflicto incluidas.
3. Se añade el resultado (`git add topnote/app.js`) y se pasa `npm test`
   antes de cerrar la fusión.

## Esfuerzo y gasto de tokens

- Bajo: búsqueda puntual, inventario, comprobación mecánica.
- Medio: investigación acotada, cambio de contenido, revisión de un diff.
- Alto: diseño de una spec, cambios en la API o en la demo, caché y
  cabeceras de `vercel.json`, validación, fallos difíciles en navegador.

El esfuerzo se sube por complejidad e impacto, no por el tamaño del archivo.
El modelo caro se reserva para planificar y decidir; lo mecánico va al
barato. Cada encargo nombra los archivos y tramos concretos que hay que leer,
para que el agente no explore a ciegas. `index.html`, `app.jsx` y el catálogo
de perfumes no se abren nunca enteros.

## Plantillas de encargo

### Investigación

> Trabaja solo en lectura. Lee la constitución, la spec activa y los archivos
> indicados (los grandes, por partes). Devuelve: hechos observables con
> rutas, impacto sobre pruebas, riesgos, y preguntas que bloqueen una
> decisión. No edites archivos ni propongas funcionalidades fuera del alcance.

### Implementación

> Implementa únicamente la tarea aprobada: [tarea]. Alcance: [límites].
> Criterios: [RF o comprobaciones]. Archivos: [rutas y tramos]. No edites
> `topnote/app.js` a mano. Al final, una vez, `npm test` y, si tocaste la
> demo, `npm run build:topnote` con revisión del diff. No hagas commit.
> Reporta el diff y cualquier bloqueo.

### Validación

> No edites archivos. Revisa el diff de [tarea] contra [spec]. Pasa
> `npm test` y verifica lo compilado cuando corresponda. Devuelve solo
> hallazgos reproducibles, con ruta, evidencia y severidad. Si no hay
> hallazgos, indica las comprobaciones realizadas.
