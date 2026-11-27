# Corrector de deberes con IA (función `corregir-deberes`)

La web (`web/deberes.html` y la portada) manda las fotos a esta función de Supabase, que se las pasa a Claude y devuelve la corrección. **La clave de Claude vive solo en Supabase**, nunca en la web ni en GitHub.

Mientras la función no esté activada, la web funciona igual con una **hoja de ejemplo** ya corregida y avisa de que es un ejemplo.

## Activarla (una vez, unos 10 minutos, desde el navegador)

1. **Clave de Claude.** En <https://platform.claude.com> → *API keys* → *Create key*. Cópiala (empieza por `sk-ant-`). No la pegues en el chat ni en GitHub.
2. **Guardarla en Supabase.** Proyecto `zlugjjcoatjdvvepilhx` → *Edge Functions* → *Secrets* → *Add new secret*:
   - Nombre: `ANTHROPIC_API_KEY` · Valor: la clave del paso 1.
   - (Opcional) `ALLOWED_ORIGINS` = las direcciones desde las que se puede usar, separadas por comas, p. ej. `https://clasuno.com,http://localhost:8130`. Si no se pone, se acepta cualquiera.
3. **Crear la función.** *Edge Functions* → *Deploy a new function* → *Via Editor*:
   - Nombre: `corregir-deberes` (exactamente así).
   - Pegar el contenido de `index.ts` de esta carpeta y pulsar *Deploy*.
4. **Quitar «Verify JWT».** En la función → *Details* (o *Settings*) → desactivar *Enforce JWT verification* / *Verify JWT*. La web usa la clave pública nueva (`sb_publishable_…`), que no es un JWT; la protección la ponen los límites de abajo.
5. Probar en la web: *Corregir deberes* → subir una foto. El aviso «Ejemplo» desaparece cuando contesta la IA de verdad.

Con la CLI de Supabase (alternativa): `supabase functions deploy corregir-deberes --no-verify-jwt` y `supabase secrets set ANTHROPIC_API_KEY=…`.

## Qué hace

- **Modo `corregir`**: 1–3 fotos (JPG/PNG/WEBP, la web las reduce a 1600 px) y/o texto. Claude resuelve cada ejercicio desde cero, compara con lo del alumno y devuelve JSON con: estado de cada ejercicio, el paso exacto donde falla, por qué, una pista, la explicación paso a paso, la solución, fallos agrupados por tipo, por dónde empezar, qué hace bien, 2–3 ejercicios de práctica y un mensaje para la familia.
- **Modo `pregunta`**: chat de tutor sobre un ejercicio («no entiendo el paso 2»), respuestas cortas.
- Modelo: `claude-opus-5-5`, esfuerzo `high` al corregir y `low` al responder preguntas. Activado `fallbacks: "default"` (si un filtro de seguridad rechaza una foto por error, otro modelo termina la respuesta).

## Límites y coste

- Por IP: 12 correcciones y 60 preguntas por hora (se reinicia si la función se reinicia). Máximo 3 fotos por corrección.
- Coste aproximado con Claude Opus 5.5 ($4 por millón de tokens de entrada, $20 de salida): una hoja (≈4.000 tokens de entrada y 4.000–8.000 de salida contando el razonamiento) sale por unos **10–20 céntimos de dólar**; una pregunta del chat, 1–2 céntimos. Para abaratarlo: bajar `effort` a `"medium"` en `corregir()` (algo menos fino con las cuentas largas). El gasto real se ve en platform.claude.com → *Usage*, y conviene poner allí un límite de gasto mensual.
- Las fotos no se guardan: solo pasan por la función hacia Claude.
- En los registros de la función (*Logs*) se apunta solo cuántas fotos y tokens ha usado cada corrección.
