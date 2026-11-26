/* Cabecera, pie, tema, favoritos y utilidades compartidas */
(() => {
  const D = window.D;
  const pagina = location.pathname.split('/').pop() || 'index.html';

  // Tema guardado
  try { const t = localStorage.getItem('tema'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}

  const NAV = [
    ['buscar.html', 'Buscar en el mapa'], ['grupos.html', 'Grupos de portal'], ['como-se-paga.html', 'Cómo se paga'],
    ['dar-clases.html', 'Dar clases'], ['ayuda.html', 'Ayuda']
  ];
  const cab = document.createElement('header');
  cab.className = 'cab';
  cab.innerHTML = `<div class="envoltura">
    <a class="hueco-logo" href="index.html" aria-label="Inicio"><i></i><span>nombre</span></a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav">Menú</button>
    <nav class="nav" id="nav">
      ${NAV.map(([h, t]) => `<a href="${h}"${h === pagina ? ' aria-current="page"' : ''}>${t}</a>`).join('')}
      <button class="tema-btn" type="button" aria-label="Cambiar entre tema claro y oscuro">◐</button>
      <a class="boton peq" href="${sesion() ? 'panel.html' : 'entrar.html'}">${sesion() ? 'Mi panel' : 'Entrar'}</a>
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
      <div class="pila"><a class="hueco-logo" href="index.html"><i></i><span>nombre</span></a>
        <p class="suave">Clases particulares en tu barrio. Profes comprobados en persona, sin cuotas y con la primera clase a prueba.</p></div>
      <div><h4>Familias</h4><ul><li><a href="buscar.html">Buscar profe</a></li><li><a href="grupos.html">Grupos de portal</a></li><li><a href="como-se-paga.html">Cómo se paga</a></li><li><a href="entrar.html?alta=familia">Crear cuenta</a></li></ul></div>
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
  const alternarFav = id => { const f = favs(); const i = f.indexOf(id); i < 0 ? f.push(id) : f.splice(i, 1); try { localStorage.setItem('favs', JSON.stringify(f)); } catch (e) {} if (window.SUPA) SUPA.fav(id, i < 0).catch(() => {}); return i < 0; };

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
        <h3 style="font-size:19px"><a href="profe.html?id=${p.id}" style="text-decoration:none">${p.nombre}</a></h3>
        <p class="suave" style="font-size:14px">${p.estudios}</p>
        <p style="font-size:15px;margin-top:6px">${p.corta}</p>
        <p style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">
          <span class="etiqueta">📍 ${lugar}</span>
          <span class="etiqueta">${modoTxt(p.modo)}</span>
          ${p.grupos ? '<span class="etiqueta naranja">Grupos de portal</span>' : ''}
        </p>
      </div>
      <div class="precio">${p.precio} €<small>la hora</small><div style="font-size:14px;margin-top:10px;font-stretch:100%;font-weight:650">${p.clases && p.nota ? `<span class="estrellas">★</span> ${coma(p.nota)} <span class="suave mono">(${p.clases})</span>` : '<span class="etiqueta naranja">Nuevo</span>'}</div></div>
      <button class="fav" type="button" aria-pressed="${fav}" aria-label="Guardar en favoritos" data-fav="${p.id}">${fav ? '♥' : '♡'}</button>
    </article>`;
  };
  // Delegación: botones de favorito en cualquier página
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-fav]'); if (!b) return;
    e.preventDefault();
    const on = alternarFav(b.dataset.fav);
    b.setAttribute('aria-pressed', on); b.textContent = on ? '♥' : '♡';
    b.animate([{ transform: 'scale(1.6)' }, { transform: 'scale(1)' }], { duration: 350, easing: 'cubic-bezier(.3,1.6,.5,1)' });
    tostada(on ? 'Guardado en favoritos' : 'Quitado de favoritos');
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

  window.U = { cara, estrellas, coma, modoTxt, placa, tarjetaProfe, favs, alternarFav, tostada, param, esc, contar, sesion, iniciales };
})();
