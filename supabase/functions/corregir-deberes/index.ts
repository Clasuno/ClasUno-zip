// ClasUno · Corrector de deberes con Claude (Supabase Edge Function, Deno)
//
// La web nunca ve la clave de Claude: la llama esta función, que la lee del secreto
// ANTHROPIC_API_KEY de Supabase. Dos modos:
//   · «corregir»: recibe 1–3 fotos (o el texto de un ejercicio) y devuelve la corrección
//     ejercicio a ejercicio en JSON (estado, dónde falla, por qué, pista, pasos, práctica…).
//   · «pregunta»: chat de tutor sobre un ejercicio concreto («no entiendo el paso 2»).
//
// Cómo se despliega: supabase/functions/corregir-deberes/LEEME.md

import Anthropic from "npm:@anthropic-ai/sdk";

const MODELO = "claude-opus-5-5";
const anthropic = new Anthropic(); // lee ANTHROPIC_API_KEY del entorno

// ---------- Límites (para que nadie gaste la cuenta desde fuera) ----------
const MAX_IMAGENES = 3;
const MAX_BYTES_IMAGEN = 3_500_000; // base64 ≈ 2,6 MB de imagen; la web ya las reduce a ~400 KB
const MAX_TEXTO = 4000;
const LIMITE_HORA = { corregir: 12, pregunta: 60 }; // por IP y hora
const usos = new Map<string, number[]>();

function dentroDelLimite(ip: string, modo: "corregir" | "pregunta"): boolean {
  const clave = `${modo}:${ip}`, ahora = Date.now();
  const lista = (usos.get(clave) ?? []).filter((t) => ahora - t < 3_600_000);
  if (lista.length >= LIMITE_HORA[modo]) { usos.set(clave, lista); return false; }
  lista.push(ahora); usos.set(clave, lista);
  return true;
}

// ---------- CORS ----------
const ORIGENES = (Deno.env.get("ALLOWED_ORIGINS") ?? "*").split(",").map((s) => s.trim()).filter(Boolean);
function cabeceras(origen: string | null): HeadersInit {
  const permitido = ORIGENES.includes("*") ? "*" : (origen && ORIGENES.includes(origen) ? origen : ORIGENES[0]);
  return {
    "Access-Control-Allow-Origin": permitido,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json; charset=utf-8",
  };
}
const responder = (cuerpo: unknown, estado: number, origen: string | null) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: cabeceras(origen) });

