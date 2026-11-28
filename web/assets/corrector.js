/* Corrector de deberes (Asistente IA) como pieza reutilizable.
   Lo usan la página deberes.html y la pestaña «Asistente IA» del panel del alumno.
   Necesita assets/deberes.js (window.Deberes) cargado antes.

   Corrector.montar(raiz, { curso, desdePortada, ejemplo, compacto })
     · curso: curso que se elige de entrada (p. ej. el del hijo)
     · desdePortada: si hay una corrección guardada desde la portada, la enseña
     · ejemplo: abre directamente la hoja de ejemplo
     · compacto: sin la columna «Qué te devuelve» (para el panel) */
window.Corrector = (() => {
  const CURSOS = ['1º Primaria', '2º Primaria', '3º Primaria', '4º Primaria', '5º Primaria', '6º Primaria', '1º ESO', '2º ESO', '3º ESO', '4º ESO', '1º Bachillerato', '2º Bachillerato', 'FP', 'Universidad'];

  function montar(raiz, op = {}) {
    const D = window.D, esc = Deberes.esc;
    raiz.classList.add('corrector');
    raiz.innerHTML = `
      <div class="lado">
        <form class="hoja subida" data-c="form">
          <div class="zona-foto" data-c="zona">
            <p class="zona-icono" aria-hidden="true">📄</p>
            <p style="margin-top:8px"><b style="color:var(--tinta)">Una foto por hoja, de frente y con buena luz.</b><br>Hasta 3 fotos. También vale un examen corregido.</p>
            <div class="botones">
              <label class="boton" style="cursor:pointer">Hacer foto<input type="file" accept="image/*" capture="environment" data-c="camara" class="oculto"></label>
              <label class="boton sec" style="cursor:pointer">Elegir fotos<input type="file" accept="image/*" multiple data-c="archivos" class="oculto"></label>
            </div>
            <div class="miniaturas" data-c="minis"></div>
          </div>
          <details class="escrito"><summary>¿Sin foto? Escribe el ejercicio y tu respuesta</summary>
            <textarea class="entrada" data-c="texto" style="margin-top:10px" maxlength="4000" placeholder="Ej.: Resuelve 3x − 7 = 2x + 5. Mi respuesta: 3x − 2x = 5 − 7, x = −2"></textarea></details>
          <div class="opciones">
            <label class="campo"><span>Curso</span><select class="entrada" data-c="curso"><option value="">Lo deduce de la hoja</option>${CURSOS.map(c => `<option ${c === op.curso ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
            <label class="campo"><span>Asignatura</span><select class="entrada" data-c="asig"><option value="">Lo deduce de la hoja</option>${D.ASIG.map(a => `<option value="${a.nombre}">${a.nombre}</option>`).join('')}</select></label>
          </div>
          <div class="campo" style="margin-top:14px"><span style="font-weight:600;font-size:14px">¿Qué necesitas?</span>
            <div class="segmentado" data-c="enfoque">
              <button type="button" data-e="corregir" aria-pressed="true">Corregir y explicar<small>Ya los he terminado</small></button>
              <button type="button" data-e="pistas" aria-pressed="false">Solo pistas<small>Los estoy haciendo</small></button>
            </div>
          </div>
          <button class="boton btn-corregir" data-c="corregir">Corregir</button>
          <p class="estado-corr" data-c="estado" role="status"></p>
          <p class="suave" style="font-size:13px;margin-top:6px">Las fotos no se guardan: se corrigen y se borran. <button type="button" class="enlace-btn" data-c="ejemplo">Probar con una hoja de ejemplo</button></p>
        </form>
        <div class="visor" data-c="visor" hidden>
          <div class="pestanas" data-c="pestanas"></div>
          <div class="corr-foto" data-c="foto"><img data-c="img" alt="Tus deberes con los ejercicios marcados"><div class="corr-barrido" data-c="barrido"></div></div>
          <div class="visor-pie"><span class="suave" style="font-size:13px">Pulsa un recuadro para ir a ese ejercicio.</span><button type="button" class="boton sec peq" data-c="otra">Corregir otra hoja</button></div>
        </div>
      </div>
      <div class="derecha">
        <div class="hoja como" data-c="como" ${op.compacto ? 'hidden' : ''}>
          <h3>Qué te devuelve</h3>
          <ol>
            <li><span>✓</span><div><b>Cada ejercicio, bien o mal</b><p>Resuelve todo desde cero y no se fía de las cuentas: comprueba cada resultado.</p></div></li>
            <li><span>1</span><div><b>El paso exacto donde falla</b><p>Lo marca en tu respuesta y te dice por qué, en una frase.</p></div></li>
            <li><span>2</span><div><b>Primero una pista, luego la solución</b><p>Para que lo intentes tú antes de ver la solución paso a paso.</p></div></li>
            <li><span>3</span><div><b>Pregunta tus dudas</b><p>«¿Por qué cambia el signo?» Te responde sobre ese ejercicio.</p></div></li>
            <li><span>4</span><div><b>Qué repasar y ejercicios para practicar</b><p>Agrupa los fallos que se repiten y te propone ejercicios parecidos.</p></div></li>
          </ol>
        </div>
        <div data-c="correccion"></div>
      </div>`;
    const $ = k => raiz.querySelector(`[data-c="${k}"]`);
    let fotos = [], enfoque = 'corregir', ultimo = null, imagenes = [], vista = 0, marcas = {};

    // Fotos: cámara, galería, arrastrar o pegar
    async function anadir(lista) {
      for (const f of [...lista]) {
        if (fotos.length >= 3) { U.tostada('Como mucho 3 fotos por corrección'); break; }
        try { fotos.push(await Deberes.prepararFoto(f)); } catch (e) { U.tostada(e.message); }
      }
      pintarMinis();
    }
    function pintarMinis() {
      $('minis').innerHTML = fotos.map((f, i) => `<div class="mini"><img src="${f.url}" alt="Foto ${i + 1}"><button type="button" data-quitar="${i}" aria-label="Quitar la foto ${i + 1}">×</button></div>`).join('');
      $('corregir').textContent = fotos.length ? `Corregir ${fotos.length > 1 ? 'las ' + fotos.length + ' fotos' : 'la foto'}` : 'Corregir';
    }
    $('camara').onchange = e => { anadir(e.target.files); e.target.value = ''; };
    $('archivos').onchange = e => { anadir(e.target.files); e.target.value = ''; };
    $('minis').onclick = e => { const b = e.target.closest('[data-quitar]'); if (b) { fotos.splice(+b.dataset.quitar, 1); pintarMinis(); } };
    const zona = $('zona');
    ['dragenter', 'dragover'].forEach(t => zona.addEventListener(t, e => { e.preventDefault(); zona.classList.add('encima'); }));
    ['dragleave', 'drop'].forEach(t => zona.addEventListener(t, e => { e.preventDefault(); zona.classList.remove('encima'); }));
    zona.addEventListener('drop', e => anadir(e.dataTransfer.files));
    const alPegar = e => {
      if (!document.body.contains(raiz)) return document.removeEventListener('paste', alPegar); // el panel ya no lo enseña
      const fs = [...(e.clipboardData?.files || [])].filter(f => /^image\//.test(f.type));
      if (fs.length && !$('form').hidden) anadir(fs);
    };
    document.addEventListener('paste', alPegar);
    $('enfoque').onclick = e => { const b = e.target.closest('[data-e]'); if (!b) return; enfoque = b.dataset.e; $('enfoque').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); };

    // Corregir
    $('form').onsubmit = async e => {
      e.preventDefault();
      const texto = $('texto').value.trim();
      if (!fotos.length && !texto) { U.tostada('Haz una foto o escribe el ejercicio'); return; }
      const btn = $('corregir'); btn.disabled = true;
      const parar = Deberes.progreso($('estado'));
      const res = await Deberes.corregir({ imagenes: fotos, texto, curso: $('curso').value, asignatura: $('asig').value, enfoque });
      parar(); btn.disabled = false; $('estado').textContent = '';
      if (!res.ok) { $('estado').innerHTML = `<span style="color:#C8353A">${esc(res.error)}</span>`; return; }
      mostrar(res, res.ia ? fotos.map(f => f.url) : res.imagenesEjemplo);
    };
    $('ejemplo').onclick = async () => {
      const parar = Deberes.progreso($('estado')); await new Promise(r => setTimeout(r, 1400)); parar(); $('estado').textContent = '';
      mostrar(Deberes.ejemplo(), [Deberes.IMG_EJEMPLO]);
    };
    $('otra').onclick = () => {
      fotos = []; pintarMinis(); $('texto').value = '';
      $('visor').hidden = true; $('form').hidden = false; $('correccion').innerHTML = ''; $('como').hidden = !!op.compacto;
      try { sessionStorage.removeItem('correccion'); } catch (e) {}
      raiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // Enseñar la corrección: foto con recuadros a la izquierda, explicación a la derecha
    async function mostrar(res, urls) {
      ultimo = res; imagenes = (urls || []).filter(Boolean); vista = 0;
      $('form').hidden = true; $('como').hidden = true;
      $('visor').hidden = !imagenes.length;
      $('pestanas').innerHTML = imagenes.length > 1 ? imagenes.map((_, i) => `<button type="button" data-v="${i}" aria-pressed="${i === 0}">Foto ${i + 1}</button>`).join('') : '';
      Deberes.pintarCorreccion($('correccion'), res, { enfoque, alElegir: enfocar });
      (innerWidth < 980 && imagenes.length ? $('visor') : raiz).scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (imagenes.length) await verFoto(0, true);
    }
    async function verFoto(i, animar) {
      vista = i; $('pestanas').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.v === i));
      const img = $('img'); img.src = imagenes[i];
      await new Promise(r => { if (img.complete && img.naturalWidth) r(); else { img.onload = r; img.onerror = r; } });
      const b = $('barrido'); if (animar) { b.classList.add('on'); await new Promise(r => setTimeout(r, 900)); b.classList.remove('on'); }
      marcas = await Deberes.pintarMarcas($('foto'), ultimo.resultado, i, { animar, alPulsar: n => { enfocar(n); const a = document.getElementById('ej-' + n); if (a) a.scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
    }
    $('pestanas').onclick = e => { const b = e.target.closest('[data-v]'); if (b) verFoto(+b.dataset.v, false); };
    // Resalta el ejercicio en la foto y en la lista
    function enfocar(n) {
      raiz.querySelectorAll('.corr-ej.foco, .corr-marca.foco').forEach(x => x.classList.remove('foco'));
      const e = ultimo.resultado.ejercicios.find(x => x.numero === n);
      if (e && (e.imagen | 0) !== vista && imagenes[e.imagen | 0]) verFoto(e.imagen | 0, false).then(() => marcas[n] && marcas[n].classList.add('foco'));
      else if (marcas[n]) marcas[n].classList.add('foco');
      const a = document.getElementById('ej-' + n); if (a) a.classList.add('foco');
    }

    // Si se llega desde la portada con una corrección ya hecha, o con ?ejemplo=1
    try {
      const g = op.desdePortada ? JSON.parse(sessionStorage.getItem('correccion') || 'null') : null;
      if (g && g.res) mostrar(g.res, g.urls || []);
      else if (op.ejemplo) $('ejemplo').click();
    } catch (e) {}
    return { mostrar };
  }

  return { montar, CURSOS };
})();
