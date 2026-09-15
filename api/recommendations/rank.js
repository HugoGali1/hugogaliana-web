/**
 * POST /api/recommendations/rank
 *
 * Port del endpoint homónimo del backend NestJS de Top Note, para que la demo
 * pública funcione sin desplegar el servidor entero. Mismo contrato:
 *   body:     { query, filters?, candidates: [...] }
 *   respuesta { results: [{ id, score, reasoning }] }
 *
 * El prefiltrado de candidatos lo hace el cliente; aquí solo se re-rankea con
 * Gemini. La clave vive en process.env.GEMINI_API_KEY y nunca llega al
 * navegador.
 *
 * Fuente del original:
 *   server/src/recommendations/recommendations.service.ts
 *   server/src/gemini/gemini.service.ts
 *
 * Límite de uso: best-effort. El contador vive en memoria del proceso, así que
 * cada instancia lleva su cuenta y se pierde en los arranques en frío. Para un
 * límite real hace falta un almacén compartido (Redis del marketplace de Vercel,
 * o Vercel BotID delante del endpoint). Mientras tanto, el techo de verdad es el
 * límite de gasto de la propia cuenta de Google.
 */

const MODEL = 'gemini-2.5-flash-lite';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_IP = 5;
const MAX_PER_INSTANCE = 400;
const MAX_CANDIDATES = 120;
const UPSTREAM_TIMEOUT_MS = 55000;
/* Lo que se le manda al modelo lo escribe el cliente, y al modelo se le paga por
   token. Sin estos topes bastaba un curl con la cabecera Origin correcta y 120
   candidatos inflados para escribir un prompt de varios megas a nuestra cuenta.
   Los numeros salen del catalogo real: la consulta mas larga de los ejemplos no
   llega a 60 caracteres y ninguna piramide olfativa pasa de 12 notas. */
const MAX_QUERY_CHARS = 400;
/* el id mas largo del catalogo real mide 86 caracteres */
const MAX_ID_CHARS = 120;
const MAX_TEXTO = 80;
const MAX_LISTA = 12;

const ALLOWED_HOSTS = new Set([
  'hugogaliana.com',
  'www.hugogaliana.com',
  'localhost',
  '127.0.0.1',
]);

/** @type {Map<string, number[]>} */
const hits = new Map();
let instanceTotal = 0;

function clientIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length) return xff.split(',')[0].trim();
  return req.headers['x-real-ip'] || 'desconocida';
}

function originAllowed(req) {
  const raw = req.headers.origin || req.headers.referer;
  if (!raw) return false;
  try {
    const host = new URL(raw).hostname;
    return ALLOWED_HOSTS.has(host) || host.endsWith('.vercel.app');
  } catch {
    return false;
  }
}

function underLimit(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_IP) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      const alive = v.filter((t) => now - t < WINDOW_MS);
      if (alive.length) hits.set(k, alive);
      else hits.delete(k);
    }
  }
  return true;
}

