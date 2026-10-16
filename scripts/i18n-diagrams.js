#!/usr/bin/env node
// Builds the Spanish diagrams (docs/diagrams/es/*.svg) from the English sources in docs/diagrams/.
// The English SVGs stay the single source for layout and animation; this file only holds text.
// Every entry must match exactly once, so an edited English label fails loudly instead of
// silently shipping a stale translation.
//
//   node scripts/i18n-diagrams.js          write docs/diagrams/es/
//   node scripts/i18n-diagrams.js --check  exit 1 if docs/diagrams/es/ is out of date

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'docs', 'diagrams');
const OUT = path.join(SRC, 'es');

// [english, spanish] pairs, replaced as whole text nodes (>text<) or attribute/desc values.
const ES = {
  'hero.svg': [
    ['aria-label="Noah Core: get the most out of Claude Code without wasting tokens"', 'aria-label="Noah Core: saca todo el provecho a Claude Code sin malgastar tokens"'],
    ['<desc>Animated hero: noisy context flows into Noah Core and comes out lean, with four pillars: lean context, summary-first output, smallest complete change, short honest replies.</desc>',
      '<desc>Portada animada: el contexto ruidoso entra en Noah Core y sale limpio, con cuatro pilares: contexto mínimo, resumen primero, cambio mínimo completo y respuestas cortas y honestas.</desc>'],
    ['>full test logs<', '>logs de tests completos<'],
    ['>whole-file reads<', '>lecturas de archivos enteros<'],
    ['>re-runs · narration · bloat<', '>repeticiones · narración · relleno<'],
    ['>~1.2k tokens<', '>~1,2k tokens<'],
    ['>lean context · done right<', '>contexto mínimo · bien hecho<'],
    ['>Get the most out of Claude Code without wasting tokens<', '>Saca todo el provecho a Claude Code sin malgastar tokens<'],
    ['>Lean context<', '>Contexto mínimo<'],
    ['>Summary-first output<', '>Resumen primero<'],
    ['>Smallest complete change<', '>Cambio mínimo completo<'],
    ['>Short, honest replies<', '>Respuesta corta y honesta<'],
  ],
  'session-flow.svg': [
    ['aria-label="How Noah Core loads: SessionStart and SubagentStart hooks"', 'aria-label="Cómo se carga Noah Core: hooks SessionStart y SubagentStart"'],
    ['<desc>Animated flow: at session start the hook reads SKILL.md, adds either the Graphify note or the regex codebase map, and injects it into Claude. Subagents get only the context and output rules. Sub-skills load on demand.</desc>',
      '<desc>Flujo animado: al iniciar la sesión, el hook lee SKILL.md, añade la nota de Graphify o el mapa del código por regex y lo inyecta en Claude. Los subagentes reciben solo las reglas de contexto y salida. Las sub-skills se cargan bajo demanda.</desc>'],
    ['>Session starts<', '>Inicia la sesión<'],
    ['>reads skills/noah-core/SKILL.md<', '>lee skills/noah-core/SKILL.md<'],
    ['>level: NOAH_LEVEL (lite/full/ultra)<', '>nivel: NOAH_LEVEL (lite/full/ultra)<'],
    ['>Graphify graph fresh?<', '>¿Grafo de Graphify al día?<'],
    ['>→ "use graphify query"<', '>→ "usa graphify query"<'],
    ['>Otherwise<', '>Si no<'],
    ['>→ codebase map ≤2000 chars<', '>→ mapa del código ≤2000 car.<'],
    ['>rules + map in context<', '>reglas + mapa en contexto<'],
    ['>Subagents<', '>Subagentes<'],
    ['>SubagentStart → sections 1-2 only<', '>SubagentStart → solo secciones 1-2<'],
    ['>Loaded only when needed<', '>Se cargan solo al usarlas<'],
    ['>~225-480 tokens each<', '>~225-480 tokens cada una<'],
  ],
  'summary-first.svg': [
    ['aria-label="Summary first, detail on demand"', 'aria-label="Resumen primero, detalle bajo demanda"'],
    ['<desc>Animated funnel: a large tool output is reduced to a short summary using quiet flags, failures only, or saving to a file and reading it with grep or tail; only the needed detail reaches the context.</desc>',
      '<desc>Embudo animado: una salida grande se reduce a un resumen corto con flags silenciosos, solo fallos, o guardándola en un archivo y leyéndola con grep o tail; al contexto solo llega el detalle necesario.</desc>'],
    ['>Summary first, detail on demand<', '>Resumen primero, detalle bajo demanda<'],
    ['>10,000 lines<', '>10.000 líneas<'],
    ['>failures only<', '>solo fallos<'],
    ['>Truncated output is incomplete: read the saved file in pieces, never re-run the producer.<', '>Una salida truncada está incompleta: lee el archivo guardado por partes, no relances el comando.<'],
    ['>Never repeat an identical command unless an input changed. Max 3 attempts per failure.<', '>No repitas un comando idéntico si no ha cambiado nada. Máximo 3 intentos por fallo.<'],
  ],
  'smallest-change.svg': [
    ['aria-label="The smallest complete change ladder"', 'aria-label="La escalera del cambio mínimo completo"'],
    ['<desc>Animated ladder: a highlight walks down four steps (does it need to exist, already in the codebase, standard library or platform, minimum new code) and stops at the first that works. A guard rail lists what is never cut.</desc>',
      '<desc>Escalera animada: un resaltado baja por cuatro pasos (¿hace falta?, ¿ya existe en el código?, ¿librería estándar o plataforma?, mínimo código nuevo) y se queda en el primero que funciona. Al lado, lo que nunca se recorta.</desc>'],
    ['>The smallest complete change<', '>El cambio mínimo completo<'],
    ['>Take the first step that fully works. Lazy about the solution, never about completeness.<', '>Toma el primer paso que funcione del todo. Vago con la solución, nunca con terminarla.<'],
    ['>Does it need to exist?<', '>¿Hace falta que exista?<'],
    ['>skip unrequested features, options, "for later" code: name them in one line<', '>omite features, opciones y código "para luego" no pedidos: nómbralos en una línea<'],
    ['>Already in this codebase?<', '>¿Ya existe en el código?<'],
    ['>check the codebase map, reuse the helper the way the surrounding code does<', '>mira el mapa del código y reutiliza el helper como lo usa el código de alrededor<'],
    ['>Standard library or platform?<', '>¿Librería estándar o plataforma?<'],
    ['>never add a dependency for a few lines<', '>nunca añadas una dependencia por unas pocas líneas<'],
    ['>Minimum new code<', '>Mínimo código nuevo<'],
    ['>existing style and structure · update every caller, test and fixture it touches<', '>estilo y estructura existentes · actualiza cada llamador, test y fixture afectado<'],
    ['>Never cut<', '>Nunca recortar<'],
    ['>✓ validation at trust boundaries<', '>✓ validar entradas externas<'],
    ['>✓ error handling vs data loss<', '>✓ errores que evitan perder datos<'],
    ['>✓ security<', '>✓ seguridad<'],
    ['>✓ accessibility<', '>✓ accesibilidad<'],
    ['>✓ anything the user asked for<', '>✓ todo lo que pidió el usuario<'],
    ['>shortcut: &lt;limit&gt;, &lt;when to upgrade&gt;<', '>shortcut: &lt;límite&gt;, &lt;cuándo mejorar&gt;<'],
  ],
  'graphify-adapter.svg': [
    ['aria-label="Graphify adapter decision"', 'aria-label="Decisión del adaptador de Graphify"'],
    ['<desc>Animated decision path: if graphify-out/graph.json exists and the graphify CLI is on PATH and the graph is newer than the last commit, Claude uses graphify query and skips the regex map. If the graph is stale, Claude prefers grep. Otherwise Noah stays silent about Graphify and injects the regex map.</desc>',
      '<desc>Decisión animada: si existe graphify-out/graph.json, el comando graphify está en el PATH y el grafo es más nuevo que el último commit, Claude usa graphify query y se omite el mapa por regex. Si el grafo está desfasado, Claude usa grep. Si no, Noah no menciona Graphify e inyecta el mapa por regex.</desc>'],
    ['>Graphify adapter: zero cost unless you use it<', '>Adaptador de Graphify: coste cero si no lo usas<'],
    ['>graph.json exists<', '>existe graph.json<'],
    ['>CLI on PATH<', '>CLI en el PATH<'],
    ['>Newer than<', '>¿Más nuevo que<'],
    ['>last commit?<', '>el último commit?<'],
    ['>Fresh → query the graph<', '>Al día → consulta el grafo<'],
    ['>regex map skipped<', '>sin mapa por regex<'],
    ['>Stale → prefer grep<', '>Desfasado → usa grep<'],
    ['>suggest graphify update .<', '>sugiere graphify update .<'],
    ['>No → silent + regex map<', '>No → silencio + mapa regex<'],
  ],
  'lineage.svg': [
    ['aria-label="What Noah Core takes from each project"', 'aria-label="Qué toma Noah Core de cada proyecto"'],
    ['<desc>Animated lineage: six source projects (Karpathy guidelines, Ponytail, OmniRoute, Graphify, agent-skills, REA) each contribute one idea that flows into Noah Core.</desc>',
      '<desc>Origen animado: seis proyectos (pautas de Karpathy, Ponytail, OmniRoute, Graphify, agent-skills y REA) aportan cada uno una idea que fluye hacia Noah Core.</desc>'],
    ['>surgical changes<', '>cambios quirúrgicos<'],
    ['>surface assumptions<', '>suposiciones explícitas<'],
    ['>smallest change ladder<', '>escalera cambio mínimo<'],
    ['>hooks · codebase map<', '>hooks · mapa del código<'],
    ['>filter tool output<', '>filtrar salidas<'],
    ['>cache-safe, terse prose<', '>prosa breve, caché ok<'],
    ['>query, don\'t grep<', '>consulta, no grep<'],
    ['>plan slices · review<', '>pasos · revisión<'],
    ['>handoff · evals<', '>traspaso · evals<'],
    ['>summary first<', '>resumen primero<'],
    ['>no identical re-runs<', '>sin repetir comandos<'],
  ],
};