// ---------- Instrucciones para Claude ----------
const SISTEMA_CORREGIR = `Eres el corrector de deberes de ClasUno, una plataforma de clases particulares en Madrid. Corriges deberes y exámenes de alumnos de Primaria, ESO, Bachillerato y FP en España (currículo LOMLOE) a partir de fotos o del texto que escriben.

Cómo trabajas:
1. Lee la hoja entera. Identifica cada ejercicio con el número o letra que tenga en la hoja (si no tiene, numéralos 1, 2, 3… en orden de lectura). Transcribe el enunciado y lo que ha escrito el alumno tal cual, sin arreglarlo.
2. Resuelve tú cada ejercicio desde cero antes de juzgarlo. No te fíes de las cuentas del alumno: rehaz cada paso. Cuando se pueda, comprueba el resultado (sustituir la solución en la ecuación, revisar unidades, releer la regla gramatical…).
3. Decide el estado de cada ejercicio:
   - "bien": el resultado y el procedimiento son correctos (puede haber un detalle menor que comentes en «por_que»).
   - "mal": hay al menos un error que cambia el resultado o el procedimiento es incorrecto.
   - "incompleto": va bien pero lo deja a medias.
   - "sin_hacer": no hay respuesta.
   - "ilegible": no se puede leer con seguridad. Nunca te inventes lo que no se lee.
4. En los ejercicios con fallo, señala el paso exacto donde se equivoca («donde_falla», copiando esa línea), explica por qué en una o dos frases («por_que»), da una pista que le acerque sin darle la solución («pista») y después la explicación completa en pasos cortos («pasos»), uno por línea, terminando en el resultado correcto («solucion»).
5. Pon a cada fallo un «tipo_error» corto y reutilizable (p. ej. «Signo al pasar términos», «Propiedad distributiva», «Concordancia sujeto-verbo», «Unidades»). Usa exactamente el mismo texto cuando el mismo fallo se repite en varios ejercicios: así se ve qué es lo que más se repite.
6. En «tipos_error», agrupa los fallos por tipo (de más a menos frecuente), con los ejercicios donde aparece y una explicación de la idea que falla.
7. «por_donde_empezar»: lo primero que debería repasar y por qué, en dos o tres frases. Si casi todo está bien, dilo y propón el siguiente paso.
8. «lo_que_hace_bien»: algo concreto y verdadero que haga bien (no un elogio genérico).
9. «practica»: 2 o 3 ejercicios nuevos, parecidos y del mismo nivel, centrados en el fallo principal, con su solución breve. Si no hay fallos, ejercicios un poco más difíciles.
10. «para_la_familia»: dos frases para la madre, el padre o tutor, claras y sin tecnicismos.
11. «caja»: dónde está el ejercicio en su foto, en porcentaje del ancho y alto de la imagen (x e y de la esquina superior izquierda, w y h del tamaño), aproximado. «imagen» es el número de foto empezando en 0. Si no hay foto, caja = null.
12. Si dudas de algo (letra dudosa, enunciado cortado), dilo en «duda»; si no, deja «duda» vacío.

Cómo escribes:
- Español de España, de tú al alumno, cercano y claro, con frases cortas. Adapta el nivel al curso.
- Sin LaTeX ni Markdown. Escribe las matemáticas con símbolos normales: x², √, ·, ÷, ≠, ≤, fracciones como 3/4, potencias con ², ³.
- No repitas nombres, apellidos ni datos personales que aparezcan en la hoja.
- Si la imagen no son deberes ni un ejercicio escolar, pon es_tarea = false, explica en «mensaje» qué hace falta (una foto de la hoja de ejercicios) y deja las listas vacías.`;

const SISTEMA_TUTOR = `Eres el tutor de ClasUno. Un alumno de Primaria, ESO o Bachillerato en España te pregunta por un ejercicio que acaba de corregir. Tienes el ejercicio, su respuesta y la corrección.

- Responde a lo que pregunta, en español de España, de tú, con frases cortas y como mucho 120 palabras.
- Explica la idea con un ejemplo parecido o con el paso concreto que no entiende. Si pide la solución, dásela explicada.
- Cuando tenga sentido, termina con una pregunta corta para que lo intente él (por ejemplo, el siguiente paso).
- Sin LaTeX ni Markdown: escribe x², √, ·, ÷, fracciones como 3/4.
- Si pregunta algo que no tiene que ver con estudiar, recuérdale con amabilidad que estás para ayudarle con los deberes.`;

// ---------- Esquema de la corrección (salida estructurada) ----------
const texto = { type: "string" };
const ESQUEMA = {
  type: "object",
  additionalProperties: false,
  required: ["es_tarea", "mensaje", "asignatura", "asig_id", "curso", "tema", "resumen", "ejercicios", "tipos_error",
    "por_donde_empezar", "lo_que_hace_bien", "practica", "para_la_familia"],
  properties: {
    es_tarea: { type: "boolean" },
    mensaje: texto,
    asignatura: texto,
    asig_id: { type: "string", enum: ["mat", "ing", "fyq", "len", "pro", "mus", "bio", "his", "eco", "fra", "otra"] },
    curso: texto,
    tema: texto,
    resumen: texto,
    ejercicios: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["numero", "imagen", "caja", "enunciado", "respuesta_alumno", "estado", "solucion", "tipo_error",
          "donde_falla", "por_que", "pista", "pasos", "duda"],
        properties: {
          numero: texto,
          imagen: { type: "integer" },
          caja: {
            anyOf: [
              { type: "null" },
              {
                type: "object", additionalProperties: false, required: ["x", "y", "w", "h"],
                properties: { x: { type: "number" }, y: { type: "number" }, w: { type: "number" }, h: { type: "number" } },
              },
            ],
          },
          enunciado: texto,
          respuesta_alumno: texto,
          estado: { type: "string", enum: ["bien", "mal", "incompleto", "sin_hacer", "ilegible"] },
          solucion: texto,
          tipo_error: texto,
          donde_falla: texto,
          por_que: texto,
          pista: texto,
          pasos: { type: "array", items: texto },
          duda: texto,
        },
      },
    },
    tipos_error: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["tipo", "ejercicios", "explicacion"],
        properties: { tipo: texto, ejercicios: { type: "array", items: texto }, explicacion: texto },
      },
    },
    por_donde_empezar: texto,
    lo_que_hace_bien: texto,
    practica: {
      type: "array",
      items: {
        type: "object", additionalProperties: false, required: ["enunciado", "solucion"],
        properties: { enunciado: texto, solucion: texto },
      },
    },
    para_la_familia: texto,
  },
};

