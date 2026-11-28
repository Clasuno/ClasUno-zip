/* Cabecera, pie, tema, favoritos y utilidades compartidas */
(() => {
  const D = window.D;
  const pagina = location.pathname.split('/').pop() || 'index.html';

  // Tema guardado
  try { const t = localStorage.getItem('tema'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}

  const LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 50 731 158" aria-hidden="true"><path d="M98.4 202.3C127.6 202.3 148.3 184.4 149 159.2H116.5C115.2 169.2 109 175.7 99.1 175.7C86.6 175.7 79.2 165.3 79.2 148.4C79.2 131.5 86.5 121.2 99.1 121.2C109 121.2 115.5 127.5 116.6 137.4H149C147.5 112.1 127.1 94.5 98.4 94.5C66.5 94.5 45.1 116.4 45.1 148.4C45.1 180.6 66.5 202.3 98.4 202.3ZM187.6 54.5H154V200H187.6ZM228.9 201.8C243.5 201.8 252.8 196.7 258.9 185.5H259.3V200H292.1V130.6C292.1 107.8 275.6 94.6 245.6 94.6C215.7 94.6 198.9 107.9 197.4 130.3H228.6C229.3 123.2 235.1 118.8 244.5 118.8C253.3 118.8 258.8 122.9 258.8 129.1V129.6C258.8 135.7 252.1 137.2 233.6 138.8C211.6 140.5 193.6 148 193.6 171.2C193.6 191.7 208.3 201.8 228.9 201.8ZM239.2 179.8C231 179.8 225.4 176 225.4 169.6C225.4 162.9 231.9 159.2 240.8 157.8C249.1 156.4 255.5 155.2 259.1 153.5V162.9C259.1 173 250.4 179.8 239.2 179.8ZM347.4 202.5C376.3 202.5 395.8 188.3 395.8 167.1C395.8 151.8 385.9 142.9 364.7 139L344 135.2C336.8 133.8 332.8 131 332.8 126.7C332.8 121.6 337.9 117.8 346.7 117.8C355.6 117.8 362 123.1 362.2 130.4H393.2C392.6 108.4 374.3 94.7 345.5 94.7C316.8 94.7 299.3 107.8 299.3 128.2C299.3 144.5 310.2 155 330.5 158.6L349.1 161.9C357.3 163.4 361.6 166.1 361.6 170.6C361.6 175.8 356.2 179.4 346.9 179.4C337 179.4 331.1 174.6 330.1 167H297C298.8 189 318.9 202.5 347.4 202.5ZM436 202.2C451.6 202.2 462 195.1 468.8 183.3V200H502V96.9H468.5V152.9C468.5 167 461.6 173.5 451 173.5C440.3 173.5 434.2 166.9 434.2 154.7V96.9H400.6V161.7C400.6 187.1 413.7 202.2 436 202.2ZM545.4 143.9C545.4 129.9 552.2 123.3 562.9 123.3C573.5 123.3 579.7 130 579.7 142.2V200H613.3V135.2C613.3 109.8 600.2 94.6 577.8 94.6C562.3 94.6 551.8 101.8 545 113.6V96.9H511.8V200H545.4ZM673 202.3C705.3 202.3 727.2 181.2 727.2 148.4C727.2 115.9 705.3 94.5 673 94.5C640.7 94.5 618.7 115.9 618.7 148.4C618.7 181.2 640.7 202.3 673 202.3ZM673 175.6C661.2 175.6 652.8 165.9 652.8 148.4C652.8 131.1 661.3 121.3 673 121.3C684.7 121.3 693.2 131.1 693.2 148.4C693.2 165.9 684.7 175.6 673 175.6Z" fill="currentColor"/><circle cx="747.9" cy="182.4" r="17.6" fill="#5B78FF"/></svg>';

  // Familias y visitantes ven lo de buscar profe; con una cuenta de profe, la cabecera lleva a lo suyo
  const NAV = [
    ['buscar.html', 'Buscar profesor'], ['grupos.html', 'Grupos de estudio'], ['como-se-paga.html', 'Cómo se paga'],
    ['ayuda.html', 'Ayuda']
  ];
  const NAV_PROFE = [
    ['panel.html#solicitudes', 'Solicitudes'], ['panel.html#mensajes', 'Mensajes'], ['panel.html#preparar', 'Preparar clase'],
    ['panel.html#perfil', 'Mi perfil'], ['ayuda.html', 'Ayuda']
  ];
  const esProfe = () => { const s = sesion(); return !!(s && s.rol === 'profe'); };
  const actualNav = h => {
    const [p, hash] = h.split('#');
    if (hash) return pagina === p && location.hash.slice(1) === hash;
    return h === pagina || (h === 'grupos.html' && pagina === 'grupo.html');
  };
  const enlacesNav = () => (esProfe() ? NAV_PROFE : NAV).map(([h, t]) => `<a class="nav-enlace" href="${h}"${actualNav(h) ? ' aria-current="page"' : ''}>${t}</a>`).join('');
  // «Dar clases» va aparte, justo a la izquierda del botón «Entrar»
  const darClases = `<a class="boton sec peq" href="dar-clases.html"${pagina === 'dar-clases.html' ? ' aria-current="page"' : ''}>Dar clases</a>`;
  const cab = document.createElement('header');
  cab.className = 'cab';
  cab.innerHTML = `<div class="envoltura">
    <a class="logo" href="index.html" aria-label="Clasuno, inicio">${LOGO}</a>
    <a class="boton peq atajo-panel" href="panel.html" hidden></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav">Menú</button>
    <nav class="nav" id="nav">
      ${enlacesNav()}
      <button class="tema-btn" type="button" aria-label="Cambiar entre tema claro y oscuro">◐</button>
      ${darClases}
      <a class="boton peq boton-entrar" href="${sesion() ? 'panel.html' : 'entrar.html'}">${sesion() ? 'Mi panel' : 'Entrar'}</a>
    </nav></div>`;
  document.body.prepend(cab);
  const menu = cab.querySelector('.menu-btn'), nav = cab.querySelector('.nav');
  menu.onclick = () => { const a = nav.classList.toggle('abierto'); menu.setAttribute('aria-expanded', a); menu.textContent = a ? 'Cerrar' : 'Menú'; };
  cab.querySelector('.tema-btn').onclick = () => {
    const oscuro = getComputedStyle(document.documentElement).colorScheme === 'dark';
    const nuevo = oscuro ? 'light' : 'dark';
    const aplicar = () => { document.documentElement.dataset.theme = nuevo; try { localStorage.setItem('tema', nuevo); } catch (e) {} };
    document.startViewTransition ? document.startViewTransition(aplicar) : aplicar();
  };

  const pie = document.createElement('footer');
  pie.className = 'pie';
  pie.innerHTML = `<div class="envoltura">
    <div class="cols">
      <div class="pila"><a class="logo" href="index.html" aria-label="Clasuno, inicio">${LOGO}</a>
        <p class="suave">Clases particulares en tu barrio. Profes comprobados en persona, sin cuotas y con la primera clase a prueba.</p></div>
      <div><h4>Familias</h4><ul><li><a href="buscar.html">Buscar profe</a></li><li><a href="deberes.html">Corregir deberes</a></li><li><a href="panel.html#profes">Mi panel</a></li><li><a href="grupos.html">Grupos de estudio</a></li><li><a href="como-se-paga.html">Cómo se paga</a></li><li><a href="entrar.html?alta=familia">Crear cuenta</a></li></ul></div>
      <div><h4>Profes</h4><ul><li><a href="dar-clases.html">Dar clases</a></li><li><a href="alta-profe.html">Crear perfil</a></li><li><a href="panel.html?rol=profe">Panel de profe</a></li></ul></div>
      <div><h4>Ayuda</h4><ul><li><a href="ayuda.html">Preguntas frecuentes</a></li><li><a href="ayuda.html#seguridad">Seguridad</a></li><li><a href="legal.html">Aviso legal y privacidad</a></li><li><a href="legal.html#cookies">Cookies</a></li></ul></div>
    </div>
    <div class="base"><span>© 2026 · Madrid</span><span class="mono">Maqueta · datos de ejemplo</span></div></div>`;
  document.body.append(pie);

  // Aparición al hacer scroll
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }), { threshold: .12 });
  window.observarApariciones = () => document.querySelectorAll('.aparece:not(.visto)').forEach(n => io.observe(n));
  observarApariciones();

  // Sesión simulada (en la versión real: Supabase Auth)
  function sesion() { try { return JSON.parse(localStorage.getItem('sesion') || 'null'); } catch (e) { return null; } }

  const favs = () => { try { return JSON.parse(localStorage.getItem('favs') || '[]'); } catch (e) { return []; } };
  const alternarFav = id => { const f = favs(); const i = f.indexOf(id); i < 0 ? f.push(id) : f.splice(i, 1); try { localStorage.setItem('favs', JSON.stringify(f)); } catch (e) {} if (window.SUPA) SUPA.fav(id, i < 0).catch(() => {}); contarFavs(); return i < 0; };
  // Los profes guardados se ven en Mi panel → Mis profes (ya no hay pestaña «Guardados» en la cabecera)
  const contarFavs = () => {};

  let tTost;
  const tostada = txt => {
    let t = document.querySelector('.tostada');
    if (!t) { t = document.createElement('div'); t.className = 'tostada'; t.setAttribute('role', 'status'); document.body.append(t); }
    t.textContent = txt; requestAnimationFrame(() => t.classList.add('ver'));
    clearTimeout(tTost); tTost = setTimeout(() => t.classList.remove('ver'), 2800);
  };

  const iniciales = n => n.split(' ').map(s => s[0]).join('').slice(0, 2);
  const cara = (p, tam = '') => `<span class="cara ${tam}" style="background:${p.avatar ? `url(${p.avatar}) center/cover` : D.asig(p.asig[0]).c}">${p.avatar ? '' : iniciales(p.nombre)}${p.verificado ? '<span class="v" title="Comprobado en persona"><svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.5l2.5 2.5L10 3.5" stroke="#fff" stroke-width="2" fill="none"/></svg></span>' : ''}</span>`;
  const estrellas = n => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
  const coma = n => String(n).replace('.', ',');
  const modoTxt = m => ({ presencial: 'En persona', online: 'Online', ambas: 'En persona y online' })[m];
  const placa = (a, pulsada = false, extra = '') => `<button type="button" class="placa-calle" style="--c:${a.c}" aria-pressed="${pulsada}" data-asig="${a.id}" ${extra}>${a.nombre}</button>`;

  const tarjetaProfe = (p, zonaRef) => {
    const z = p.zona ? D.zona(p.zona) : null;
    const lugar = z ? `${z.nombre}${zonaRef && zonaRef !== p.zona ? ` · a ${D.km(zonaRef, p.zona)} km` : ''}` : 'Online';
    const fav = favs().includes(p.id);
    return `<article class="hoja tarjeta-profe" data-id="${p.id}">
      ${cara(p)}
      <div>
        <h3 style="font-size:19px"><a class="enlace-tarjeta" href="profe.html?id=${p.id}" style="text-decoration:none">${p.nombre}</a></h3>
        <p class="suave" style="font-size:14px">${p.estudios}</p>
        <p style="font-size:15px;margin-top:6px">${p.corta}</p>
        <p style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
          <span class="etiqueta">📍 ${lugar}</span>
          <span class="etiqueta">${modoTxt(p.modo)}</span>
          ${p.grupos ? '<span class="etiqueta naranja">Grupos de estudio</span>' : ''}
        </p>
        <p class="acciones-tarjeta">
          <a class="boton peq" href="profe.html?id=${p.id}">Ver perfil</a>
          <a class="boton sec peq" href="panel.html?chat=${p.id}">Escribir a ${p.nombre.split(' ')[0]}</a>
          <button class="boton sec peq" type="button" data-fav="${p.id}" data-fav-txt aria-pressed="${fav}">${fav ? '♥ Guardado' : '♡ Guardar'}</button>
        </p>
      </div>
      <div class="precio">${p.precio} €<small>la hora</small><div style="font-size:14px;margin-top:10px;font-stretch:100%;font-weight:650">${p.clases && p.nota ? `<span class="estrellas">★</span> ${coma(p.nota)} <span class="suave mono">(${p.clases})</span>` : '<span class="etiqueta naranja">Nuevo</span>'}</div></div>
    </article>`;
  };
  // Delegación: botones de favorito en cualquier página
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-fav]'); if (!b) return;
    e.preventDefault();
    const on = alternarFav(b.dataset.fav);
    // Todos los botones de ese profe en la página (corazón y botón «Guardar») a la vez
    document.querySelectorAll(`[data-fav="${b.dataset.fav}"]`).forEach(x => {
      x.setAttribute('aria-pressed', on);
      x.textContent = x.hasAttribute('data-fav-txt') ? (on ? '♥ Guardado' : '♡ Guardar') : (on ? '♥' : '♡');
    });
    b.animate([{ transform: 'scale(1.3)' }, { transform: 'scale(1)' }], { duration: 350, easing: 'cubic-bezier(.3,1.6,.5,1)' });
    tostada(on ? 'Guardado en Mi panel › Mis profes' : 'Quitado de tus profes guardados');
  });

  const param = k => new URLSearchParams(location.search).get(k);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // Cuenta animada para cifras
  const contar = (nodo, fin, dur = 900, suf = '') => {
    const ini = parseFloat(nodo.dataset.v || 0), t0 = performance.now();
    nodo.dataset.v = fin;
    const paso = t => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); nodo.textContent = Math.round(ini + (fin - ini) * e).toLocaleString('es-ES') + suf; if (k < 1) requestAnimationFrame(paso); };
    requestAnimationFrame(paso);
  };

  // Con la sesión iniciada, «Mi panel» pasa a ser lo principal de la cabecera (con tu inicial) y «Dar clases» se quita
  // Vuelve a pintar los enlaces de la cabecera (cambian al entrar como profe o al salir)
  function pintarNav() {
    const nav = cab.querySelector('.nav'), tema = cab.querySelector('.tema-btn'); if (!nav || !tema) return;
    nav.querySelectorAll('.nav-enlace').forEach(a => a.remove());
    tema.insertAdjacentHTML('beforebegin', enlacesNav());
  }
  window.addEventListener('hashchange', pintarNav);
  function pintarCuenta() {
    pintarNav();
    const s = sesion(), b = cab.querySelector('.boton-entrar'), dc = cab.querySelector('.nav a[href="dar-clases.html"]'), atajo = cab.querySelector('.atajo-panel');
    if (!b) return;
    if (dc) dc.hidden = !!s;
    // En el móvil, «Mi panel» sale fuera del menú, siempre a la vista
    if (atajo) atajo.hidden = !s;
    if (!s) { b.textContent = 'Entrar'; b.href = 'entrar.html'; b.classList.remove('con-cuenta'); return; }
    b.href = s.rol === 'profe' ? 'panel.html?rol=profe' : 'panel.html';
    b.classList.add('con-cuenta');
    b.innerHTML = `<span class="ava-mini" aria-hidden="true">${esc((s.nombre || '?').trim().charAt(0).toUpperCase() || '?')}</span>Mi panel`;
    if (atajo) { atajo.href = b.href; atajo.innerHTML = b.innerHTML; atajo.classList.add('con-cuenta'); }
    franjaPanel(s);
  }
  // En la portada, quien ya tiene cuenta ve primero el camino a su panel
  function franjaPanel(s) {
    let f = document.querySelector('.franja-panel');
    if (pagina !== 'index.html' || !s) { if (f) f.remove(); return; }
    if (!f) { f = document.createElement('div'); f.className = 'franja-panel'; cab.after(f); }
    f.innerHTML = s.rol === 'profe'
      ? `<div class="envoltura"><p><b>Hola, ${esc(s.nombre || '')}.</b> <span>Tus solicitudes, los mensajes de las familias y tu perfil están en tu panel.</span></p><a class="boton peq" href="panel.html#solicitudes">Ver mis solicitudes →</a></div>`
      : `<div class="envoltura"><p><b>Hola, ${esc(s.nombre || '')}.</b> <span>Tus clases, tus profes, los mensajes y tus grupos de estudio están en tu panel.</span></p><a class="boton peq" href="panel.html">Ir a mi panel →</a></div>`;
  }
  pintarCuenta();

  // ---------- Desplegables en los que se puede escribir ----------
  // Cada <select> de la web se convierte en una casilla: escribes «cham» y la lista se queda en «Chamberí».
  // El <select> de verdad sigue dentro (oculto), así que los formularios y el resto del código funcionan igual.
  // Sin acentos ni mayúsculas; «º» y «ª» cuentan como espacio («2 bach» encuentra «2º Bachillerato») sin cambiar la longitud
  const normal = t => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ºª]/g, ' ').toLowerCase();
  const VALOR = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  const INDICE = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'selectedIndex');
  let nCombo = 0;
  function combo(sel) {
    if (sel.dataset.combo || sel.multiple || sel.size > 1 || sel.hasAttribute('data-nativo')) return;
    sel.dataset.combo = '1';
    const id = 'combo-' + (++nCombo), estilo = sel.getAttribute('style') || '', auto = /width\s*:\s*auto/.test(estilo);
    const caja = document.createElement('div'); caja.className = 'combo' + (auto ? ' auto' : '');
    const inp = document.createElement('input');
    inp.type = 'text'; inp.className = sel.className + ' combo-input'; inp.autocomplete = 'off'; inp.spellcheck = false;
    inp.setAttribute('role', 'combobox'); inp.setAttribute('aria-autocomplete', 'list'); inp.setAttribute('aria-expanded', 'false'); inp.setAttribute('aria-controls', id);
    if (estilo) { inp.setAttribute('style', estilo); sel.removeAttribute('style'); }
    if (sel.getAttribute('aria-label')) inp.setAttribute('aria-label', sel.getAttribute('aria-label'));
    if (sel.id && document.querySelector(`label[for="${sel.id}"]`)) { inp.id = sel.id + '-texto'; document.querySelectorAll(`label[for="${sel.id}"]`).forEach(l => l.htmlFor = inp.id); }
    const lista = document.createElement('ul'); lista.className = 'combo-lista'; lista.id = id; lista.setAttribute('role', 'listbox'); lista.hidden = true;
    sel.parentNode.insertBefore(caja, sel); caja.append(inp, sel, lista);
    sel.classList.add('combo-nativo'); sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');

    let opciones = [], vis = [], activo = -1, abierta = false;
    const indice = () => INDICE.get.call(sel);
    const textoSel = () => { const o = sel.options[indice()]; return o ? o.text : ''; };
    function leerOpciones() {
      opciones = [...sel.options].map((o, i) => ({ i, txt: o.text, n: normal(o.text), grupo: o.parentElement.tagName === 'OPTGROUP' ? o.parentElement.label : '', dis: o.disabled }));
      // Los que antes eran «width:auto» se quedan del ancho de la opción más larga
      if (auto) inp.style.width = `calc(${Math.max(8, ...opciones.map(o => o.txt.length))}ch + 46px)`;
    }
    function sync() { if (!abierta || document.activeElement !== inp) inp.value = textoSel(); inp.disabled = sel.disabled; caja.hidden = sel.hidden; }
    // Resalta cada palabra escrita dentro de la opción
    const marcar = (o, trozos) => {
      if (!trozos.length || o.n.length !== o.txt.length) return esc(o.txt);
      const m = new Array(o.txt.length).fill(false);
      trozos.forEach(t => { const k = o.n.indexOf(t); if (k >= 0) for (let j = k; j < k + t.length; j++) m[j] = true; });
      let html = '', dentro = false;
      for (let j = 0; j < o.txt.length; j++) { if (m[j] !== dentro) { html += m[j] ? '<mark>' : '</mark>'; dentro = m[j]; } html += esc(o.txt[j]); }
      return html + (dentro ? '</mark>' : '');
    };
    function pintarLista(q) {
      // Cada palabra escrita tiene que aparecer; primero las opciones donde las palabras empiezan igual
      const trozos = normal(q).split(/\s+/).filter(Boolean), nq = trozos.join(' ');
      const puntos = o => { const pal = o.n.split(/[\s·,/()-]+/); return trozos.filter(t => pal.some(w => w.startsWith(t))).length; };
      vis = opciones.filter(o => !o.dis && trozos.every(t => o.n.includes(t)));
      if (nq) vis.sort((a, b) => puntos(b) - puntos(a) || a.i - b.i);
      let html = '', grupo = null;
      vis.forEach((o, k) => {
        if (!nq && o.grupo && o.grupo !== grupo) html += `<li class="combo-grupo" role="presentation">${esc(o.grupo)}</li>`;
        grupo = o.grupo;
        html += `<li role="option" id="${id}-${k}" data-k="${k}" class="${k === activo ? 'activo' : ''}" aria-selected="${o.i === indice()}">${marcar(o, trozos)}</li>`;
      });
      lista.innerHTML = html || '<li class="combo-vacio">No hay ninguna opción con eso</li>';
      inp.setAttribute('aria-activedescendant', activo >= 0 && vis[activo] ? `${id}-${activo}` : '');
      const li = lista.querySelector('.activo'); if (li) li.scrollIntoView({ block: 'nearest' });
    }
    function abrir(q) {
      if (inp.disabled) return;
      if (!abierta) {
        abierta = true; lista.hidden = false; inp.setAttribute('aria-expanded', 'true'); caja.classList.add('abierta');
        // Si no cabe por debajo, se abre hacia arriba
        const r = inp.getBoundingClientRect(); lista.classList.toggle('arriba', innerHeight - r.bottom < 240 && r.top > innerHeight - r.bottom);
      }
      if (!q) { activo = opciones.filter(o => !o.dis).findIndex(o => o.i === indice()); }
      pintarLista(q);
    }
    function cerrar() { abierta = false; lista.hidden = true; inp.setAttribute('aria-expanded', 'false'); caja.classList.remove('abierta'); activo = -1; }
    function elegir(o) {
      const cambia = indice() !== o.i;
      INDICE.set.call(sel, o.i); cerrar(); inp.value = o.txt;
      if (cambia) { sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    function mover(d) { if (!vis.length) return; activo = (activo + d + vis.length) % vis.length; pintarLista(inp.value === textoSel() ? '' : inp.value); }

    inp.addEventListener('focus', () => { inp.select(); abrir(''); });
    inp.addEventListener('click', () => { if (!abierta) abrir(''); });
    // Lo que se escribe aquí no es un dato del formulario: que no les llegue a los formularios de la página
    inp.addEventListener('input', e => { e.stopPropagation(); activo = 0; abrir(inp.value); });
    inp.addEventListener('change', e => e.stopPropagation());
    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!abierta) return abrir(''); mover(e.key === 'ArrowDown' ? 1 : -1); }
      // Con la lista abierta, Intro solo elige: nunca envía el formulario
      else if (e.key === 'Enter') { if (abierta) { e.preventDefault(); if (vis[activo]) elegir(vis[activo]); } }
      else if (e.key === 'Escape') { if (abierta) { e.preventDefault(); e.stopPropagation(); cerrar(); inp.value = textoSel(); inp.select(); } }
      else if (e.key === 'Tab') { if (abierta && inp.value !== textoSel() && vis[activo]) elegir(vis[activo]); else cerrar(); }
    });
    inp.addEventListener('blur', () => setTimeout(() => {
      if (!abierta) return;
      // Si lo escrito coincide con una opción, se queda esa; si no, vuelve a la que había
      const limpia = t => normal(t).trim().replace(/\s+/g, ' ');
      const exacta = opciones.find(o => !o.dis && limpia(o.txt) === limpia(inp.value));
      if (exacta) elegir(exacta); else { cerrar(); inp.value = textoSel(); }
    }, 150));
    lista.addEventListener('mousedown', e => e.preventDefault()); // no perder el foco al pulsar la lista
    lista.addEventListener('click', e => { e.preventDefault(); const li = e.target.closest('[data-k]'); if (li) elegir(vis[+li.dataset.k]); });

    // Si el código cambia el valor, las opciones o el estado del <select>, la casilla se entera
    Object.defineProperty(sel, 'value', { configurable: true, get() { return VALOR.get.call(this); }, set(v) { VALOR.set.call(this, v); sync(); } });
    Object.defineProperty(sel, 'selectedIndex', { configurable: true, get() { return INDICE.get.call(this); }, set(v) { INDICE.set.call(this, v); sync(); } });
    if (sel.form) sel.form.addEventListener('reset', () => setTimeout(sync));
    sel.addEventListener('change', sync);
    new MutationObserver(() => { leerOpciones(); sync(); if (abierta) pintarLista(inp.value === textoSel() ? '' : inp.value); })
      .observe(sel, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'hidden', 'selected'] });
    leerOpciones(); sync();
  }
  const mejorar = raiz => raiz.querySelectorAll('select').forEach(combo);
  mejorar(document);
  // También los desplegables que se pintan después (paneles, formularios que añaden filas…)
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
    if (n.nodeType !== 1) return;
    if (n.tagName === 'SELECT') combo(n); else if (n.querySelector && n.querySelector('select')) mejorar(n);
  }))).observe(document.body, { childList: true, subtree: true });

  window.U = { cara, estrellas, coma, modoTxt, placa, tarjetaProfe, favs, alternarFav, contarFavs, tostada, param, esc, contar, sesion, iniciales, pintarCuenta, pintarNav };
})();
