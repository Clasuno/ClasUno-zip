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
3. **Grupos de estudio**: 2–4 alumnos del mismo barrio y curso. Precio por alumno: 70 % (2), 58 % (3), 50 % (4) del individual → la familia paga menos y el profe gana más por hora.
4. **Primera clase a prueba**: si no encaja (aviso en 24 h) se devuelve el dinero; el profe cobra el 50 %, que pone la plataforma.
5. Bonos de 10 clases con un 5 % menos. Cancelación gratis hasta 24 h antes.
6. Confianza: videollamada con cada profe + certificado negativo de delitos sexuales (obligatorio con menores). No se guarda DNI ni copias.
7. Informe para la familia después de cada clase (bien / cuesta / siguiente).

## Páginas (`web/`)
| Página | Qué hace |
|---|---|
| `index.html` | Portada con plano interactivo, sellos, ruta, calculadora de grupos y de comisión, carrusel |
| `deberes.html` | **Corrector de deberes con IA** (Claude). Fotos (cámara, galería, arrastrar o pegar; hasta 3) o el ejercicio escrito, curso y modo «solo pistas». Devuelve cada ejercicio bien/mal con el paso exacto del fallo subrayado, por qué, una pista, la explicación paso a paso, chat de dudas por ejercicio, fallos agrupados por tipo, por dónde empezar, ejercicios de práctica y resumen para la familia; recuadros sobre la foto. La portada tiene una versión corta que enlaza aquí. Código común: `assets/deberes.js` (corrección) y `assets/corrector.js` (la pantalla entera, reutilizable: la usan esta página y la pestaña **Asistente IA** del panel del alumno, que además sale en la cabecera con la sesión iniciada). La IA vive en la función de Supabase `corregir-deberes` (ver `supabase/functions/corregir-deberes/LEEME.md`); sin ella, la web enseña la hoja de ejemplo `assets/ejemplos/deberes-ejemplo.jpg` ya corregida y lo avisa |
| `buscar.html` | Filtros + lista + plano sincronizados, orden por cercanía. Cada tarjeta de profe se pulsa entera para ir a su ficha y lleva «Ver perfil», «Escribir a…» y «♡ Guardar». Los guardados solo se ven en Mi panel → Mis profes (ya no hay pestaña «Guardados» en la cabecera) |
| `profe.html?id=…` | Ficha del profe, zona aproximada, reseñas y reserva (prueba, suelta, bono, grupo) con horario |
| `grupos.html` | Tablón de grupos abiertos, unirse y **crear un grupo** (público: sale en el tablón y entra cualquiera; privado: no sale y solo se entra con el enlace `grupos.html?invitacion=<código>`). Los grupos que crea una familia empiezan sin profe («Profe por asignar», precio orientativo con la mediana de los profes de esa asignatura). Bloque «Invita a otra familia» con la tarjeta y el mensaje de WhatsApp. Cada grupo enseña la escalera de precios (1–4 alumnos) y «Estás pagando X €. Si se apunta 1 más, pagas Y €», con botón **Invitar por WhatsApp** (mensaje con el precio y enlace `grupos.html?grupo=…`, que abre la página con ese grupo resaltado). Tarjeta para la vista previa del enlace: `assets/marca/compartir-grupos.jpg` (falta poner la dirección completa en `og:image` cuando haya dominio) |
| `grupo.html?id=…` | **Panel de cada grupo** (solo para sus familias y su profe): **Resumen** (quién está, profe, próxima clase, lo que pagáis), **Calendario** (una clase cada semana el día y la hora del grupo; quien lo creó o el profe cancela días sueltos o añade clases extra), **Chat** del grupo en tiempo real y **Ajustes** (público/privado, plazas, día y hora, enlace de invitación nuevo, salir o borrar). Si sale quien lo creó, el grupo pasa a la familia que lleva más tiempo |
| `como-se-paga.html` | Recibo interactivo, comparativa, cancelaciones |
| `dar-clases.html` | Calculadora de ingresos del profe a 6 meses, requisitos |
| `alta-profe.html` | Alta en 7 pasos con vista previa en vivo, foto, titulación, barrio en el plano, horario, certificado y videollamada |
| `entrar.html` | Entrar / crear cuenta familiar con hijos |
| `panel.html` | **Mi panel**, lo principal para familias y alumnos (con sesión, la cabecera enseña «Mi panel» con tu inicial, también fuera del menú en el móvil, y la portada lleva una franja «Ir a mi panel»). Familia: **Inicio** (próxima clase, accesos, los próximos 7 días, tus profes, tus grupos, último informe), **Calendario** (clases con cada profe + clases de tus grupos, con canceladas y extra), **Mis profes** (con los que tienes clases, grupos, informes o chat, y los guardados), **Mis grupos**, mensajes, informes, asistente, pagos y **Ajustes** (familia y profe: nombre y barrio, hijos con su curso o alumno adulto, cambiar correo y contraseña, avisos, tema claro/oscuro/automático, descargar mis datos, pedir el borrado de la cuenta, cerrar sesión aquí o en todos los dispositivos; el profe además ve el estado de su perfil y la nota de cobros). Los datos de la cuenta (hijos, barrio, avisos) se guardan en los metadatos de Supabase Auth. Con profes de verdad en la web, hay que entrar para verlo. Profe: **Mi perfil** (verlo como lo ven las familias y cambiarlo todo: foto, nombre, titulación, años de experiencia, asignaturas, cursos, frase, sobre ti, modalidad y barrio, precio, grupos, horario e idiomas; pausar o volver a publicar; si un profe aprobado cambia titulación o centro, vuelve a revisión), (`?rol=profe`: solicitudes, informe, alumnos y tramo de comisión, ingresos) |
| `ayuda.html`, `legal.html` | Preguntas con buscador, seguridad, contacto, borrador legal |

