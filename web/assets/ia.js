/* «Asistente» de la maqueta. Todo se calcula en el navegador con reglas, para enseñar cómo funcionaría.
   En la versión real, interpretar() y los textos los haría un modelo de lenguaje (API de Claude) con estos mismos datos. */
window.IA = (() => {
  const D = window.D;
  const normal = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const SINONIMOS = {
    mat: ['mate', 'mates', 'matematica', 'algebra', 'ecuacion', 'fraccion', 'derivada', 'integral', 'calculo', 'geometria', 'trigonometria', 'estadistica'],
    ing: ['ingles', 'english', 'b1', 'b2', 'c1', 'first', 'cambridge', 'speaking'],
    fyq: ['fisica', 'quimica', 'formulacion', 'estequiometria', 'fyq'],
    len: ['lengua', 'sintaxis', 'comentario de texto', 'ortografia', 'redaccion', 'literatura'],
    pro: ['programacion', 'python', 'java', 'scratch', 'dam', 'daw', 'codigo', 'bases de datos'],
    mus: ['musica', 'piano', 'guitarra', 'solfeo', 'lenguaje musical', 'conservatorio'],
    bio: ['biologia', 'genetica', 'celula', 'anatomia'],
    his: ['historia', 'arte'],
    eco: ['economia', 'contabilidad', 'empresa', 'finanzas'],
    fra: ['frances', 'delf']
  };
  const ZONA_ALIAS = { aravaca: 'moncloa', moncloa: 'moncloa', 'puente de vallecas': 'vallecas', vallecas: 'vallecas', 'las rozas': 'rozas', rozas: 'rozas', pozuelo: 'pozuelo', boadilla: 'boadilla', alcala: 'alcala', sol: 'centro', lavapies: 'centro', malasana: 'centro', 'chamberi': 'chamberi', 'salamanca': 'salamanca', 'goya': 'salamanca', 'retiro': 'retiro', 'chamartin': 'chamartin', 'arganzuela': 'arganzuela', 'carabanchel': 'carabanchel', 'usera': 'usera', 'hortaleza': 'hortaleza', 'alcobendas': 'alcobendas', 'majadahonda': 'majadahonda', 'alcorcon': 'alcorcon', 'leganes': 'leganes', 'getafe': 'getafe', 'centro': 'centro' };
  const DIAS = { lunes: 'L', martes: 'M', miercoles: 'X', jueves: 'J', viernes: 'V', sabado: 'S', sabados: 'S' };
  const DIA_TXT = { L: 'lunes', M: 'martes', X: 'miércoles', J: 'jueves', V: 'viernes', S: 'sábado' };

  /* Texto libre → necesidades estructuradas */
  function interpretar(texto) {
    const t = ' ' + normal(texto) + ' ';
    const r = { asig: [], nivel: null, curso: null, zona: null, dias: [], franja: null, precioMax: null, modo: null, grupo: false, objetivo: null, tema: null, fecha: null };
    // Solo cuenta si la palabra empieza ahí («arte» no vale dentro de «martes»)
    for (const [id, ps] of Object.entries(SINONIMOS)) if (ps.some(p => new RegExp('(^|[^a-z0-9])' + p).test(t))) r.asig.push(id);
    let m;
    if ((m = t.match(/(\d)\s*(?:º|o|°)?\s*(?:de\s*)?(eso|bach|bachillerato|primaria)/))) {
      r.nivel = m[2].startsWith('bach') ? 'Bachillerato' : m[2] === 'eso' ? 'ESO' : 'Primaria';
      r.curso = `${m[1]}º ${r.nivel}`;
    } else if (/\b(eso|instituto)\b/.test(t)) r.nivel = 'ESO';
    else if (/bachiller/.test(t)) r.nivel = 'Bachillerato';
    else if (/primaria|cole\b|colegio/.test(t)) r.nivel = 'Primaria';
    if (/selectividad|\bpau\b|ebau|evau/.test(t)) { r.nivel = 'Bachillerato'; r.curso = r.curso || '2º Bachillerato'; r.objetivo = 'Preparar la PAU'; }
    if (/universidad|carrera|facultad/.test(t)) r.nivel = 'Universidad';
    if (/\bfp\b|ciclo|grado medio|grado superior/.test(t)) r.nivel = 'FP';
    for (const [alias, id] of Object.entries(ZONA_ALIAS)) if (t.includes(' ' + alias)) { r.zona = id; break; }
    for (const [d, c] of Object.entries(DIAS)) if (t.includes(d) && !r.dias.includes(c)) r.dias.push(c);
    if (/entre semana/.test(t) && !r.dias.length) r.dias = ['L', 'M', 'X', 'J', 'V'];
    if (/fin(es)? de semana/.test(t)) r.dias.push('S');
    if (/tarde|despues del cole|salir de clase/.test(t)) r.franja = 'tarde';
    if ((m = t.match(/(\d{2,3})\s*(?:€|eur|euros|pavos)/))) r.precioMax = +m[1];
    if (/online|videollamada|a distancia/.test(t)) r.modo = 'online';
    else if (/en casa|presencial|que venga|a domicilio/.test(t)) r.modo = 'presencial';
    if (/amig|grupo|compañer|primos|hermanos/.test(t)) r.grupo = true;
    if (!r.objetivo) {
      if (/suspend|cate|recuperar|septiembre/.test(t)) r.objetivo = 'Aprobar y recuperar';
      else if (/examen|control|parcial/.test(t)) r.objetivo = 'Preparar un examen';
      else if (/subir nota|sacar mejor|notable|sobresaliente/.test(t)) r.objetivo = 'Subir nota';
      else if (/organiz|tecnicas de estudio|se distrae|tdah|deberes/.test(t)) r.objetivo = 'Organizarse y estudiar mejor';
    }
    if ((m = t.match(/(?:le cuesta[n]?|no entiende|se atasca con|problemas con|flojo en|floja en)\s+(?:las?\s+|los?\s+|el\s+)?([a-z0-9 ]{3,40}?)(?=[,.;]| y | en | pero |$| para )/))) r.tema = m[1].trim();
    return r;
  }

  /* Necesidades → profes ordenados, con los motivos */
  function recomendar(n, cuantos = 3) {
    const lista = D.PROFES.map(p => {
      let s = 0; const por = [];
      const asigOk = n.asig.length ? n.asig.filter(a => p.asig.includes(a)) : [];
      if (n.asig.length && !asigOk.length) return null;
      if (asigOk.length) { s += 40; por.push(`Da ${asigOk.map(a => D.asig(a).nombre).join(' y ')}`); }
      if (n.nivel) { if (p.niveles.includes(n.nivel)) { s += 20; por[por.length - 1] = (por[por.length - 1] || 'Da clase') + ` en ${n.curso || n.nivel}`; } else s -= 25; }
      if (n.modo === 'online' && p.modo === 'presencial') return null;
      if (n.modo === 'presencial' && p.modo === 'online') return null;
      if (n.zona && p.zona) {
        const km = D.distancia(n.zona, p.zona) * 0.075;
        if (km > 12 && p.modo === 'presencial') return null; // demasiado lejos para ir a casa
        if (km > 12) { s += 2; por.push('Online (vive lejos de ' + D.zona(n.zona).nombre + ')'); }
        else { s += Math.max(0, 25 - km * 3); por.push(p.zona === n.zona ? `Vive en ${D.zona(n.zona).nombre}` : `A ${D.km(n.zona, p.zona)} km de ${D.zona(n.zona).nombre}`); }
      }
      else if (n.zona && !p.zona) { s += 4; por.push('Online, sin desplazamientos'); }
      if (n.precioMax) { if (p.precio <= n.precioMax) { s += 10; por.push(`${p.precio} €/h, dentro de tu presupuesto`); } else s -= 30; }
      if (n.dias.length) {
        const libres = p.libre.filter(h => n.dias.includes(h[0]));
        if (libres.length) { s += 12; const d = [...new Set(libres.map(h => h[0]))].slice(0, 2); por.push(`Libre ${d.map(x => DIA_TXT[x]).join(' y ')} por la tarde`); } else s -= 10;
      }
      if (n.grupo && p.grupos) { s += 8; por.push('Hace grupos de estudio'); }
      if (n.objetivo === 'Preparar la PAU' && /PAU/.test(p.bio)) { s += 8; por.push('Prepara la PAU'); }
      if (n.objetivo === 'Organizarse y estudiar mejor' && /estudio|organiz/i.test(p.bio)) { s += 8; por.push('Trabaja técnicas de estudio'); }
      s += (p.nota || 4.5) * 3 + Math.min(p.clases, 300) / 60;
      por.push(p.nota ? `★ ${String(p.nota).replace('.', ',')} con ${p.clases} clases` : 'Profe nuevo, revisado en persona');
      return { p, s, por: por.slice(0, 4) };
    }).filter(Boolean).sort((a, b) => b.s - a.s);
    const max = lista[0] ? lista[0].s : 1;
    return lista.slice(0, cuantos).map(x => ({ ...x, encaje: Math.max(62, Math.min(98, Math.round(x.s / max * 97))) }));
  }

  /* Plan de estudio hasta una fecha */
  function plan({ asig, fecha, horas, temas, porDias = false }) {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const fin = new Date(fecha); fin.setHours(0, 0, 0, 0);
    // Con menos de dos semanas (y si se pide), el plan va día a día
    const quedan = Math.round((fin - hoy) / 864e5);
    if (porDias && quedan >= 1 && quedan <= 13) {
      const ts = temas.length ? temas : ['Repaso general'];
      const out = Array.from({ length: quedan }, (_, i) => {
        const d = new Date(hoy); d.setDate(hoy.getDate() + i); const faltan = quedan - i;
        const tema = faltan === 1 ? 'Repaso ligero de los resúmenes y a descansar pronto'
          : faltan === 2 && quedan >= 3 ? 'Simulacro: un examen de práctica con el reloj delante'
          : `${ts[i % ts.length]}: ejercicios, empezando por los fallos`;
        return { semana: i + 1, ini: d, tema, etiqueta: d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' }), clases: 1, solo: 0, ultima: faltan === 1 };
      });
      return { semanas: out, dias: quedan, asig, porDias: true };
    }
    const dias = Math.max(7, quedan);
    const semanas = Math.min(10, Math.max(1, Math.ceil(dias / 7)));
    const ts = temas.length ? temas : ['Repaso general'];
    const out = [];
    for (let i = 0; i < semanas; i++) {
      const ini = new Date(hoy); ini.setDate(hoy.getDate() + i * 7);
      const ultima = i === semanas - 1;
      const tema = ultima ? 'Simulacro y repaso de errores' : ts[Math.min(ts.length - 1, Math.floor(i / Math.max(1, (semanas - 1) / ts.length)))];
      const clases = ultima ? 1 : Math.max(1, Math.round(horas / 2));
      const solo = Math.max(0, horas - clases);
      out.push({ semana: i + 1, ini, tema, clases, solo, ultima });
    }
    return { semanas: out, dias, asig };
  }

  /* Texto que se va escribiendo letra a letra */
  async function escribir(el, txt, vel = 14) {
    el.textContent = '';
    for (let i = 0; i < txt.length; i++) { el.textContent += txt[i]; if (i % 2 === 0) await new Promise(r => setTimeout(r, vel)); }
  }
  const espera = ms => new Promise(r => setTimeout(r, ms));

  return { interpretar, recomendar, plan, escribir, espera, normal, DIA_TXT };
})();