const SYSTEM = `Eres un perfumista profesional con 20 años de experiencia. Tu trabajo es seleccionar entre 6 y 8 fragancias del subconjunto dado que MEJOR encajen con la petición del usuario.

PROCESO MENTAL (interno):
1. Extrae el INTENTO del usuario:
   - OCASIÓN (oficina/diario/casual, noche/evento, cita romántica, deporte, viaje…)
   - MOOD (dulce, fresco, intenso, elegante, discreto, sensual, misterioso…)
   - TEMPORADA implícita (verano→fresco/acuático, invierno→cálido/gourmand/amaderado…)
   - GÉNERO o estilo
   - REFERENCIAS a perfumes conocidos ("como X", "parecido a Y", "menos común que Z")
   - RESTRICCIONES negativas ("sin vainilla", "que no sea fuerte", "menos popular")
2. Para cada candidato evalúa el FIT contra cada dimensión:
   - ¿Sus acordes y pirámide olfativa encajan con el mood?
   - ¿Su perfil sirve para la ocasión solicitada? (oficina ≠ noche)
   - ¿Concuerda con la temporada y género?
   - Si hay referencia, ¿comparte ADN olfativo (no marca)?
3. Penaliza los que solo coinciden por una palabra pero el perfil global NO encaja.
4. Selecciona 6-8 con FIT real (mínimo 4 si los candidatos son flojos). Variedad mejor que repetición.

SCORING (0-100):
- 90-100: encaja en todas las dimensiones principales.
- 75-89: encaja muy bien en mood + ocasión.
- 60-74: match parcial defendible.
- < 55: NO lo incluyas.

REASONING:
- 2-3 frases en español natural y elegante. Tono editorial de revista.
- ESPECÍFICO: nombra notas/acordes concretos y conéctalos al intento.
- Si el usuario mencionó otro perfume, explica el paralelismo olfativo.
- Prohibido: "aroma único", "perfecto para ti", "esencia cautivadora", propaganda genérica.

OTRAS REGLAS:
- rating (0-10) y rating_count son priors SECUNDARIOS. No descartes joyas nicho.
- Los filtros duros (familia/género/temporada) ya están aplicados.
- Diversifica casas si puedes: evita 4 de 5 de la misma marca salvo que sea claramente lo mejor.

Devuelve un array JSON ordenado de mayor a menor score. Sin texto adicional.`;

const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      id: { type: 'STRING' },
      score: { type: 'INTEGER' },
      reasoning: { type: 'STRING' },
    },
    required: ['id', 'score', 'reasoning'],
  },
};

