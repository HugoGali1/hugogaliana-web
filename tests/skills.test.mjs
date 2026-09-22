/**
 * Skills compartidas entre Claude y Codex.
 *
 * Codex lee las skills de .agents/skills/ y Claude las de .claude/skills/.
 * Son la misma skill en dos sitios porque cada herramienta solo mira el suyo;
 * si se edita una copia y no la otra, cada agente trabajaria con una
 * plantilla distinta. Esta prueba falla en cuanto dejan de ser identicas.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const CODEX = join(raiz, '.agents', 'skills');
const CLAUDE = join(raiz, '.claude', 'skills');

/* ruta relativa (con /) -> contenido de cada archivo bajo base */
function files(base) {
  const out = new Map();
  for (const entry of readdirSync(base, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const path = join(entry.parentPath, entry.name);
    out.set(relative(base, path).split(sep).join('/'), readFileSync(path));
  }
  return out;
}

test('las skills de Claude y Codex son identicas', () => {
  const codex = files(CODEX);
  const claude = files(CLAUDE);
  assert.ok(codex.size > 0, 'no hay skills en .agents/skills/');
  assert.deepEqual([...codex.keys()].sort(), [...claude.keys()].sort(),
    'las dos carpetas no tienen los mismos archivos');
  const different = [...codex.keys()].filter((p) => !codex.get(p).equals(claude.get(p)));
  assert.deepEqual(different, [],
    `contenido distinto entre .agents/skills y .claude/skills: ${different}`);
});