function translate(file, text) {
  for (const [en, es] of ES[file]) {
    const n = text.split(en).length - 1;
    if (n !== 1) throw new Error(`${file}: expected 1 match for ${JSON.stringify(en)}, found ${n}`);
    text = text.replace(en, () => es);
  }
  return text.replace('<svg ', '<svg xml:lang="es" ');
}

function build() {
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.svg'));
  const missing = files.filter((f) => !ES[f]);
  if (missing.length) throw new Error(`no Spanish text for: ${missing.join(', ')}`);
  return Object.fromEntries(files.map((f) => [f, translate(f, fs.readFileSync(path.join(SRC, f), 'utf8'))]));
}

module.exports = { build };

if (require.main === module) {
  const out = build();
  if (process.argv.includes('--check')) {
    const stale = Object.keys(out).filter((f) => {
      try { return fs.readFileSync(path.join(OUT, f), 'utf8') !== out[f]; } catch (e) { return true; }
    });
    if (stale.length) { console.error(`out of date: ${stale.join(', ')} (run node scripts/i18n-diagrams.js)`); process.exit(1); }
    console.log('Spanish diagrams up to date');
  } else {
    fs.mkdirSync(OUT, { recursive: true });
    for (const [f, svg] of Object.entries(out)) fs.writeFileSync(path.join(OUT, f), svg);
    console.log(`wrote ${Object.keys(out).length} diagrams to docs/diagrams/es/`);
  }
}