/* Cada campo entra recortado: lo que llega es de fuera y acaba en el prompt. */
function texto(v, max = MAX_TEXTO) {
  return typeof v === 'string' && v ? v.slice(0, max) : undefined;
}
function lista(v, max = MAX_LISTA) {
  if (!Array.isArray(v)) return undefined;
  const out = v.slice(0, max).map((x) => texto(String(x), 40)).filter(Boolean);
  return out.length ? out : undefined;
}
function numero(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function compactNotas(n) {
  if (!n || typeof n !== 'object' || Array.isArray(n)) return undefined;
  const out = {};
  for (const k of ['salida', 'corazon', 'corazón', 'fondo', 'base']) {
    const v = lista(n[k]);
    if (v) out[texto(k, 20)] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

function compactCandidate(c) {
  return {
    /* El id NO se recorta como el resto: es la unica llave que une lo que
       devuelve el modelo con el catalogo. A 40 caracteres se cortaban 543 de
       los 5.000 perfumes --los de id largo, 'pf_calvin_klein_ck_one_...'--, el
       modelo devolvia el id recortado y parseRanked lo descartaba contra
       validIds. Se perdia el 11% de las recomendaciones en silencio. */
    id: texto(c.id, MAX_ID_CHARS),
    nombre: texto(c.nombre),
    casa: texto(c.casa),
    'año': numero(c.ano !== undefined ? c.ano : c['año']),
    notas: compactNotas(c.notas),
    familia: texto(c.familia, 40),
    acordes: lista(c.acordes),
    temporada: typeof c.temporada === 'string' ? texto(c.temporada, 40) : lista(c.temporada),
    genero: texto(c.genero, 20),
    rating: numero(c.rating),
    rating_count: numero(c.rating_count),
    similares_a: lista(c.similares_a, 6),
  };
}

/** Mismo parseo tolerante que el servicio original: repara truncados y filtra ids. */
function parseRanked(raw, validIds) {
  let s = String(raw).trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  const m = s.match(/\[[\s\S]*\]/);
  if (m) s = m[0];

  let parsed;
  try {
    parsed = JSON.parse(s);
  } catch {
    const last = s.lastIndexOf('}');
    if (last > 0) {
      try {
        parsed = JSON.parse(s.slice(0, last + 1) + ']');
      } catch {
        return null;
      }
    } else {
      return null;
    }
  }
  if (!Array.isArray(parsed)) {
    const arr = Object.values(parsed || {}).find((v) => Array.isArray(v));
    parsed = arr || [];
  }
  return parsed
    .filter((r) => r && typeof r.id === 'string' && validIds.has(r.id))
    .map((r) => ({
      id: r.id,
      score: Math.max(0, Math.min(100, Math.round(Number(r.score) || 0))),
      reasoning: String(r.reasoning || '').trim(),
    }))
    .slice(0, 8);
}

module.exports = async function handler(req, res) {
  res.setHeader('cache-control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    return res.status(405).json({ message: 'Solo se admite POST.' });
  }
  if (!originAllowed(req)) {
    return res.status(403).json({ message: 'Origen no permitido.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[rank] falta GEMINI_API_KEY');
    return res.status(503).json({
      message: 'El perfumista no está configurado ahora mismo.',
    });
  }
  if (instanceTotal >= MAX_PER_INSTANCE) {
    return res.status(429).json({ message: 'La demo ha alcanzado su cupo. Inténtalo más tarde.' });
  }

  const ip = clientIp(req);
  if (!underLimit(ip)) {
    return res.status(429).json({
      message: `Límite de la demo: ${MAX_PER_IP} búsquedas cada 10 minutos. Espera un poco.`,
    });
  }

  let dto = req.body;
  if (typeof dto === 'string') {
    try {
      dto = JSON.parse(dto);
    } catch {
      return res.status(400).json({ message: 'JSON inválido.' });
    }
  }
  if (!dto || typeof dto.query !== 'string' || !dto.query.trim()) {
    return res.status(400).json({ message: 'Falta la consulta.' });
  }
  if (dto.query.length > MAX_QUERY_CHARS) {
    return res.status(400).json({
      message: `Describe lo que buscas en menos de ${MAX_QUERY_CHARS} caracteres.`,
    });
  }
  if (!Array.isArray(dto.candidates) || dto.candidates.length === 0) {
    return res.status(400).json({ message: 'No hay candidatos para rankear.' });
  }

  const candidates = dto.candidates.slice(0, MAX_CANDIDATES);
  const compact = candidates.map(compactCandidate);
  const validIds = new Set(candidates.map((c) => c.id));

  const user = `PETICIÓN DEL USUARIO:
"${dto.query}"

FILTROS UI (ya aplicados, contexto):
${JSON.stringify(dto.filters || {}).slice(0, 500)}

CANDIDATOS PRE-FILTRADOS (${compact.length}):
${JSON.stringify(compact)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let upstream;
  try {
    upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.4,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMA,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    const aborted = e && e.name === 'AbortError';
    console.error('[rank] fallo de red', aborted ? 'timeout' : e);
    return res.status(504).json({
      message: aborted
        ? 'El perfumista ha tardado demasiado. Prueba otra vez.'
        : 'No se ha podido contactar con el modelo.',
    });
  }
  clearTimeout(timer);

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    console.error('[rank] upstream', upstream.status, detail.slice(0, 500));
    if (upstream.status === 429) {
      return res.status(429).json({ message: 'Cuota del modelo agotada. Inténtalo en unos minutos.' });
    }
    if (upstream.status >= 500) {
      return res.status(503).json({ message: 'El modelo está saturado. Espera 1-2 minutos.' });
    }
    return res.status(502).json({ message: 'El perfumista no ha podido responder.' });
  }

  instanceTotal++;

  const data = await upstream.json().catch(() => null);
  const parts = (data && data.candidates && data.candidates[0]
    && data.candidates[0].content && data.candidates[0].content.parts) || [];
  const text = parts.map((p) => p.text || '').join('');
  if (!text) {
    console.error('[rank] respuesta vacía');
    return res.status(502).json({ message: 'El modelo ha devuelto una respuesta vacía.' });
  }

  const results = parseRanked(text, validIds);
  if (results === null) {
    console.error('[rank] respuesta no parseable:', text.slice(0, 300));
    return res.status(502).json({ message: 'Respuesta del modelo no parseable.' });
  }

  return res.status(200).json({ results });
};
