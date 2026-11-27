/* Corrector de deberes: prepara las fotos, llama a la IA (función «corregir-deberes» de Supabase)
   y pinta la corrección. Lo usan la portada (resumen) y deberes.html (corrección completa).
   Si la función aún no está activada, enseña una hoja de ejemplo ya corregida y lo dice. */
window.Deberes = (() => {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const espera = ms => new Promise(r => setTimeout(r, ms));
  const FUNCION = 'corregir-deberes';

  /* ---------- Hoja de ejemplo (assets/ejemplos/deberes-ejemplo.jpg), corregida a mano ---------- */
  const caja = (y, w) => ({ x: 6.2, y, w, h: 6.8 });
  const EJEMPLO = {
    es_tarea: true, mensaje: '', asignatura: 'Matemáticas', asig_id: 'mat', curso: '3º ESO', tema: 'Ecuaciones de primer y segundo grado',
    resumen: 'Sabe resolver ecuaciones y usa bien la fórmula general. Casi todos los fallos vienen de los signos: al pasar términos de un lado al otro y dentro de la fórmula.',
    ejercicios: [
      { numero: '1', imagen: 0, caja: caja(15.1, 61), enunciado: '2x + 6 = 14', respuesta_alumno: '2x = 14 + 6 → 2x = 20 → x = 10', estado: 'mal', solucion: 'x = 4',
        tipo_error: 'Signo al pasar términos', donde_falla: '2x = 14 + 6',
        por_que: 'El 6 está sumando a la izquierda. Al pasarlo a la derecha tiene que pasar restando, y lo has dejado sumando.',
        pista: 'Fíjate en el +6: si está sumando en un lado, ¿cómo pasa al otro lado del igual?',
        pasos: ['Queremos dejar la x sola. Primero quitamos el +6.', 'El +6 está sumando, así que pasa restando: 2x = 14 − 6', 'Restamos: 2x = 8', 'El 2 multiplica a la x, así que pasa dividiendo: x = 8 ÷ 2', 'x = 4. Comprobación: 2·4 + 6 = 14 ✓'], duda: '' },
      { numero: '2', imagen: 0, caja: caja(26.2, 61.3), enunciado: '3(x − 2) = 12', respuesta_alumno: '3x − 6 = 12 → 3x = 18 → x = 6', estado: 'bien', solucion: 'x = 6',
        tipo_error: '', donde_falla: '', por_que: 'Has multiplicado el 3 por los dos términos del paréntesis y el −6 ha pasado sumando. Perfecto.', pista: '',
        pasos: ['Quitamos el paréntesis: 3·x − 3·2 = 12 → 3x − 6 = 12', 'El −6 pasa sumando: 3x = 18', 'x = 18 ÷ 3 = 6. Comprobación: 3·(6 − 2) = 12 ✓'], duda: '' },
      { numero: '3', imagen: 0, caja: caja(37.3, 41), enunciado: 'x/4 + 1 = 3', respuesta_alumno: 'x/4 = 2 → x = 8', estado: 'bien', solucion: 'x = 8',
        tipo_error: '', donde_falla: '', por_que: 'Bien: el 1 pasa restando y el 4, que divide, pasa multiplicando.', pista: '',
        pasos: ['El +1 pasa restando: x/4 = 3 − 1 = 2', 'El 4 está dividiendo, así que pasa multiplicando: x = 2·4 = 8', 'Comprobación: 8/4 + 1 = 3 ✓'], duda: '' },
      { numero: '4', imagen: 0, caja: caja(48.4, 68.4), enunciado: '5x − 3 = 2x + 9', respuesta_alumno: '5x + 2x = 9 − 3 → 7x = 6 → x = 6/7', estado: 'mal', solucion: 'x = 4',
        tipo_error: 'Signo al pasar términos', donde_falla: '5x + 2x = 9 − 3',
        por_que: 'Has movido dos términos y a los dos les has dejado el signo como estaba: el +2x pasa a la izquierda restando (−2x) y el −3 pasa a la derecha sumando (+3).',
        pista: 'Cada término que cambia de lado cambia de signo. ¿Cómo queda el 2x al pasar a la izquierda? ¿Y el −3 al pasar a la derecha?',
        pasos: ['Juntamos las x a la izquierda y los números a la derecha.', 'El +2x pasa a la izquierda restando: 5x − 2x', 'El −3 pasa a la derecha sumando: 9 + 3', 'Queda 3x = 12', 'x = 12 ÷ 3 = 4. Comprobación: 5·4 − 3 = 17 y 2·4 + 9 = 17 ✓'], duda: '' },
      { numero: '5', imagen: 0, caja: caja(59.6, 71.3), enunciado: 'x² − 5x + 6 = 0', respuesta_alumno: 'x = (5 ± √(25 − 24)) / 2 → x = 3, x = 2', estado: 'bien', solucion: 'x = 3, x = 2',
        tipo_error: '', donde_falla: '', por_que: 'Has sacado bien a, b y c, y has puesto bien el −b (−(−5) = 5). Está perfecto.', pista: '',
        pasos: ['a = 1, b = −5, c = 6', 'Discriminante: b² − 4ac = 25 − 24 = 1', 'x = (5 ± 1) / 2 → x = 3 o x = 2', 'Comprobación: 3² − 5·3 + 6 = 0 ✓'], duda: '' },
      { numero: '6', imagen: 0, caja: caja(70.7, 77.2), enunciado: '2x² + 3x − 2 = 0', respuesta_alumno: 'x = (−3 ± √(9 − 16)) / 4 → no tiene solución', estado: 'mal', solucion: 'x = 1/2, x = −2',
        tipo_error: 'Signos en la fórmula general', donde_falla: '√(9 − 16)',
        por_que: 'c vale −2, es negativo. En la fórmula va −4·a·c = −4·2·(−2) = +16, así que dentro de la raíz queda 9 + 16, no 9 − 16. Por ese signo te salía una raíz negativa.',
        pista: 'Escribe a, b y c con su signo antes de usar la fórmula. ¿Cuánto vale c? ¿Qué pasa al multiplicar −4 por un número negativo?',
        pasos: ['a = 2, b = 3, c = −2 (con su signo)', 'Discriminante: b² − 4ac = 9 − 4·2·(−2) = 9 + 16 = 25', '√25 = 5', 'x = (−3 ± 5) / 4', 'x = 2/4 = 1/2  o  x = −8/4 = −2', 'Comprobación con x = −2: 2·4 + 3·(−2) − 2 = 0 ✓'], duda: '' },
      { numero: '7', imagen: 0, caja: caja(81.8, 64.7), enunciado: '4(x + 1) = 2x', respuesta_alumno: '4x + 1 = 2x → 2x = −1 → x = −1/2', estado: 'mal', solucion: 'x = −2',
        tipo_error: 'Propiedad distributiva', donde_falla: '4x + 1 = 2x',
        por_que: 'El 4 multiplica a todo el paréntesis, también al 1: 4·(x + 1) = 4x + 4. Solo has multiplicado la x. Lo de después lo has hecho bien.',
        pista: 'Lo que está fuera del paréntesis multiplica a cada término de dentro. ¿Cuánto es 4·1?',
        pasos: ['Quitamos el paréntesis multiplicando el 4 por cada término: 4x + 4 = 2x', 'El 2x pasa a la izquierda restando y el 4 a la derecha restando: 4x − 2x = −4', '2x = −4', 'x = −4 ÷ 2 = −2', 'Comprobación: 4·(−2 + 1) = −4 y 2·(−2) = −4 ✓'], duda: '' }
    ],
    tipos_error: [
      { tipo: 'Signo al pasar términos', ejercicios: ['1', '4'], explicacion: 'Cuando un término cambia de lado del igual, cambia de signo: si suma pasa restando y si resta pasa sumando.' },
      { tipo: 'Signos en la fórmula general', ejercicios: ['6'], explicacion: 'Con c negativo, el −4ac se convierte en una suma. Escribir a, b y c con su signo antes de empezar lo evita.' },
      { tipo: 'Propiedad distributiva', ejercicios: ['7'], explicacion: 'El número de fuera multiplica a todos los términos del paréntesis, no solo al primero.' }
    ],
    por_donde_empezar: 'Empieza por el cambio de signo al pasar términos de un lado al otro: falla en el 1 y en el 4, y es la misma idea que se tuerce en el 6. Con 15 minutos de ejercicios cortos suele quedar resuelto. Después, repasa la propiedad distributiva: en el 2 la hiciste bien y en el 7 se te olvidó multiplicar el 1.',
    lo_que_hace_bien: 'Conoce la fórmula de segundo grado y la aplica con orden (el 5 está perfecto), y escribe cada paso, así que es muy fácil ver dónde está cada fallo.',
    practica: [
      { enunciado: '3x + 5 = 20', solucion: '3x = 20 − 5 = 15 → x = 5' },
      { enunciado: '7x − 4 = 3x + 8', solucion: '7x − 3x = 8 + 4 → 4x = 12 → x = 3' },
      { enunciado: 'x² + 2x − 8 = 0', solucion: 'Discriminante: 4 + 32 = 36 → x = (−2 ± 6) / 2 → x = 2, x = −4' }
    ],
    para_la_familia: 'Va bien con las ecuaciones: entiende el método y escribe los pasos ordenados. Lo que le hace fallar es un despiste concreto con los signos, que se corrige con práctica corta y frecuente.'
  };
  const IMG_EJEMPLO = 'assets/ejemplos/deberes-ejemplo.jpg';

  /* ---------- Fotos: se reducen en el navegador antes de enviarlas ---------- */
  async function prepararFoto(archivo, lado = 1600) {
    if (!/^image\//.test(archivo.type) && !/\.(jpe?g|png|webp|heic|heif)$/i.test(archivo.name)) throw new Error('Ese archivo no es una imagen.');
    const url = URL.createObjectURL(archivo);
    const img = await new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => mal(new Error('No se puede abrir esa foto. Prueba con una JPG o PNG.')); i.src = url; });
    const k = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL('image/jpeg', 0.85);
    URL.revokeObjectURL(url);
    return { tipo: 'image/jpeg', datos: dataUrl.split(',')[1], url: dataUrl, ancho: c.width, alto: c.height };
  }

  /* ---------- Llamada a la IA ---------- */
  // Devuelve {ok, ...} o {sinIA: true} si la función no está desplegada / no hay conexión.
  async function llamar(cuerpo) {
    const sb = window.SUPA && SUPA.sb;
    if (!sb || !sb.functions) return { sinIA: true };
    try {
      const { data, error } = await sb.functions.invoke(FUNCION, { body: cuerpo });
      if (!error) return data;
      const r = error.context;
      if (r && typeof r.status === 'number') {
        if (r.status === 404 || r.status === 503) return { sinIA: true }; // no desplegada o sin clave
        try { const j = await r.json(); if (j && j.error) return { ok: false, error: j.error }; } catch (e) {}
        return { ok: false, error: 'El corrector ha fallado (' + r.status + '). Vuelve a intentarlo.' };
      }
      return { sinIA: true };
    } catch (e) { return { sinIA: true }; }
  }

  async function corregir({ imagenes = [], texto = '', curso = '', asignatura = '', enfoque = 'corregir' }) {
    const r = await llamar({ modo: 'corregir', imagenes: imagenes.map(i => ({ tipo: i.tipo, datos: i.datos })), texto, curso, asignatura, enfoque });
    if (r.sinIA) return { ok: true, resultado: EJEMPLO, ia: false, imagenesEjemplo: [IMG_EJEMPLO], aviso: 'La corrección con IA todavía no está activada en esta versión de la web. Mientras tanto, así es como corrige una hoja de ejemplo.' };
    if (r.ok && r.resultado) return { ok: true, resultado: normalizar(r.resultado), ia: true };
    return { ok: false, error: r.error || 'No se ha podido corregir. Vuelve a intentarlo.' };
  }
  const ejemplo = () => ({ ok: true, resultado: EJEMPLO, ia: false, imagenesEjemplo: [IMG_EJEMPLO] });

  // Por si la IA devuelve algo incompleto: que la web nunca se rompa
  function normalizar(r) {
    const arr = x => Array.isArray(x) ? x : [];
    r.ejercicios = arr(r.ejercicios).map((e, i) => ({ numero: String(e.numero || i + 1), imagen: e.imagen | 0, caja: e.caja && isFinite(e.caja.x) ? e.caja : null,
      enunciado: e.enunciado || '', respuesta_alumno: e.respuesta_alumno || '', estado: e.estado || 'ilegible', solucion: e.solucion || '', tipo_error: e.tipo_error || '',
      donde_falla: e.donde_falla || '', por_que: e.por_que || '', pista: e.pista || '', pasos: arr(e.pasos), duda: e.duda || '' }));
    r.tipos_error = arr(r.tipos_error); r.practica = arr(r.practica);
    return r;
  }

  /* ---------- Chat de dudas sobre un ejercicio ---------- */
  async function preguntar({ resultado, ejercicio, historial, pregunta, ia }) {
    if (ia) {
      const r = await llamar({ modo: 'pregunta', pregunta, historial, ejercicio, contexto: { asignatura: resultado.asignatura, curso: resultado.curso, tema: resultado.tema } });
      if (r.ok) return { ok: true, respuesta: r.respuesta, ia: true };
      if (!r.sinIA) return { ok: false, error: r.error };
    }
    await espera(700);
    return { ok: true, respuesta: respuestaEjemplo(ejercicio, pregunta), ia: false };
  }
  // Sin IA: respuestas sacadas de la propia corrección, según lo que pregunte
  function respuestaEjemplo(e, p) {
    const t = (p || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    if (/pista|ayuda|empez|no se como/.test(t) && e.pista) return e.pista;
    if (/solucion|resultado|cuanto (da|sale)|respuesta/.test(t)) return `Sale ${e.solucion}. Así:\n${e.pasos.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    if (/paso\s*(\d)/.test(t)) { const n = +t.match(/paso\s*(\d)/)[1]; const s = e.pasos[n - 1]; if (s) return `Paso ${n}: ${s}\n\n${e.pasos[n] ? 'Después: ' + e.pasos[n] : 'Y con eso ya está.'}`; }
    if (/por ?que|no entiendo|explica/.test(t)) return e.por_que + (e.pista ? `\n\nPrueba esto: ${e.pista}` : '');
    if (/otro|parecid|practic/.test(t)) return 'Prueba con los ejercicios de práctica que hay al final de la corrección: son del mismo tipo y llevan la solución para comprobarlo.';
    return `${e.por_que || 'Este ejercicio está bien.'}${e.pista ? '\n\nPista: ' + e.pista : ''}\n\n(En el ejemplo respondo con lo que ya está en la corrección. Con la IA activada, aquí te contesta a cualquier duda.)`;
  }

  /* ---------- Pintar ---------- */
  const ESTADO = {
    bien: { txt: 'Bien', icono: '✓', cls: 'bien' }, mal: { txt: 'Revisar', icono: '✗', cls: 'mal' }, incompleto: { txt: 'A medias', icono: '…', cls: 'medio' },
    sin_hacer: { txt: 'Sin hacer', icono: '○', cls: 'medio' }, ilegible: { txt: 'No se lee', icono: '?', cls: 'medio' }
  };
  const cuenta = r => { const n = r.ejercicios.length, b = r.ejercicios.filter(e => e.estado === 'bien').length; return { n, b, mal: r.ejercicios.filter(e => e.estado === 'mal' || e.estado === 'incompleto').length }; };

  // Recuadros sobre la foto (rojo = revisar, verde = bien). Devuelve los elementos por número de ejercicio.
  async function pintarMarcas(contenedor, r, imagen = 0, { animar = true, alPulsar } = {}) {
    contenedor.querySelectorAll('.corr-marca').forEach(m => m.remove());
    const marcas = {};
    for (const e of r.ejercicios.filter(e => e.caja && (e.imagen | 0) === imagen)) {
      const est = ESTADO[e.estado] || ESTADO.ilegible, m = document.createElement('button');
      m.type = 'button'; m.className = 'corr-marca ' + est.cls; m.dataset.ej = e.numero;
      const c = e.caja; m.style.cssText = `left:${c.x}%;top:${c.y}%;width:${Math.min(c.w, 100 - c.x)}%;height:${Math.min(c.h, 100 - c.y)}%`;
      m.setAttribute('aria-label', `Ejercicio ${e.numero}: ${est.txt}`);
      m.innerHTML = `<span>${est.icono} ${esc(e.numero)}${e.estado === 'mal' && e.tipo_error ? `<em> · ${esc(e.tipo_error)}</em>` : ''}</span>`;
      if (alPulsar) m.onclick = () => alPulsar(e.numero);
      contenedor.appendChild(m); marcas[e.numero] = m;
      if (animar) { await espera(30); m.classList.add('ver'); await espera(160); } else m.classList.add('ver');
    }
    return marcas;
  }

  // Resumen corto (portada)
  function htmlResumen(r, { enlace } = {}) {
    const { n, b } = cuenta(r), max = Math.max(1, ...r.tipos_error.map(t => t.ejercicios.length));
    return `<p class="corr-meta">${esc(r.asignatura)} · ${esc(r.curso)} · ${esc(r.tema)}</p>
      <div class="corr-nota"><b>${b}<small>/${n}</small></b><span>bien a la primera</span></div>
      ${r.tipos_error.map(t => `<div class="corr-tipo"><b>${esc(t.tipo)}</b><span>${t.ejercicios.length} ${t.ejercicios.length === 1 ? 'fallo' : 'fallos'} · ej. ${t.ejercicios.map(esc).join(', ')}</span><i><span data-w="${t.ejercicios.length / max * 100}"></span></i></div>`).join('')}
      <div class="corr-empezar"><b>Por dónde empezar:</b> ${esc(r.por_donde_empezar)}</div>
      <p class="corr-acciones">${enlace ? `<a class="boton peq" href="${enlace}">Ver la explicación de cada ejercicio</a>` : ''}<a class="boton sec peq" href="buscar.html?asig=${esc(r.asig_id && r.asig_id !== 'otra' ? r.asig_id : '')}">Profes que lo trabajan</a></p>`;
  }

  // Tarjeta de un ejercicio (página completa)
  function htmlEjercicio(e, enfoque) {
    const est = ESTADO[e.estado] || ESTADO.ilegible, revisar = est.cls !== 'bien';
    return `<article class="hoja corr-ej ${est.cls}" id="ej-${esc(e.numero)}" data-ej="${esc(e.numero)}">
      <header><span class="corr-num">${esc(e.numero)}</span><span class="corr-estado ${est.cls}">${est.icono} ${est.txt}</span>${e.tipo_error ? `<span class="corr-etq">${esc(e.tipo_error)}</span>` : ''}</header>
      <p class="corr-enun">${esc(e.enunciado)}</p>
      ${e.respuesta_alumno ? `<p class="corr-lin"><small>Tu respuesta</small>${marcarFallo(e.respuesta_alumno, e.donde_falla)}</p>` : ''}
      ${revisar && e.por_que ? `<p class="corr-porque">${esc(e.por_que)}</p>` : ''}
      ${!revisar && e.por_que ? `<p class="corr-ok">${esc(e.por_que)}</p>` : ''}
      ${e.duda ? `<p class="corr-duda">⚠️ ${esc(e.duda)}</p>` : ''}
      <div class="corr-botones">
        ${e.pista ? `<button type="button" class="boton sec peq" data-accion="pista">💡 Pista</button>` : ''}
        ${e.pasos.length ? `<button type="button" class="boton ${revisar ? '' : 'sec'} peq" data-accion="pasos">${revisar ? 'Ver la explicación paso a paso' : 'Ver cómo se hace'}</button>` : ''}
        <button type="button" class="boton sec peq" data-accion="duda">Preguntar una duda</button>
      </div>
      ${e.pista ? `<div class="corr-pista" hidden>💡 ${esc(e.pista)}</div>` : ''}
      ${e.pasos.length ? `<ol class="corr-pasos" hidden>${e.pasos.map(p => `<li>${esc(p)}</li>`).join('')}</ol>${e.solucion ? `<p class="corr-sol" hidden>Solución: <b>${esc(e.solucion)}</b></p>` : ''}` : ''}
      <div class="corr-chat" hidden><div class="corr-mensajes"></div>
        <form class="corr-pregunta"><input class="entrada" placeholder="${revisar ? 'Ej.: ¿por qué cambia el signo?' : 'Pregunta lo que quieras de este ejercicio'}" aria-label="Tu pregunta sobre el ejercicio ${esc(e.numero)}" maxlength="500"><button class="boton peq">Preguntar</button></form>
        <div class="corr-sugerencias">${(revisar ? ['No entiendo por qué está mal', 'Dame otra pista', '¿Cuál es la solución?'] : ['¿Hay otra forma de hacerlo?', '¿Cómo lo compruebo?']).map(s => `<button type="button" data-sug="${esc(s)}">${esc(s)}</button>`).join('')}</div>
      </div>
    </article>`;
  }
  // Subraya en la respuesta del alumno el trozo donde falla
  function marcarFallo(resp, fallo) {
    const r = esc(resp); if (!fallo) return r;
    const f = esc(fallo), i = r.indexOf(f);
    return i < 0 ? r : r.slice(0, i) + `<mark>${f}</mark>` + r.slice(i + f.length);
  }

  // Corrección completa: resumen + ejercicios + práctica (deberes.html)
  function pintarCorreccion(cont, res, { enfoque = 'corregir', alElegir } = {}) {
    const r = res.resultado;
    if (!r.es_tarea) { cont.innerHTML = `<div class="hoja corr-vacio"><h3>Eso no parecen deberes</h3><p class="suave">${esc(r.mensaje || 'Haz una foto a la hoja de ejercicios, con buena luz y de frente.')}</p></div>`; return; }
    const { n, b, mal } = cuenta(r), max = Math.max(1, ...r.tipos_error.map(t => t.ejercicios.length));
    cont.innerHTML = `
      ${res.aviso ? `<div class="corr-aviso">${esc(res.aviso)}</div>` : ''}
      <section class="hoja corr-resumen">
        <p class="corr-meta">${res.ia ? '<span class="corr-ia">Corregido con IA</span>' : '<span class="corr-ia ej">Ejemplo</span>'} ${esc(r.asignatura)} · ${esc(r.curso)} · ${esc(r.tema)}</p>
        <div class="corr-cabeza">
          <div class="corr-nota"><b>${b}<small>/${n}</small></b><span>bien a la primera</span></div>
          <p class="corr-res">${esc(r.resumen)}</p>
        </div>
        ${r.tipos_error.length ? `<h4>Qué falla</h4>${r.tipos_error.map(t => `<div class="corr-tipo"><b>${esc(t.tipo)}</b><span>${t.ejercicios.length} ${t.ejercicios.length === 1 ? 'fallo' : 'fallos'} · ej. ${t.ejercicios.map(x => `<a href="#ej-${esc(x)}">${esc(x)}</a>`).join(', ')}</span><i><span data-w="${t.ejercicios.length / max * 100}"></span></i><p>${esc(t.explicacion)}</p></div>`).join('')}` : ''}
        <div class="corr-empezar"><b>Por dónde empezar:</b> ${esc(r.por_donde_empezar)}</div>
        ${r.lo_que_hace_bien ? `<p class="corr-bien"><b>Lo que haces bien:</b> ${esc(r.lo_que_hace_bien)}</p>` : ''}
        ${r.para_la_familia ? `<details class="corr-familia"><summary>Resumen para la familia</summary><p>${esc(r.para_la_familia)}</p></details>` : ''}
      </section>
      <div class="corr-filtro" role="tablist">
        <button type="button" data-f="todos" aria-pressed="true">Todos (${n})</button>
        <button type="button" data-f="revisar" aria-pressed="false">Para revisar (${n - b})</button>
        <button type="button" data-f="bien" aria-pressed="false">Bien (${b})</button>
      </div>
      <div class="corr-lista">${r.ejercicios.map(e => htmlEjercicio(e, enfoque)).join('')}</div>
      ${r.practica.length ? `<section class="corr-practica"><h3>Practica ${mal ? 'lo que ha fallado' : 'un poco más'}</h3><p class="suave">Ejercicios parecidos para afianzarlo. Hazlos en un papel y luego comprueba.</p>
        <div class="corr-prac">${r.practica.map((p, i) => `<div class="hoja"><small>Ejercicio ${i + 1}</small><p class="corr-enun">${esc(p.enunciado)}</p><button type="button" class="enlace-btn" data-sol>Ver solución</button><p class="corr-sol" hidden>${esc(p.solucion)}</p></div>`).join('')}</div></section>` : ''}
      <section class="hoja corr-cta"><div><h3>¿Le cuesta ${esc((r.tipos_error[0] && r.tipos_error[0].tipo || r.tema || 'esto').toLowerCase())}?</h3><p class="suave">Un profe de tu barrio lo trabaja con él en un par de clases, y la primera es a prueba.</p></div><a class="boton" href="buscar.html${r.asig_id && r.asig_id !== 'otra' ? '?asig=' + esc(r.asig_id) : ''}">Ver profes</a></section>`;

    requestAnimationFrame(() => cont.querySelectorAll('[data-w]').forEach(s => s.style.width = s.dataset.w + '%'));
    const historiales = {};
    // Filtros
    cont.querySelector('.corr-filtro').onclick = ev => {
      const bt = ev.target.closest('[data-f]'); if (!bt) return;
      cont.querySelectorAll('.corr-filtro button').forEach(x => x.setAttribute('aria-pressed', x === bt));
      cont.querySelectorAll('.corr-ej').forEach(a => a.hidden = bt.dataset.f === 'revisar' ? a.classList.contains('bien') : bt.dataset.f === 'bien' ? !a.classList.contains('bien') : false);
    };
    // Botones de cada ejercicio
    cont.onclick = async ev => {
      const sol = ev.target.closest('[data-sol]');
      if (sol) { const p = sol.nextElementSibling; p.hidden = !p.hidden; sol.textContent = p.hidden ? 'Ver solución' : 'Ocultar solución'; return; }
      const art = ev.target.closest('.corr-ej'); if (!art) return;
      const e = r.ejercicios.find(x => x.numero === art.dataset.ej);
      if (alElegir && !ev.target.closest('button, input, a, form')) alElegir(e.numero);
      const acc = ev.target.closest('[data-accion]');
      if (acc) {
        const a = acc.dataset.accion;
        if (a === 'pista') { const p = art.querySelector('.corr-pista'); p.hidden = !p.hidden; }
        if (a === 'pasos') { const ol = art.querySelector('.corr-pasos'), s = art.querySelector('.corr-sol'); const ver = ol.hidden; ol.hidden = !ver; if (s) s.hidden = !ver; acc.textContent = ver ? 'Ocultar la explicación' : (art.classList.contains('bien') ? 'Ver cómo se hace' : 'Ver la explicación paso a paso'); if (ver) ol.querySelectorAll('li').forEach((li, i) => li.style.animationDelay = i * 90 + 'ms'); }
        if (a === 'duda') { const ch = art.querySelector('.corr-chat'); ch.hidden = !ch.hidden; if (!ch.hidden) ch.querySelector('input').focus(); }
        if (alElegir) alElegir(e.numero);
        return;
      }
      const sug = ev.target.closest('[data-sug]'); if (sug) enviar(art, e, sug.dataset.sug);
    };
    cont.addEventListener('submit', ev => {
      const f = ev.target.closest('.corr-pregunta'); if (!f) return; ev.preventDefault();
      const art = f.closest('.corr-ej'), e = r.ejercicios.find(x => x.numero === art.dataset.ej), inp = f.querySelector('input');
      const t = inp.value.trim(); if (!t) return; inp.value = ''; enviar(art, e, t);
    });
    async function enviar(art, e, texto) {
      const caja = art.querySelector('.corr-mensajes'), h = historiales[e.numero] = historiales[e.numero] || [];
      caja.insertAdjacentHTML('beforeend', `<div class="corr-msj yo">${esc(texto)}</div><div class="corr-msj tutor escribiendo"><i></i><i></i><i></i></div>`);
      caja.scrollTop = caja.scrollHeight;
      const out = await preguntar({ resultado: r, ejercicio: e, historial: h, pregunta: texto, ia: res.ia });
      caja.querySelector('.escribiendo').remove();
      const resp = out.ok ? out.respuesta : (out.error || 'No he podido responder. Prueba otra vez.');
      caja.insertAdjacentHTML('beforeend', `<div class="corr-msj tutor${out.ok ? '' : ' error'}">${esc(resp).replace(/\n/g, '<br>')}</div>`);
      if (out.ok) h.push({ rol: 'alumno', texto }, { rol: 'tutor', texto: resp });
      caja.scrollTop = caja.scrollHeight;
    }
  }

  // Mensajes mientras corrige (la IA tarda 20–60 s en una hoja)
  const FASES = ['Leyendo la hoja…', 'Separando los ejercicios…', 'Resolviendo cada ejercicio desde cero…', 'Comparando con tus respuestas…', 'Buscando en qué paso está cada fallo…', 'Preparando las explicaciones…', 'Inventando ejercicios para practicar…', 'Repasando que todo cuadre…'];
  function progreso(el) {
    let i = 0, t0 = Date.now();
    const pinta = () => { el.innerHTML = `<span class="corr-cargando"><i></i></span> ${FASES[Math.min(i, FASES.length - 1)]} <small>${Math.round((Date.now() - t0) / 1000)} s</small>`; };
    pinta(); const a = setInterval(() => { i++; pinta(); }, 5500), b = setInterval(pinta, 1000);
    return () => { clearInterval(a); clearInterval(b); };
  }

  return { EJEMPLO, IMG_EJEMPLO, prepararFoto, corregir, ejemplo, preguntar, pintarMarcas, htmlResumen, pintarCorreccion, progreso, ESTADO, cuenta, esc };
})();
