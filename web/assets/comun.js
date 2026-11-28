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
  // Profe: su panel de inicio, su calendario y los mensajes (con icono); el perfil va en el botón de la derecha, con su foto
  const ICONO_MSJ = '<svg class="icono-nav" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z"/><path stroke="currentColor" stroke-width="1.9" stroke-linecap="round" d="M8.5 8.5h7M8.5 11.5h4.5"/></svg>';
  const ICONO_INICIO = '<svg class="icono-nav" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/></svg>';
  const ICONO_CAL = '<svg class="icono-nav" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.9"/><path stroke="currentColor" stroke-width="1.9" stroke-linecap="round" d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
  const ICONO_PANEL = '<svg class="icono-nav" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.9"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.9"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.9"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.9"/></svg>';
  // «Mi panel» agrupa el resto de secciones del profe (las del menú lateral)
  const SECCIONES_PANEL_PROFE = ['solicitudes', 'preparar', 'informe', 'alumnos', 'ingresos', 'ajustes'];
  const NAV_PROFE = [
    ['panel.html#inicio', 'Inicio', ICONO_INICIO], ['panel.html#calendario', 'Calendario', ICONO_CAL], ['panel.html#mensajes', 'Mensajes', ICONO_MSJ],
    ['panel.html#solicitudes', 'Mi panel', ICONO_PANEL, SECCIONES_PANEL_PROFE]
  ];
  // Alumno o familia con la sesión iniciada: el Asistente IA (corrector) entra en la cabecera; «Cómo se paga» queda en el pie
  const NAV_FAMILIA = [
    ['buscar.html', 'Buscar profesor'], ['grupos.html', 'Grupos de estudio'], ['panel.html#corrector', 'Asistente IA'], ['ayuda.html', 'Ayuda']
  ];
  const esProfe = () => { const s = sesion(); return !!(s && s.rol === 'profe'); };
  const actualNav = (h, grupo) => {
    const [p, hash] = h.split('#');
    if (grupo) return pagina === p && grupo.includes(location.hash.slice(1));
    if (h === 'panel.html#corrector' && pagina === 'deberes.html') return true;
    if (hash) return pagina === p && location.hash.slice(1) === hash;
    return h === pagina || (h === 'grupos.html' && pagina === 'grupo.html');
  };
  const enlacesNav = () => (esProfe() ? NAV_PROFE : sesion() ? NAV_FAMILIA : NAV).map(([h, t, ic, grupo]) => `<a class="nav-enlace${ic ? ' con-icono' : ''}" href="${h}"${actualNav(h, grupo) ? ' aria-current="page"' : ''}>${ic || ''}${t}</a>`).join('');
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
        <h3><a class="enlace-tarjeta" href="profe.html?id=${p.id}" style="text-decoration:none">${p.nombre}</a></h3>
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
  window.addEventListener('hashchange', () => pintarCuenta());
  function pintarCuenta() {
    pintarNav();
    pintarBarra();
    const s = sesion(), b = cab.querySelector('.boton-entrar'), dc = cab.querySelector('.nav a[href="dar-clases.html"]'), atajo = cab.querySelector('.atajo-panel');
    if (!b) return;
    if (dc) dc.hidden = !!s;
    // En el móvil, «Mi panel» sale fuera del menú, siempre a la vista
    if (atajo) atajo.hidden = !s;
    if (!s) { b.textContent = 'Entrar'; b.href = 'entrar.html'; b.classList.remove('con-cuenta'); return; }
    // Tu foto (si la hay) o tu inicial. El profe va a su perfil; la familia, a su panel.
    const profe = s.rol === 'profe';
    b.href = profe ? 'panel.html#perfil' : 'panel.html';
    b.classList.add('con-cuenta');
    const ava = s.avatar && /^https:\/\//.test(s.avatar)
      ? `<span class="ava-mini foto" aria-hidden="true" style="background-image:url('${esc(s.avatar)}')"></span>`
      : `<span class="ava-mini" aria-hidden="true">${esc((s.nombre || '?').trim().charAt(0).toUpperCase() || '?')}</span>`;
    b.innerHTML = ava + (profe ? 'Perfil' : 'Mi panel');
    if (profe && pagina === 'panel.html' && location.hash === '#perfil') b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    if (atajo) { atajo.href = b.href; atajo.innerHTML = b.innerHTML; atajo.classList.add('con-cuenta'); }
    franjaPanel(s);
  }

  // ---------- En el móvil y la tableta, la web funciona como una app ----------
  // Barra inferior con iconos (Inicio, Mensajes, Calendario…) y una hoja «Más» con el resto de secciones.
  // Arriba quedan el logo y, con la sesión iniciada, los avisos y tu foto. Se ve hasta 1080 px de ancho.
  const ico = (d, cls = 'ico-app') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const ICO = {
    inicio: '<path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
    buscar: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    mensajes: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A1.5 1.5 0 0 1 4 14.5z"/><path d="M8.5 8.5h7M8.5 11.5h4.5"/>',
    calendario: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    mas: '<circle cx="5.5" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18.5" cy="12" r="1.2" fill="currentColor"/>',
    grupos: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5"/><circle cx="17" cy="9" r="2.5"/><path d="M15.9 14.4c2.3-.3 4.2 1.3 4.6 4.6"/>',
    ia: '<path d="M11 4l1.8 4.7L17.5 10.5l-4.7 1.8L11 17l-1.8-4.7L4.5 10.5l4.7-1.8z"/><path d="M18 14.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/>',
    persona: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6"/>',
    informes: '<path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5z"/><path d="M14 3.5V8h4M9.5 12.5h5M9.5 16h5"/>',
    seguimiento: '<path d="M4 19.5h16"/><path d="M5.5 15.5l4-4.5 3.5 3 5.5-6.5"/>',
    pagos: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 14.5h3"/>',
    ajustes: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    ayuda: '<circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.6a2.4 2.4 0 0 1 4.7.8c0 1.7-2.4 2-2.4 3.7"/><circle cx="12" cy="17" r=".5" fill="currentColor"/>',
    tema: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor"/>',
    solicitudes: '<path d="M3.5 13.5 6 5.5h12l2.5 8V19a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/><path d="M3.5 13.5h5a3.5 3.5 0 0 0 7 0h5"/>',
    preparar: '<rect x="5" y="4.5" width="14" height="16.5" rx="2"/><path d="M9 4.5V3h6v1.5M8.5 10h7M8.5 13.5h7M8.5 17h4"/>',
    escribir: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14.5 7.5l3 3"/>',
    ingresos: '<circle cx="12" cy="12" r="8.5"/><path d="M15 8.9a3.6 3.6 0 1 0 0 6.2M7.8 11h5.4M7.8 13.4h5.4"/>',
    entrar: '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 8l4 4-4 4M14 12H4"/>',
    clases: '<path d="M2.5 9 12 5l9.5 4-9.5 4z"/><path d="M6.5 11v4.5c1.5 1.4 3.5 2.1 5.5 2.1s4-.7 5.5-2.1V11M21.5 9v5"/>',
    campana: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
    flecha: '<path d="m9 6 6 6-6 6"/>'
  };
  const BARRA = {
    visita: [['index.html', 'Inicio', 'inicio'], ['buscar.html', 'Buscar', 'buscar'], ['grupos.html', 'Grupos', 'grupos'], ['deberes.html', 'Asistente', 'ia'], ['#mas', 'Más', 'mas']],
    familia: [['panel.html#inicio', 'Inicio', 'inicio'], ['buscar.html', 'Buscar', 'buscar'], ['panel.html#mensajes', 'Mensajes', 'mensajes'], ['panel.html#calendario', 'Calendario', 'calendario'], ['#mas', 'Más', 'mas']],
    profe: [['panel.html#inicio', 'Inicio', 'inicio'], ['panel.html#mensajes', 'Mensajes', 'mensajes'], ['panel.html#calendario', 'Calendario', 'calendario'], ['panel.html#solicitudes', 'Solicitudes', 'solicitudes'], ['#mas', 'Más', 'mas']]
  };
  const MAS = {
    visita: [['entrar.html', 'Entrar', 'entrar'], ['entrar.html?alta=familia', 'Crear cuenta de familia', 'persona'], ['dar-clases.html', 'Quiero dar clases', 'clases'], ['como-se-paga.html', 'Cómo se paga', 'pagos'], ['ayuda.html', 'Ayuda', 'ayuda']],
    familia: [['panel.html#corrector', 'Asistente IA', 'ia'], ['panel.html#profes', 'Mis profes', 'persona'], ['panel.html#grupos', 'Mis grupos', 'grupos'], ['grupos.html', 'Buscar grupos de estudio', 'buscar'], ['panel.html#informes', 'Informes de clase', 'informes'],
      ['panel.html#asistente', 'Seguimiento', 'seguimiento'], ['panel.html#pagos', 'Pagos y bonos', 'pagos'], ['panel.html#ajustes', 'Ajustes', 'ajustes'], ['ayuda.html', 'Ayuda', 'ayuda']],
    profe: [['panel.html#perfil', 'Mi perfil', 'persona'], ['panel.html#preparar', 'Preparar clase', 'preparar'], ['panel.html#informe', 'Escribir informe', 'escribir'], ['panel.html#alumnos', 'Mis alumnos', 'grupos'],
      ['panel.html#ingresos', 'Ingresos', 'ingresos'], ['panel.html#ajustes', 'Ajustes', 'ajustes'], ['ayuda.html', 'Ayuda', 'ayuda']]
  };
  const tipoCuenta = () => { const s = sesion(); return !s ? 'visita' : s.rol === 'profe' ? 'profe' : 'familia'; };
  // ¿Es esta la sección en la que estás? (el panel sin «#» es su Inicio)
  const esActual = h => {
    const [p, hash] = h.split('#'), aqui = location.hash.slice(1) || (pagina === 'panel.html' ? 'inicio' : '');
    if (hash) return pagina === p && aqui === hash;
    if (h === 'buscar.html') return pagina === 'buscar.html' || pagina === 'profe.html';
    if (h === 'grupos.html') return pagina === 'grupos.html' || pagina === 'grupo.html';
    return pagina === h.split('?')[0] && !(tipoCuenta() === 'visita' && pagina === 'entrar.html' && h !== 'entrar.html');
  };
  const avisos = { mensajes: 0, solicitudes: 0 };
  const avatarHtml = (s, cls) => s.avatar && /^https:\/\//.test(s.avatar)
    ? `<span class="${cls} foto" aria-hidden="true" style="background-image:url('${esc(s.avatar)}')"></span>`
    : `<span class="${cls}" aria-hidden="true">${esc((s.nombre || '?').trim().charAt(0).toUpperCase() || '?')}</span>`;

  const barra = document.createElement('nav');
  barra.className = 'barra-app'; barra.setAttribute('aria-label', 'Secciones');
  document.body.append(barra);
  const hojaMas = document.createElement('div');
  hojaMas.className = 'hoja-app'; hojaMas.hidden = true;
  document.body.append(hojaMas);
  const accionesApp = document.createElement('div');
  accionesApp.className = 'acciones-app';
  cab.querySelector('.envoltura').append(accionesApp);

  function pintarBarra() {
    const t = tipoCuenta(), s = sesion();
    document.documentElement.dataset.cuenta = t; // el panel quita su menú lateral en el móvil: la barra y «Más» ya llevan a todo
    const items = BARRA[t];
    const masActivo = !items.some(([h]) => h !== '#mas' && esActual(h)) && MAS[t].some(([h]) => esActual(h));
    barra.innerHTML = `<div class="barra-app-caja">${items.map(([h, txt, ic]) => {
      const activo = h === '#mas' ? masActivo : esActual(h);
      const n = ic === 'mensajes' ? avisos.mensajes : ic === 'solicitudes' ? avisos.solicitudes : 0;
      const marca = n ? `<i class="punto-app" aria-label="${n} nuevo${n > 1 ? 's' : ''}">${n > 9 ? '9+' : n}</i>` : '';
      return h === '#mas'
        ? `<button type="button" class="item-app${activo ? ' activo' : ''}" data-mas aria-haspopup="dialog" aria-expanded="false"><span class="ico-caja">${ico(ICO[ic])}</span><span>${txt}</span></button>`
        : `<a class="item-app${activo ? ' activo' : ''}" href="${h}"${activo ? ' aria-current="page"' : ''}><span class="ico-caja">${ico(ICO[ic])}${marca}</span><span>${txt}</span></a>`;
    }).join('')}</div>`;
    // Arriba a la derecha: avisos y tu foto (con cuenta) o «Entrar»
    accionesApp.innerHTML = !s
      ? `<a class="boton peq" href="entrar.html">Entrar</a>`
      : `<a class="campana-app" href="${t === 'profe' ? 'panel.html#solicitudes' : 'panel.html#mensajes'}" aria-label="Avisos">${ico(ICO.campana)}${avisos.mensajes + avisos.solicitudes ? '<i class="punto-campana"></i>' : ''}</a>
         <a class="cuenta-app" href="${t === 'profe' ? 'panel.html#perfil' : 'panel.html#ajustes'}" aria-label="${t === 'profe' ? 'Mi perfil' : 'Mi cuenta'}">${avatarHtml(s, 'ava-app')}</a>`;
  }
  function pintarMas() {
    const t = tipoCuenta(), s = sesion();
    const cuenta = s ? `<a class="cuenta-mas" href="${t === 'profe' ? 'panel.html#perfil' : 'panel.html#ajustes'}">${avatarHtml(s, 'ava-app grande')}<span><b>${esc(s.nombre || 'Mi cuenta')}</b><small>${t === 'profe' ? 'Ver y editar mi perfil' : 'Mi cuenta y ajustes'}</small></span>${ico(ICO.flecha, 'ico-app chev')}</a>` : '';
    hojaMas.innerHTML = `<div class="hoja-app-fondo" data-cerrar></div>
      <div class="hoja-app-caja" role="dialog" aria-modal="true" aria-label="Más secciones">
        <div class="hoja-app-cab"><span class="asa" aria-hidden="true"></span><b>Más</b><button type="button" class="cerrar-app" data-cerrar aria-label="Cerrar">${ico(ICO.cerrar)}</button></div>
        ${cuenta}
        <div class="lista-app">${MAS[t].map(([h, txt, ic]) => `<a href="${h}"${esActual(h) ? ' aria-current="page"' : ''}><span class="ico-fila">${ico(ICO[ic])}</span><span>${txt}</span>${ico(ICO.flecha, 'ico-app chev')}</a>`).join('')}
          <button type="button" data-tema><span class="ico-fila">${ico(ICO.tema)}</span><span>Tema claro u oscuro</span></button></div>
      </div>`;
  }
  let ultimoFoco = null;
  function abrirMas() {
    pintarMas(); ultimoFoco = document.activeElement;
    hojaMas.hidden = false; document.documentElement.classList.add('con-hoja');
    requestAnimationFrame(() => requestAnimationFrame(() => hojaMas.classList.add('abierta')));
    barra.querySelector('[data-mas]')?.setAttribute('aria-expanded', 'true');
    setTimeout(() => hojaMas.querySelector('.cerrar-app')?.focus(), 60);
  }
  function cerrarMas() {
    if (hojaMas.hidden) return;
    hojaMas.classList.remove('abierta'); document.documentElement.classList.remove('con-hoja');
    barra.querySelector('[data-mas]')?.setAttribute('aria-expanded', 'false');
    setTimeout(() => { hojaMas.hidden = true; }, 320);
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  barra.addEventListener('click', e => { if (e.target.closest('[data-mas]')) abrirMas(); });
  hojaMas.addEventListener('click', e => {
    if (e.target.closest('[data-cerrar]')) return cerrarMas();
    if (e.target.closest('[data-tema]')) { cab.querySelector('.tema-btn').click(); return; }
    if (e.target.closest('a')) setTimeout(cerrarMas, 30); // dentro del panel solo cambia la sección (#), así que hay que cerrarla
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMas(); });
  // Arrastrar la hoja hacia abajo la cierra
  let y0 = null;
  hojaMas.addEventListener('touchstart', e => { if (e.target.closest('.hoja-app-cab')) y0 = e.touches[0].clientY; }, { passive: true });
  hojaMas.addEventListener('touchmove', e => { if (y0 === null) return; const dy = Math.max(0, e.touches[0].clientY - y0); hojaMas.querySelector('.hoja-app-caja').style.transform = `translateY(${dy}px)`; }, { passive: true });
  hojaMas.addEventListener('touchend', e => { if (y0 === null) return; const caja = hojaMas.querySelector('.hoja-app-caja'), dy = e.changedTouches[0].clientY - y0; y0 = null; caja.style.transform = ''; if (dy > 80) cerrarMas(); });
  // El panel avisa de mensajes o solicitudes nuevas para poner el número en la barra
  const ponerAvisos = (a = {}) => { Object.assign(avisos, a); pintarBarra(); };
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

  window.U = { cara, estrellas, coma, modoTxt, placa, tarjetaProfe, favs, alternarFav, contarFavs, tostada, param, esc, contar, sesion, iniciales, pintarCuenta, pintarNav: () => pintarCuenta(), avisos: ponerAvisos };
})();