**Desplegables:** todos los `<select>` de la web se convierten solos (en `assets/comun.js`) en una casilla en la que se puede escribir: «cham» deja solo Chamartín y Chamberí, sin importar acentos ni mayúsculas, y «2 bach» encuentra «2º Bachillerato». El `<select>` de verdad sigue dentro, oculto, así que el resto del código no cambia. Para dejar uno normal, ponle `data-nativo`.

**Móvil y tableta (hasta 1080 px), como una app:** `assets/comun.js` pone una barra fija abajo con iconos y quita el botón «Menú» de arriba.
- Familia: Inicio · Buscar · Mensajes · Calendario · Más.
- Profe: Inicio · Mensajes · Calendario · Solicitudes (con el número de pendientes) · Más.
- Sin cuenta: Inicio · Buscar · Grupos · Asistente · Más.

«Más» abre una hoja desde abajo con el resto de secciones, tu cuenta y el tema claro/oscuro; se cierra tocando fuera, con la ✕, con Esc o arrastrándola hacia abajo. Arriba quedan el logo, la campana de avisos y tu foto (o «Entrar»). En el panel, con cuenta, desaparecen el menú lateral y el pie, y el Inicio empieza con tu foto, tu nombre, la fecha y la campana. El panel pasa el número de avisos con `U.avisos({ solicitudes, mensajes })`.

**Reseñas, chat y progreso (panel de la familia):**
- **Reseñas.** Cuando ya ha habido una clase que ha terminado con un profe, en «Hoy» sale «¿Qué tal las clases con…?» con 5 estrellas: se puntúa con un toque y luego se puede añadir un comentario (opcional). «Ahora no» la quita; desde «Mis profes» se valora o se cambia cuando se quiera. Una reseña por familia y profe. Salen en el buscador (★ nota y número de reseñas) y en la ficha del profe. Base de datos: `supabase/7-resenas.sql`.
- **Proteger la comisión.** Hasta que los dos hayan tenido la primera clase, si un mensaje del chat lleva un teléfono o un correo (también «arroba… punto com»), sale un aviso amable que explica por qué seguir en ClasUno. Se puede cambiar el mensaje o enviarlo con el dato oculto. Después de la primera clase ya no se avisa ni se oculta nada. Es un aviso del navegador: no cubre el chat de los grupos.
- **Progreso.** En Inicio («Cómo va Lucas») y en Informes, una gráfica por asignatura con la «seguridad en el tema» (1 a 5) que pone el profe en cada informe, con lo que ha subido o bajado. Al pasar el dedo o el ratón por un punto se ven la fecha y el tema. Debajo, las notas de examen de esa asignatura.

