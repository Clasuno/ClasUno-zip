# ClasUno — reglas para trabajar en este repositorio

Plataforma de clases particulares (profes y familias, Madrid). Web estática en `web/` + Supabase. Lee `LEEME.md` para el detalle del producto y del modelo de negocio.

## Reglas (obligatorias)
1. **Antes de tocar nada, trae lo último de GitHub**: `git pull` en `main`. Trabajan dos cuentas sobre este mismo repositorio; si no, se pisan los cambios.
2. **Sube los cambios directamente a `main`** (`git add`, `git commit`, `git push`), sin ramas ni pull requests. Cada push se publica solo en la beta.
3. **No trabajes nunca en la carpeta `iberail`** ni en ningún otro proyecto de `Aa - carpeta-agencia`. Es otro negocio. No se lee, no se copia, no se edita.
4. **Contraseñas y claves nunca en el chat ni en GitHub**: ni la contraseña de la base de datos, ni la clave `service_role`, ni archivos `.env`. La única clave que puede ir en el código es la pública (`sb_publishable_…`) de `web/assets/supa.js`.
5. No se pasan zips: todo va por el repositorio.

## Estructura
- `web/` — la web (HTML + `assets/` con CSS y JS). Es lo que se publica.
- `soon/` — página «próximamente».
- `supabase/` — SQL de la base de datos (`0-base-clasuno.sql`, `1-conectar-web.sql`…). Cualquier cambio que se haga en Supabase se anota aquí también.
- `supabase/functions/` — funciones de Supabase (Deno). `corregir-deberes` llama a Claude para el corrector de deberes; la clave `ANTHROPIC_API_KEY` va solo en los *Secrets* de Supabase, nunca en el código.
- `marca/` — iconos del logo.

## Ver en local
Servidor `clasuno-web` (puerto 8130) en `.claude/launch.json`. Usa `.claude/servidor-local.ps1` (PowerShell, no hace falta Node ni Python).

## Subida automática a GitHub
`.claude/subir-cambios.ps1` sube a `main` lo que haya cambiado (trae antes lo del compañero con `pull --rebase`; si choca, no fuerza nada y avisa). Nunca sube `.env` ni los ajustes personales.
Se activa por ordenador con un hook «Stop» en `.claude/settings.local.json` (no va a GitHub), y entonces se ejecuta solo al terminar cada turno de Claude. Para activarlo en otro ordenador Windows, pedir a Claude: «activa la subida automática a GitHub».

## Supabase
Proyecto `zlugjjcoatjdvvepilhx` (organización Clasuno). La seguridad la ponen las reglas RLS.
- **Pendiente antes de abrir al público:** volver a activar «Confirm email» (Authentication → Sign In / Providers → Email) con un SMTP propio.

## Cuentas de prueba
- Profe: «Laura Prueba Profe» (`profe.prueba@clasuno.com`), aprobada, Chamberí, Matemáticas y Física.
- Familia: «Marta Prueba Familia» (`familia.prueba@clasuno.com`), hijo Lucas, 3º ESO, Chamberí.
- Profe 2: «Javier Ortega Prueba Profe» (`profe2.prueba@clasuno.com`), Física y Química y Matemáticas, ESO y Bachillerato, Chamberí, 20 €/h. Creado el 28-nov-2026, **pendiente de aprobar** (no sale en el buscador hasta aprobarlo).
Las contraseñas no se apuntan aquí.
