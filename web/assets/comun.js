/* Cabecera, pie, tema, favoritos y utilidades compartidas */
(() => {
  const D = window.D;
  const pagina = location.pathname.split('/').pop() || 'index.html';

  // Tema guardado
  try { const t = localStorage.getItem('tema'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}

  const LOGO = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="40 50 731 158" aria-hidden="true"><path d="M98.4 202.3C127.6 202.3 148.3 184.4 149 159.2H116.5C115.2 169.2 109 175.7 99.1 175.7C86.6 175.7 79.2 165.3 79.2 148.4C79.2 131.5 86.5 121.2 99.1 121.2C109 121.2 115.5 127.5 116.6 137.4H149C147.5 112.1 127.1 94.5 98.4 94.5C66.5 94.5 45.1 116.4 45.1 148.4C45.1 180.6 66.5 202.3 98.4 202.3ZM187.6 54.5H154V200H187.6ZM228.9 201.8C243.5 201.8 252.8 196.7 258.9 185.5H259.3V200H292.1V130.6C292.1 107.8 275.6 94.6 245.6 94.6C215.7 94.6 198.9 107.9 197.4 130.3H228.6C229.3 123.2 235.1 118.8 244.5 118.8C253.3 118.8 258.8 122.9 258.8 129.1V129.6C258.8 135.7 252.1 137.2 233.6 138.8C211.6 140.5 193.6 148 193.6 171.2C193.6 191.7 208.3 201.8 228.9 201.8ZM239.2 179.8C231 179.8 225.4 176 225.4 169.6C225.4 162.9 231.9 159.2 240.8 157.8C249.1 156.4 255.5 155.2 259.1 153.5V162.9C259.1 173 250.4 179.8 239.2 179.8ZM347.4 202.5C376.3 202.5 395.8 188.3 395.8 167.1C395.8 151.8 385.9 142.9 364.7 139L344 135.2C336.8 133.8 332.8 131 332.8 126.7C332.8 121.6 337.9 117.8 346.7 117.8C355.6 117.8 362 123.1 362.2 130.4H393.2C392.6 108.4 374.3 94.7 345.5 94.7C316.8 94.7 299.3 107.8 299.3 128.2C299.3 144.5 310.2 155 330.5 158.6L349.1 161.9C357.3 163.4 361.6 166.1 361.6 170.6C361.6 175.8 356.2 179.4 346.9 179.4C337 179.4 331.1 174.6 330.1 167H297C298.8 189 318.9 202.5 347.4 202.5ZM436 202.2C451.6 202.2 462 195.1 468.8 183.3V200H502V96.9H468.5V152.9C468.5 167 461.6 173.5 451 173.5C440.3 173.5 434.2 166.9 434.2 154.7V96.9H400.6V161.7C400.6 187.1 413.7 202.2 436 202.2ZM545.4 143.9C545.4 129.9 552.2 123.3 562.9 123.3C573.5 123.3 579.7 130 579.7 142.2V200H613.3V135.2C613.3 109.8 600.2 94.6 577.8 94.6C562.3 94.6 551.8 101.8 545 113.6V96.9H511.8V200H545.4ZM673 202.3C705.3 202.3 727.2 181.2 727.2 148.4C727.2 115.9 705.3 94.5 673 94.5C640.7 94.5 618.7 115.9 618.7 148.4C618.7 181.2 640.7 202.3 673 202.3ZM673 175.6C661.2 175.6 652.8 165.9 652.8 148.4C652.8 131.1 661.3 121.3 673 121.3C684.7 121.3 693.2 131.1 693.2 148.4C693.2 165.9 684.7 175.6 673 175.6Z" fill="currentColor"/><circle cx="747.9" cy="182.4" r="17.6" fill="#5B78FF"/></svg>';

  const NAV = [
    ['buscar.html', 'Buscar en el mapa'], ['grupos.html', 'Grupos de portal'], ['como-se-paga.html', 'Cómo se paga'],
    ['dar-clases.html', 'Dar clases'], ['ayuda.html', 'Ayuda'], ['guardados.html', 'Guardados']
  ];
  const cab = document.createElement('header');
  cab.className = 'cab';
  cab.innerHTML = `<div class="envoltura">
    <a class="logo" href="index.html" aria-label="Clasuno, inicio">${LOGO}</a>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav">Menú</button>
    <nav class="nav" id="nav">
      ${NAV.map(([h, t]) => `<a href="${h}"${h === pagina ? ' aria-current="page"' : ''}>${h === 'guardados.html' ? '♥ ' : ''}${t}${h === 'guardados.html' ? '<span class="cuenta-favs" hidden></span>' : ''}</a>`).join('')}
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
      <div class="pila"><a class="logo" href="index.html" aria-label="Clasuno, inicio">${LOGO}</a>
        <p class="suave">Clases particulares en tu barrio. Profes comprobados en persona, sin cuotas y con la primera clase a prueba.</p></div>
      <div><h4>Familias</h4><ul><li><a href="buscar.html">Buscar profe</a></li><li><a href="guardados.html">Profes guardados</a></li><li><a href="grupos.html">Grupos de portal</a></li><li><a href="como-se-paga.html">Cómo se paga</a></li><li><a href="entrar.html?alta=familia">Crear cuenta</a></li></ul></div>
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
  // Número de guardados en la pestaña «Guardados» de la cabecera
  const contarFavs = () => { const n = favs().length; document.querySelectorAll('.cuenta-favs').forEach(c => { c.hidden = !n; c.textContent = n; }); };
  contarFavs(); if (D && D.listo) D.listo.then(() => setTimeout(contarFavs, 1500));
  window.addEventListener('storage', e => { if (e.key === 'favs') contarFavs(); });

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
          ${p.grupos ? '<span class="etiqueta naranja">Grupos de portal</span>' : ''}
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
    tostada(on ? 'Guardado en «Guardados»' : 'Quitado de «Guardados»');
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

  window.U = { cara, estrellas, coma, modoTxt, placa, tarjetaProfe, favs, alternarFav, contarFavs, tostada, param, esc, contar, sesion, iniciales };
})();