**Clases hechas, informes por voz, exámenes, notas, estadísticas y huecos:**
- **Clase hecha de verdad.** En la agenda del profe, cada clase tiene «He llegado» (en persona, desde media hora antes; la familia lo ve en su «Hoy») y «Clase terminada». Si nadie dice nada, se da por hecha 6 horas después de acabar (cada hora en Supabase con pg_cron y, por si acaso, al abrir el panel). Para una clase pasada sin marcar: «Sí, terminada» o «No se hizo» (se cancela). Una clase hecha ya no se puede cambiar. De «hecha» dependen el contador de clases, que baje la comisión y las reseñas.
- **Informe por voz.** En el inicio del profe sale «Informes por escribir» («¿Qué tal con Lucas?», también con el número en el menú). En *Escribir informe* se pulsa el micrófono y se cuenta la clase: el navegador lo pasa a texto (Chrome, Edge y Safari; en otros, se escribe o se dicta con el teclado del móvil) y la IA lo ordena en tema, qué ha ido bien, qué cuesta, qué toca y la seguridad de 1 a 5. Sin la IA activada, se reparte por frases y se avisa.
- **Exámenes.** La familia los apunta en Inicio (asignatura, fecha, tema). Salen con cuenta atrás, el profe los ve al desplegar la clase y en *Preparar clase*, y «Plan de repaso» abre el asistente con un plan hasta ese día (día a día si faltan menos de dos semanas).
- **Notas.** Después del examen, Inicio pregunta «¿Qué nota ha sacado?» (se escribe o se lee de una foto con la IA; la foto no se guarda). También «+ Nota» para cualquier nota, marcando si es de antes de empezar. Si se dice qué profe da esa asignatura, cuenta sin nombre para su **mejora media**: en su ficha sale «+1,6 puntos de media en los exámenes de sus alumnos» cuando hay al menos 3 alumnos con dos notas o más.
- **Estadísticas del profe** (menú *Estadísticas*): visitas a su ficha (30 días y por semana), familias que le escriben, solicitudes, tiempo real de respuesta (mediana de los últimos 90 días, también en su ficha en vez del «pocas horas» de antes) y consejos según su perfil (foto, «Sobre ti», huecos, certificado, grupos, reseñas, informes).
- **Avísame cuando tenga hueco.** En *Estadísticas* el profe marca «Horario completo». Su ficha lo dice y, en vez de reservar, la familia pulsa «Avísame cuando tenga hueco». Al quitarlo, a esas familias les sale en su «Hoy» «Laura ya tiene hueco».

Todo funciona con **datos de ejemplo** (`assets/datos.js`) y `localStorage`. Falta conectarlo a Supabase (las tablas ya existen) y a un sistema de pagos (Stripe Connect encaja con la comisión variable).

## Ver en local
Desde Claude: servidor `clasuno-web` (puerto 8130) en `.claude/launch.json` de este repositorio.

## Supabase (conectado el 26-nov-2026)
Proyecto `zlugjjcoatjdvvepilhx` (organización Clasuno). La web usa la clave pública (publishable) en `web/assets/supa.js`; la seguridad la ponen las reglas RLS.

**Qué hay conectado:** registro y entrada de familias (`entrar.html`), alta de profes con foto al bucket `avatars` (`alta-profe.html`), profes aprobados en portada, buscador y fichas, favoritos, petición de clases con precio y comisión calculados en la base de datos, grupos de estudio (unirse y proponer), soporte, y en el panel: clases, solicitudes (aceptar/rechazar), informes, ingresos y chat en tiempo real.
**Sin datos o sin conexión** la web sigue con los datos de ejemplo (el pie dice «Datos de ejemplo» o «Datos en directo»).