// ---------- Utilidades ----------
const TIPOS_IMAGEN = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
type TipoImagen = typeof TIPOS_IMAGEN[number];
const limpio = (s: unknown, max: number) => String(s ?? "").slice(0, max);

function textoFinal(mensaje: Anthropic.Beta.BetaMessage): string {
  return mensaje.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text").map((b) => b.text).join("");
}

// ---------- Servidor ----------
Deno.serve(async (req) => {
  const origen = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cabeceras(origen) });
  if (req.method !== "POST") return responder({ ok: false, error: "Usa POST." }, 405, origen);
  if (!Deno.env.get("ANTHROPIC_API_KEY")) return responder({ ok: false, error: "Falta configurar la clave de Claude en Supabase." }, 503, origen);

  let cuerpo: Record<string, unknown>;
  try { cuerpo = await req.json(); } catch { return responder({ ok: false, error: "Petición no válida." }, 400, origen); }

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "desconocida";
  const modo = cuerpo.modo === "pregunta" ? "pregunta" : "corregir";
  if (!dentroDelLimite(ip, modo)) {
    return responder({ ok: false, error: "Has hecho muchas consultas seguidas. Espera un rato y vuelve a probar." }, 429, origen);
  }

  try {
    if (modo === "pregunta") return responder(await preguntar(cuerpo), 200, origen);
    return responder(await corregir(cuerpo), 200, origen);
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return responder({ ok: false, error: "El corrector está muy ocupado ahora mismo. Prueba en un minuto." }, 429, origen);
    if (e instanceof Anthropic.BadRequestError) { console.error("Petición rechazada por Claude:", e.message); return responder({ ok: false, error: "No he podido leer esa foto. Prueba con otra más nítida (JPG o PNG)." }, 400, origen); }
    if (e instanceof Anthropic.AuthenticationError) { console.error("Clave de Claude no válida"); return responder({ ok: false, error: "El corrector no está bien configurado." }, 503, origen); }
    if (e instanceof Anthropic.APIError) { console.error(`Error de Claude ${e.status}:`, e.message); return responder({ ok: false, error: "El corrector ha fallado. Vuelve a intentarlo." }, 502, origen); }
    if (e instanceof EntradaNoValida) return responder({ ok: false, error: e.message }, 400, origen);
    console.error(e);
    return responder({ ok: false, error: "Algo ha fallado. Vuelve a intentarlo." }, 500, origen);
  }
});

class EntradaNoValida extends Error {}

