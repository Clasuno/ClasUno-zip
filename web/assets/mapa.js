/* Mapa real de Madrid (Leaflet + teselas de CARTO/OpenStreetMap).
   crearMapa(caja, opciones) → api { filtrar, foco, zona, zoom, contar } */
window.crearMapa = function (caja, op = {}) {
  const D = window.D;
  caja.classList.add('mapa-caja');
  caja.innerHTML = '<div class="mapa-lienzo"></div>';
  const lienzo = caja.firstChild;
  const oscuro = () => getComputedStyle(document.documentElement).colorScheme === 'dark';

  const mapa = L.map(lienzo, { zoomControl: !!op.botonesZoom, scrollWheelZoom: false, attributionControl: true, zoomSnap: 1 });
  // Teselas de Esri (gris claro / gris oscuro) con sus nombres de calles y barrios encima
  const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
  const capa = () => {
    const t = oscuro() ? 'World_Dark_Gray' : 'World_Light_Gray';
    return L.layerGroup([
      L.tileLayer(`${ESRI}${t}_Base/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16, attribution: 'Mapa © Esri, HERE, Garmin, © OpenStreetMap' }),
      L.tileLayer(`${ESRI}${t}_Reference/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16 })
    ]);
  };
  let teselas = capa().addTo(mapa);
  new MutationObserver(() => { mapa.removeLayer(teselas); teselas = capa().addTo(mapa); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (op.botonesZoom) mapa.zoomControl.setPosition('topright');
  // La rueda solo hace zoom después de pulsar el mapa (para no atrapar el scroll de la página)
  mapa.on('click', () => mapa.scrollWheelZoom.enable());
  mapa.on('mouseout', () => mapa.scrollWheelZoom.disable());

  const zonasCiudad = D.ZONAS.filter(z => z.id !== 'alcala');
  const limites = L.latLngBounds(zonasCiudad.map(z => [z.lat, z.lng]));
  mapa.fitBounds(limites, { padding: [20, 20] });

  // --- Barrios que se pueden pulsar ---
  const zonasEl = {};
  if (op.elegirZona) {
    D.ZONAS.forEach(z => {
      const c = L.circle([z.lat, z.lng], { radius: 1300, className: 'zona-area', weight: 1.5 }).addTo(mapa);
      c.bindTooltip(z.nombre, { direction: 'top', className: 'mapa-etq' });
      c.on('click', e => { L.DomEvent.stopPropagation(e); op.onZona && op.onZona(z.id); });
      zonasEl[z.id] = c;
    });
  }
  let radio = null;

  // --- Profes ---
  const profes = op.profes || D.PROFES;
  const marcas = {};
  const cuenta = {};
  profes.filter(p => p.zona).forEach(p => {
    const z = D.zona(p.zona);
    const i = cuenta[p.zona] = (cuenta[p.zona] || 0) + 1;
    const ang = i * 2.3, d = i === 1 ? 0 : .0045 + (i % 2) * .002;
    const pos = [z.lat + Math.sin(ang) * d, z.lng + Math.cos(ang) * d * 1.3];
    const color = D.asig(p.asig[0]).c;
    const ini = p.nombre.split(' ').map(s => s[0]).join('').slice(0, 2);
    const icono = L.divIcon({ className: 'pin', iconSize: null,
      html: `<span class="pin-cuerpo"><i style="background:${color}">${ini}</i>${p.precio} €</span>` });
    const m = L.marker(pos, { icon: icono, riseOnHover: true, keyboard: true, title: `${p.nombre}, ${p.precio} € la hora` }).addTo(mapa);
    if (!op.onPin) {
      m.bindPopup(`<div class="mapa-pop"><b>${p.nombre}</b><span>${p.asig.map(a => D.asig(a).nombre).join(' · ')}</span><span>${p.nota ? '★ ' + String(p.nota).replace('.', ',') + ' · ' : ''}${p.clases ? p.clases + ' clases · ' : 'Nuevo · '}${z.nombre}</span><a href="profe.html?id=${p.id}">Ver perfil</a></div>`, { closeButton: false, offset: [0, -6] });
    } else m.on('click', () => op.onPin(p.id));
    m.on('mouseover', () => op.onHover && op.onHover(p.id));
    m.on('mouseout', () => op.onHover && op.onHover(null));
    marcas[p.id] = { m, p };
  });

  // Profes solo online
  const online = profes.filter(p => !p.zona);
  let nube = null;
  if (online.length && !op.sinOnline) { nube = document.createElement('div'); nube.className = 'online-nube'; caja.appendChild(nube); }

  // --- API ---
  let visibles = new Set(profes.map(p => p.id));
  function filtrar(fn) {
    visibles = new Set(profes.filter(fn).map(p => p.id));
    Object.values(marcas).forEach(({ m, p }) => { const e = m.getElement(); if (e) e.classList.toggle('apagado', !visibles.has(p.id)); });
    if (nube) {
      const n = online.filter(p => visibles.has(p.id)).length;
      nube.innerHTML = `<b>+ ${n} online</b> para toda la ciudad`;
      nube.hidden = !n;
    }
    return visibles.size;
  }
  function foco(id) {
    Object.values(marcas).forEach(({ m, p }) => { const e = m.getElement(); if (!e) return; const on = p.id === id; e.classList.toggle('foco', on); m.setZIndexOffset(on ? 1000 : 0); });
  }
  function zona(id, conRadio) {
    Object.entries(zonasEl).forEach(([k, c]) => c.getElement() && c.getElement().classList.toggle('activa', k === id));
    if (radio) { mapa.removeLayer(radio); radio = null; }
    if (conRadio && id) { const z = D.zona(id); radio = L.circle([z.lat, z.lng], { radius: 1500, className: 'zona-radio', weight: 2 }).addTo(mapa); }
  }
  function zoom(id, factor) {
    if (!id) return mapa.flyToBounds(limites, { padding: [20, 20], duration: .8 });
    const z = D.zona(id);
    mapa.flyTo([z.lat, z.lng], factor && factor > 2.4 ? 14 : 13, { duration: .8 });
  }
  setTimeout(() => mapa.invalidateSize(), 50);
  new ResizeObserver(() => mapa.invalidateSize()).observe(caja);
  filtrar(() => true);
  return { filtrar, foco, zona, zoom, contar: () => visibles.size, mapa };
};
