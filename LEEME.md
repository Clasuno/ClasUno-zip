# Plataforma de clases particulares — web nueva (maqueta navegable)

Hecha desde cero el 26-nov-2026. No reutiliza nada visual del boceto morado. Nombre y logo **en blanco** (hueco discontinuo en la cabecera y el pie).

## Concepto vigente (versión 3, 26-nov noche): asistente con IA
Pedido: «futurista, con funciones de IA increíbles, moderno, pero que no parezca hecho con IA; para familias y alumnos».
Lo futurista está en lo que hace, no en la decoración: nada de brillos, degradados, cristal, chispas ✨ ni fondos oscuros con luces.
- Letra Geist, fondo casi blanco, tinta casi negra y un azul propio (#2346F5). Mapa real (Leaflet + Esri) y fotos reales de Unsplash.
- Portada (`index.html`), todo se puede probar:
  1. **Escríbelo con tus palabras** (o dictado por voz): el asistente enseña lo que ha entendido (curso, asignatura, barrio, días, presupuesto…) y propone 3 profes con el % de encaje y el porqué, en el mapa.
  2. **Foto del examen**: marca los fallos, los agrupa por tipo y dice por dónde empezar.
  3. **Plan hasta el examen**: semana a semana, con clases y estudio solo y un simulacro al final.
  4. **Nota de voz → resumen**: el profe habla 30 s y la familia recibe el resumen en su idioma (es, en, ro, fr, zh).
  5. **Ayuda entre clases**: un tutor que da pistas sin hacer los deberes; la familia y el profe ven en qué se ha atascado.
- `buscar.html`: barra para escribir con tus palabras, que rellena los filtros (también con `?q=`).
- `panel.html`, familia: pestaña **Asistente** (preguntas sobre cómo va, qué le cuesta, próxima clase, gasto del mes, plan para un examen), aviso cuando un fallo se repite y **resumen del mes** en Informes. Profe: **Preparar clase** (lo que ha practicado el alumno, propuesta de 60 min y ejercicios generados al momento con soluciones), **informe dictado por voz** y **respuestas sugeridas** en solicitudes y chat.
- Todo está simulado en el navegador (`assets/ia.js`, reglas). En la versión real lo haría la API de Claude con los mismos datos.

## Modelo de negocio
1. **Sin cuotas** para nadie: buscar, escribir y tener perfil es gratis.
2. **Comisión que baja** por cada pareja profe–familia: 15 % (clases 1–5), 10 % (6–20), 5 % (21+). Quedarse dentro sale más barato que irse por fuera.
3. **Grupos de portal**: 2–4 alumnos del mismo barrio y curso. Precio por alumno: 70 % (2), 58 % (3), 50 % (4) del individual → la familia paga menos y el profe gana más por hora.
4. **Primera clase a prueba**: si no encaja (aviso en 24 h) se devuelve el dinero; el profe cobra el 50 %, que pone la plataforma.
5. Bonos de 10 clases con un 5 % menos. Cancelación gratis hasta 24 h antes.
6. Confianza: videollamada con cada profe + certificado negativo de delitos sexuales (obligatorio con menores). No se guarda DNI ni copias.
7. Informe para la familia después de cada clase (bien / cuesta / siguiente).

## Páginas (`web/`)
| Página | Qué hace |
|---|---|
| `index.html` | Portada con plano interactivo, sellos, ruta, calculadora de grupos y de comisión, carrusel |
| `buscar.html` | Filtros + lista + plano sincronizados, orden por cercanía, favoritos |
| `profe.html?id=…` | Ficha del profe, zona aproximada, reseñas y reserva (prueba, suelta, bono, grupo) con horario |
| `guardados.html` | Profes guardados (pestaña «♥ Guardados» de la cabecera, con contador). Cada tarjeta de profe se puede pulsar entera para ir a su ficha y lleva «Ver perfil», «Escribir a…» (abre el chat del panel) y «♡ Guardar» |
| `grupos.html` | Tablón de grupos abiertos, unirse, proponer grupo |
| `como-se-paga.html` | Recibo interactivo, comparativa, cancelaciones |
| `dar-clases.html` | Calculadora de ingresos del profe a 6 meses, requisitos |
| `alta-profe.html` | Alta en 7 pasos con vista previa en vivo, foto, titulación, barrio en el plano, horario, certificado y videollamada |
| `entrar.html` | Entrar / crear cuenta familiar con hijos |
| `panel.html` | Panel de familia (clases, chat, informes, favoritos, pagos) y de profe (`?rol=profe`: solicitudes, informe, alumnos y tramo de comisión, ingresos) |
| `ayuda.html`, `legal.html` | Preguntas con buscador, seguridad, contacto, borrador legal |

Todo funciona con **datos de ejemplo** (`assets/datos.js`) y `localStorage`. Falta conectarlo a Supabase (las tablas ya existen) y a un sistema de pagos (Stripe Connect encaja con la comisión variable).

## Ver en local
Desde Claude: servidor `clasuno-web` (puerto 8130) en `.claude/launch.json` de este repositorio.

## Supabase (conectado el 26-nov-2026)
Proyecto `zlugjjcoatjdvvepilhx` (organización Clasuno). La web usa la clave pública (publishable) en `web/assets/supa.js`; la seguridad la ponen las reglas RLS.

**Qué hay conectado:** registro y entrada de familias (`entrar.html`), alta de profes con foto al bucket `avatars` (`alta-profe.html`), profes aprobados en portada, buscador y fichas, favoritos, petición de clases con precio y comisión calculados en la base de datos, grupos de portal (unirse y proponer), soporte, y en el panel: clases, solicitudes (aceptar/rechazar), informes, ingresos y chat en tiempo real.
**Sin datos o sin conexión** la web sigue con los datos de ejemplo (el pie dice «Datos de ejemplo» o «Datos en directo»).

**Pasos pendientes en Supabase (los hace el dueño, en el panel web):**
1. SQL Editor → pegar `supabase/1-conectar-web.sql` → Run. Crea: coordenadas de barrios, Francés/Economía/Adultos, `profes_publicos()`, `guardar_perfil_profe()`, tablas `clases`, `informes`, `grupos`, `grupo_miembros`, `grupo_propuestas` con RLS, y tiempo real en `clases`.
2. Authentication → URL Configuration: añadir `http://localhost:8130/**` (y luego el dominio real) en Redirect URLs.
3. Mientras se prueba: Authentication → Sign In / Providers → Email → desactivar «Confirm email» (el correo gratuito de Supabase manda muy pocos al día). Volver a activarlo antes de abrir al público, con un SMTP propio.
4. Para que un profe salga en la web: aprobarlo con `select set_teacher_status('<uuid>', '<estado aprobado>');` siendo admin, y marcar `certificado = true` cuando se haya visto el certificado.

**Falta:** pasarela de pago (Stripe Connect para la comisión variable), reseñas, y conectar el asistente a la API de Claude (hoy son reglas en el navegador).