async function corregir(c: Record<string, unknown>) {
  const imagenes = Array.isArray(c.imagenes) ? c.imagenes.slice(0, MAX_IMAGENES) : [];
  const textoAlumno = limpio(c.texto, MAX_TEXTO).trim();
  if (!imagenes.length && !textoAlumno) throw new EntradaNoValida("Sube una foto de los deberes o escribe el ejercicio.");

  const contenido: Anthropic.Beta.BetaContentBlockParam[] = [];
  imagenes.forEach((im: Record<string, unknown>, i: number) => {
    const tipo = String(im?.tipo ?? "") as TipoImagen, datos = String(im?.datos ?? "");
    if (!TIPOS_IMAGEN.includes(tipo) || !datos || datos.length > MAX_BYTES_IMAGEN || /[^A-Za-z0-9+/=]/.test(datos)) {
      throw new EntradaNoValida(`La foto ${i + 1} no es válida o es demasiado grande.`);
    }
    contenido.push({ type: "text", text: `Foto ${i} (imagen = ${i}):` });
    contenido.push({ type: "image", source: { type: "base64", media_type: tipo, data: datos } });
  });

  const curso = limpio(c.curso, 60), asignatura = limpio(c.asignatura, 60);
  const enfoque = c.enfoque === "pistas" ? "pistas" : "corregir";
  contenido.push({
    type: "text",
    text: [
      textoAlumno ? `Ejercicio(s) escritos por el alumno:\n${textoAlumno}` : "",
      curso ? `Curso que indica la familia: ${curso}.` : "Curso: dedúcelo de la hoja.",
      asignatura ? `Asignatura que indica la familia: ${asignatura}.` : "",
      enfoque === "pistas"
        ? "El alumno aún está haciendo los deberes: en «por_que» y «pista» no reveles el resultado; la solución completa va solo en «pasos» y «solucion», que la web enseña cuando él lo pide."
        : "Corrige y explica todo.",
      "Corrige estos deberes siguiendo tus instrucciones.",
    ].filter(Boolean).join("\n"),
  });

  // Streaming + finalMessage() para que una corrección larga no se corte por tiempo.
  const stream = anthropic.beta.messages.stream({
    model: MODELO,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default", // si el filtro de seguridad rechaza algo por error, otro modelo termina la respuesta
    output_config: { effort: "high", format: { type: "json_schema", schema: ESQUEMA } },
    system: SISTEMA_CORREGIR,
    messages: [{ role: "user", content: contenido }],
  });
  const mensaje = await stream.finalMessage();

  if (mensaje.stop_reason === "refusal") return { ok: false, error: "No puedo corregir esa imagen. Prueba con una foto de los ejercicios." };
  if (mensaje.stop_reason === "max_tokens") return { ok: false, error: "Hay demasiados ejercicios en una sola vez. Prueba con una hoja cada vez." };
  const resultado = JSON.parse(textoFinal(mensaje));
  console.log(JSON.stringify({ modo: "corregir", fotos: imagenes.length, entrada: mensaje.usage.input_tokens, salida: mensaje.usage.output_tokens }));
  return { ok: true, resultado, ia: true };
}

async function preguntar(c: Record<string, unknown>) {
  const pregunta = limpio(c.pregunta, 600).trim();
  if (!pregunta) throw new EntradaNoValida("Escribe tu pregunta.");
  const contexto = limpio(JSON.stringify(c.contexto ?? {}), 2000);
  const ejercicio = limpio(JSON.stringify(c.ejercicio ?? {}), 4000);
  const historial = (Array.isArray(c.historial) ? c.historial : []).slice(-10);

  const mensajes: Anthropic.Beta.BetaMessageParam[] = [{
    role: "user",
    content: `Contexto: ${contexto}\nEjercicio corregido: ${ejercicio}\n\nEl alumno va a preguntarte sobre este ejercicio.`,
  }, { role: "assistant", content: "De acuerdo. ¿Qué parte no entiendes?" }];
  for (const h of historial as Record<string, unknown>[]) {
    const t = limpio(h?.texto, 1200).trim(); if (!t) continue;
    mensajes.push({ role: h?.rol === "tutor" ? "assistant" : "user", content: t });
  }
  // El historial tiene que acabar en el turno del tutor antes de la pregunta nueva
  if (mensajes[mensajes.length - 1].role === "user") mensajes.push({ role: "assistant", content: "Vale." });
  mensajes.push({ role: "user", content: pregunta });

  const stream = anthropic.beta.messages.stream({
    model: MODELO,
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system: SISTEMA_TUTOR,
    messages: mensajes,
  });
  const mensaje = await stream.finalMessage();
  if (mensaje.stop_reason === "refusal") return { ok: false, error: "Esa pregunta no la puedo responder. Pregúntame por el ejercicio." };
  return { ok: true, respuesta: textoFinal(mensaje).trim(), ia: true };
}