**Pasos pendientes en Supabase (los hace el dueño, en el panel web):**
1. SQL Editor → pegar `supabase/1-conectar-web.sql` → Run. Crea: coordenadas de barrios, Francés/Economía/Adultos, `profes_publicos()`, `guardar_perfil_profe()`, tablas `clases`, `informes`, `grupos`, `grupo_miembros`, `grupo_propuestas` con RLS, y tiempo real en `clases`.
2. Authentication → URL Configuration: añadir `http://localhost:8130/**` (y luego el dominio real) en Redirect URLs.
3. Mientras se prueba: Authentication → Sign In / Providers → Email → desactivar «Confirm email» (el correo gratuito de Supabase manda muy pocos al día). Volver a activarlo antes de abrir al público, con un SMTP propio.
4. ✅ Hecho el 26-nov-2026. SQL Editor → pegar `supabase/2-prueba-60-minutos.sql` → Run. Hace que la primera clase a prueba solo pueda ser de 60 minutos también en la base de datos (la web ya no deja elegir otra duración).
5. Para que un profe salga en la web: aprobarlo con `select set_teacher_status('<uuid>', '<estado aprobado>');` siendo admin, y marcar `certificado = true` cuando se haya visto el certificado.
6. ✅ Hecho el 27-nov-2026. SQL Editor → pegar `supabase/3-crear-grupos.sql` → Run. Las familias crean grupos públicos o privados (`crear_grupo`, `grupo_por_codigo`, `unirse_con_codigo`); los privados no se ven ni se puede entrar en ellos sin el código de invitación.
7. ✅ Hecho el 28-nov-2026. SQL Editor → pegar `supabase/4-panel-grupo.sql` → Run. Panel de grupo: chat (`grupo_mensajes`, en tiempo real), calendario (`grupo_sesiones`), `grupo_detalle`, `ajustar_grupo`, `nuevo_enlace_grupo`, `salir_de_grupo`. Ojo: este proyecto no da permisos automáticos a las tablas nuevas; el SQL los da con `grant`.
8. ✅ Hecho el 28-nov-2026. SQL Editor → pegar `supabase/5-mi-perfil-profe.sql` → Run. `mi_perfil_profe()` (el profe lee su perfil aunque esté pendiente o en pausa) y `guardar_perfil_profe` guarda también los años de experiencia.
9. ✅ Hecho el 28-nov-2026. SQL Editor → pegar `supabase/6-solicitudes.sql` → Run. Cada clase guarda `modalidad` (online / en persona; la base de datos no deja pedir lo que el profe no ofrece), `perfil_alumno()` (el profe ve nombre, inicial, hijos con su curso y zona de las familias que le han pedido clase o le han escrito; nunca el correo) y `abrir_chat_familia()` (el profe empieza el chat con esas familias).
10. ✅ Hecho el 28-nov-2026. SQL Editor → pegar `supabase/7-resenas.sql` → Run. Crea la tabla `resenas` (1 a 5 estrellas y comentario; la base de datos solo deja valorar después de una clase terminada y pone el nombre que se publica, «Marta P.») y amplía `profes_publicos()` con la nota media, el número de reseñas y las 20 últimas. Si se monta otra base de datos sin este paso, al puntuar sale «Falta ejecutar «7-resenas.sql» en Supabase».
11. ✅ Hecho el 28-nov-2026. SQL Editor → pegar `supabase/8-clases-hechas-notas.sql` → Run. Añade a `clases` la llegada y la hora de fin (con sus reglas) y `cerrar_clases_pasadas()` con pg_cron cada hora; tablas `examenes`, `notas`, `visitas_ficha` y `avisame`; `teacher_profiles.completo`; funciones `contar_visita`, `mis_estadisticas`, `poner_completo`, `responde_minutos`, `mejora_profe`; y `profes_publicos()` con horario completo, tiempo de respuesta, mejora media y clases hechas. El cierre automático quedó programado en pg_cron (tarea `clasuno-cerrar-clases`, a los 15 minutos de cada hora). Si se monta otra base de datos sin este paso, el panel avisa «Falta ejecutar «8-clases-hechas-notas.sql» en Supabase».

**Falta:** pasarela de pago (Stripe Connect para la comisión variable) y conectar el resto del asistente a la API de Claude (hoy son reglas en el navegador). El **corrector de deberes**, el **informe por voz** y **leer la nota de una foto** ya están hechos para Claude, en la misma función: solo falta activarla en Supabase (clave en *Secrets* + desplegar `corregir-deberes`, unos 10 minutos: `supabase/functions/corregir-deberes/LEEME.md`).
