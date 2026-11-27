/* Conexión con Supabase (proyecto ClasUno, zlugjjcoatjdvvepilhx, organización Clasuno).
   La clave es la «publishable»: está hecha para ir en el navegador. La seguridad la ponen las reglas (RLS) de la base de datos.
   Si Supabase no responde o todavía no hay profes aprobados, la web sigue con los datos de ejemplo (D.modo = 'ejemplo'). */
window.SUPA = (() => {
  const URL_SB = 'https://zlugjjcoatjdvvepilhx.supabase.co';
  const KEY = 'sb_publishable_lOPLTjFBizSW4zwLd34L6w_B4GWWTAb';
  const D = window.D;
  D.modo = 'ejemplo';
  if (!window.supabase || !window.supabase.createClient) { D.listo = Promise.resolve(); return null; }
  const sb = window.supabase.createClient(URL_SB, KEY, { auth: { persistSession: true, autoRefreshToken: true } });

  const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const lista = v => Array.isArray(v) ? v : (typeof v === 'string' && v ? (v.startsWith('[') || v.startsWith('{') ? (() => { try { return JSON.parse(v.replace(/^\{(.*)\}$/, '[$1]')); } catch (e) { return v.replace(/[{}"]/g, '').split(','); } })() : v.split(',')) : []);

  // Nombres de la base de datos ↔ identificadores de la web
  const zonaDeNombre = n => { const x = norm(n); const z = D.ZONAS.find(z => { const y = norm(z.nombre); return x === y || x.startsWith(y) || y.startsWith(x); }); return z ? z.id : null; };
  const NOMBRE_BD = { rozas: 'Las Rozas de Madrid', pozuelo: 'Pozuelo de Alarcón', boadilla: 'Boadilla del Monte' };
  const nombreZonaBD = id => NOMBRE_BD[id] || (D.zona(id) || {}).nombre || null;
  const asigDeNombre = n => (D.ASIG.find(a => norm(a.nombre) === norm(n)) || {}).id;
  const MODO = { presencial: 'presencial', online: 'online', ambas: 'ambas', both: 'ambas', in_person: 'presencial', 'en persona': 'presencial' };

  function aProfe(t) {
    const asig = lista(t.subjects).map(asigDeNombre).filter(Boolean);
    const precio = Number(t.price) || 0;
    return {
      id: t.id, real: true, nombre: t.nombre || 'Profe', avatar: t.avatar || null,
      estudios: [t.degree, t.center].filter(Boolean).join(' · ') || 'Estudios comprobados',
      asig, niveles: lista(t.levels), modo: MODO[norm(t.modality)] || 'ambas', zona: t.zone ? zonaDeNombre(t.zone) : null,
      precio, precioGrupo: Math.round(precio * 0.6), nota: 0, clases: Number(t.classes) || 0,
      verificado: !!t.verified, certificado: !!t.certificado, grupos: !!t.grupos, responde: 'pocas horas',
      idiomas: lista(t.languages).length ? lista(t.languages) : ['Español'],
      corta: t.headline || '', bio: t.description || '', resenas: [],
      libre: lista(t.availability).filter(x => /^[LMXJVS]\d{2}$/.test(x))
    };
  }

  // Grupo de la base de datos → formato de la web. Los grupos que crea una familia pueden no tener profe todavía.
  function aGrupo(x) {
    if (!x || !x.id) return null;
    const g = { id: x.id, profe: x.profe || null, asig: asigDeNombre(x.asignatura) || 'mat', curso: x.curso, zona: zonaDeNombre(x.zona),
      dia: x.dia, hora: x.hora, plazas: x.plazas, real: true,
      // «ocupadas» son las plazas de los demás: si ya estás dentro, tu plaza se pinta aparte («tú»)
      ocupadas: Math.max(0, (Number(x.ocupadas) || 0) - (x.dentro ? 1 : 0)),
      privado: !!x.privado, mio: !!x.mio, dentro: !!x.dentro, codigo: x.codigo || null };
    return g.zona && (!g.profe || D.profe(g.profe)) ? g : null;
  }

  // ---------- Profes aprobados ----------
  const conTiempo = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('Supabase no responde')), ms))]);
  D.listo = (async () => {
    try {
      const { data, error } = await conTiempo(sb.rpc('profes_publicos'), 5000);
      if (error) throw error;
      const reales = (data || []).map(aProfe).filter(p => p.asig.length);
      if (reales.length) { D.PROFES.splice(0, D.PROFES.length, ...reales); D.modo = 'real'; }
      // Grupos de verdad (si la tabla existe)
      const g = await sb.rpc('grupos_abiertos');
      if (!g.error && D.modo === 'real') {
        D.GRUPOS.splice(0, D.GRUPOS.length, ...(g.data || []).map(aGrupo).filter(Boolean));
      }
    } catch (e) { D.supaError = e.message || String(e); console.info('Supabase: se usan datos de ejemplo —', D.supaError); }
    document.documentElement.dataset.datos = D.modo;
    const base = document.querySelector('.pie .base .mono');
    if (base) base.textContent = D.modo === 'real' ? 'Datos en directo' : 'Datos de ejemplo';
  })();

  // ---------- Sesión ----------
  let usuario = null;
  function sincronizar(session) {
    usuario = session ? session.user : null;
    try {
      if (usuario) {
        const m = usuario.user_metadata || {};
        localStorage.setItem('sesion', JSON.stringify({ id: usuario.id, real: true, email: usuario.email,
          nombre: m.first_name || (usuario.email || '').split('@')[0], apellidos: m.last_name || '',
          rol: m.role === 'teacher' ? 'profe' : (m.tipo || 'familia'), hijos: m.hijos || [], zona: m.zona || '' }));
      } else {
        const s = JSON.parse(localStorage.getItem('sesion') || 'null');
        if (s && s.real) localStorage.removeItem('sesion');
      }
    } catch (e) {}
    const b = document.querySelector('.cab .nav .boton-entrar');
    if (b) { b.textContent = usuario ? 'Mi panel' : 'Entrar'; b.href = usuario ? (rolActual() === 'profe' ? 'panel.html?rol=profe' : 'panel.html') : 'entrar.html'; }
  }
  const rolActual = () => usuario && (usuario.user_metadata || {}).role === 'teacher' ? 'profe' : 'familia';
  const sesionLista = sb.auth.getSession().then(({ data }) => { sincronizar(data.session); return data.session; }).catch(() => null);
  sb.auth.onAuthStateChange((ev, session) => {
    sincronizar(session);
    if (ev === 'SIGNED_IN') terminarBorradorProfe();
  });

  const errorBonito = e => {
    const m = (e && (e.message || e.error_description)) || String(e);
    if (/already registered|already exists/i.test(m)) return 'Ya existe una cuenta con ese correo. Prueba a entrar.';
    if (/invalid login|invalid credentials/i.test(m)) return 'Correo o contraseña incorrectos.';
    if (/not confirmed/i.test(m)) return 'Confirma tu correo antes de entrar: revisa tu bandeja de entrada.';
    if (/rate limit|too many/i.test(m)) return 'Demasiados intentos. Espera unos minutos.';
    if (/password/i.test(m)) return 'La contraseña es demasiado débil. Usa al menos 8 caracteres.';
    if (/function .* does not exist|relation .* does not exist|PGRST202|42P01/i.test(m)) return 'Falta ejecutar el SQL «1-conectar-web.sql» en Supabase.';
    return m;
  };

  async function registrar({ email, clave, nombre, apellidos, rol, extra = {} }) {
    const { data, error } = await sb.auth.signUp({ email, password: clave, options: {
      data: { role: rol === 'profe' ? 'teacher' : 'student', first_name: nombre, last_name: apellidos, ...extra },
      emailRedirectTo: location.origin + location.pathname.replace(/[^/]*$/, '') + (rol === 'profe' ? 'panel.html?rol=profe' : 'panel.html')
    } });
    if (error) throw new Error(errorBonito(error));
    return data; // data.session es null si hay que confirmar el correo
  }
  async function entrar(email, clave) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password: clave });
    if (error) throw new Error(errorBonito(error));
    return data;
  }
  async function salir() { await sb.auth.signOut(); try { localStorage.removeItem('sesion'); } catch (e) {} }
  async function recuperar(email) {
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname.replace(/[^/]*$/, '') + 'entrar.html' });
    if (error) throw new Error(errorBonito(error));
  }

  // ---------- Perfil del profe ----------
  async function subirFoto(dataUrl) {
    const blob = await (await fetch(dataUrl)).blob();
    const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
    const ruta = `${usuario.id}/foto-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from('avatars').upload(ruta, blob, { contentType: blob.type, upsert: true });
    if (error) throw new Error('No se ha podido subir la foto: ' + error.message);
    const url = sb.storage.from('avatars').getPublicUrl(ruta).data.publicUrl;
    await sb.from('profiles').update({ avatar_url: url }).eq('id', usuario.id);
    return url;
  }
  async function guardarPerfilProfe(b) {
    if (!usuario) throw new Error('Hace falta iniciar sesión');
    if (b.foto) await subirFoto(b.foto);
    const datos = {
      degree: b.titulacion, center: b.centro || null, headline: b.corta, description: b.bio,
      modality: b.modo, zone: b.modo === 'online' ? null : nombreZonaBD(b.zona), price_per_hour: b.precio,
      availability: b.libre, languages: ['Español'], acepta_grupos: !!b.grupos
    };
    const { error } = await sb.rpc('guardar_perfil_profe', { datos, asignaturas: b.asig.map(id => D.asig(id).nombre), niveles: b.niveles });
    if (error) throw new Error(errorBonito(error));
  }
  async function terminarBorradorProfe() {
    let b; try { b = JSON.parse(localStorage.getItem('borradorProfe') || 'null'); } catch (e) {}
    if (!b || !usuario || rolActual() !== 'profe') return;
    try { await guardarPerfilProfe(b); localStorage.removeItem('borradorProfe'); window.U && U.tostada('Perfil guardado. Te escribimos para la videollamada.'); }
    catch (e) { console.warn(e); }
  }

  // ---------- Favoritos ----------
  async function sincronizarFavs() {
    if (!usuario || D.modo !== 'real') return;
    const { data } = await sb.from('favorites').select('teacher_id').eq('student_id', usuario.id);
    if (data) try { localStorage.setItem('favs', JSON.stringify(data.map(x => x.teacher_id))); } catch (e) {}
  }
  async function fav(teacherId, on) {
    if (!usuario || !D.profe(teacherId) || !D.profe(teacherId).real) return;
    if (on) await sb.from('favorites').insert({ student_id: usuario.id, teacher_id: teacherId });
    else await sb.from('favorites').delete().eq('student_id', usuario.id).eq('teacher_id', teacherId);
  }

  // ---------- Clases, informes y grupos ----------
  async function pedirClase({ teacherId, tipo, empieza, minutos, alumno }) {
    const { data, error } = await sb.from('clases').insert({ teacher_id: teacherId, familia_id: usuario.id, tipo, empieza, minutos, alumno }).select().single();
    if (error) throw new Error(errorBonito(error));
    return data;
  }
  const misClases = async () => (await sb.from('clases').select('*').order('empieza')).data || [];
  const cambiarClase = async (id, estado) => { const { error } = await sb.from('clases').update({ estado }).eq('id', id); if (error) throw new Error(errorBonito(error)); };
  const misInformes = async () => (await sb.from('informes').select('*').order('creado', { ascending: false })).data || [];
  async function enviarInforme(inf) { const { error } = await sb.from('informes').insert({ ...inf, teacher_id: usuario.id }); if (error) throw new Error(errorBonito(error)); }
  async function unirseGrupo(id, alumno) { const { error } = await sb.from('grupo_miembros').insert({ grupo_id: id, familia_id: usuario.id, alumno }); if (error) throw new Error(errorBonito(error)); }
  // Si sale quien creó el grupo, pasa a otra familia (o se borra si no queda nadie): lo hace la base de datos
  async function salirGrupo(id) { const { error } = await sb.rpc('salir_de_grupo', { gid: id }); if (error) throw new Error(errorBonito(error)); }
  async function proponerGrupo(p) { const { error } = await sb.from('grupo_propuestas').insert(p); if (error) throw new Error(errorBonito(error)); }
  // Crear un grupo como familia (público: sale en el tablón; privado: solo con el enlace de invitación)
  async function crearGrupo(p) {
    const { data, error } = await sb.rpc('crear_grupo', { p_asignatura: p.asignatura, p_curso: p.curso, p_zona: p.zona, p_dia: p.dia,
      p_hora: p.hora, p_plazas: p.plazas, p_privado: !!p.privado, p_alumno: p.alumno || null });
    if (error) throw new Error(errorBonito(error));
    return aGrupo(data);
  }
  async function grupoPorCodigo(c) { const { data, error } = await sb.rpc('grupo_por_codigo', { c }); return error ? null : aGrupo(data); }
  async function unirseConCodigo(c, alumno) { const { error } = await sb.rpc('unirse_con_codigo', { c, p_alumno: alumno || null }); if (error) throw new Error(errorBonito(error)); }

  // ---------- Panel de un grupo (grupo.html) ----------
  // Devuelve null si el grupo no existe o no estás dentro
  async function grupoDetalle(id) {
    const { data, error } = await sb.rpc('grupo_detalle', { gid: id });
    if (error) throw new Error(errorBonito(error));
    if (!data) return null;
    const g = aGrupo(data) || { id: data.id, real: true, asig: asigDeNombre(data.asignatura) || 'mat', curso: data.curso, zona: zonaDeNombre(data.zona) || null,
      dia: data.dia, hora: data.hora, plazas: data.plazas, ocupadas: Math.max(0, (Number(data.ocupadas) || 0) - (data.dentro ? 1 : 0)), privado: !!data.privado,
      mio: !!data.mio, dentro: !!data.dentro, profe: null };
    return Object.assign(g, { codigo: data.codigo, creado: data.creado, gestiona: !!data.gestiona, yo: data.yo, profeInfo: data.profe_info || null,
      miembros: data.miembros || [], sesiones: data.sesiones || [] });
  }
  const mensajesGrupo = async id => (await sb.from('grupo_mensajes').select('id, autor_id, texto, creado').eq('grupo_id', id).order('creado').limit(300)).data || [];
  async function enviarGrupo(id, texto) {
    const { data, error } = await sb.from('grupo_mensajes').insert({ grupo_id: id, autor_id: usuario.id, texto }).select('id, autor_id, texto, creado').single();
    if (error) throw new Error(errorBonito(error));
    return data;
  }
  function escucharGrupo(id, alLlegar) {
    const canal = sb.channel('grupo-' + id).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'grupo_mensajes', filter: `grupo_id=eq.${id}` }, p => alLlegar(p.new)).subscribe();
    return () => sb.removeChannel(canal);
  }
  async function ajustarGrupo(id, a) {
    const { error } = await sb.rpc('ajustar_grupo', { gid: id, p_privado: a.privado ?? null, p_plazas: a.plazas ?? null, p_dia: a.dia ?? null, p_hora: a.hora ?? null });
    if (error) throw new Error(errorBonito(error));
  }
  async function nuevoEnlaceGrupo(id) { const { data, error } = await sb.rpc('nuevo_enlace_grupo', { gid: id }); if (error) throw new Error(errorBonito(error)); return data; }
  async function borrarGrupo(id) { const { error } = await sb.from('grupos').delete().eq('id', id); if (error) throw new Error(errorBonito(error)); }
  async function marcarSesion(id, s) {
    const { data, error } = await sb.from('grupo_sesiones').insert({ grupo_id: id, fecha: s.fecha, hora: s.hora || null, estado: s.estado, nota: s.nota || null }).select().single();
    if (error) throw new Error(errorBonito(error));
    return data;
  }
  async function quitarSesion(sesionId) { const { error } = await sb.from('grupo_sesiones').delete().eq('id', sesionId); if (error) throw new Error(errorBonito(error)); }

  // ---------- Chat ----------
  async function conversaciones() {
    const { data } = await sb.from('conversations').select('id, student_id, teacher_id, created_at').order('created_at', { ascending: false });
    return data || [];
  }
  async function abrirConversacion(teacherId) {
    let { data } = await sb.from('conversations').select('id').eq('student_id', usuario.id).eq('teacher_id', teacherId).maybeSingle();
    if (data) return data.id;
    const r = await sb.from('conversations').insert({ student_id: usuario.id, teacher_id: teacherId }).select('id').single();
    if (r.error) throw new Error(errorBonito(r.error));
    return r.data.id;
  }
  const mensajes = async convId => (await sb.from('messages').select('id, sender_id, body, created_at').eq('conversation_id', convId).order('created_at')).data || [];
  async function enviar(convId, body) { const { error } = await sb.from('messages').insert({ conversation_id: convId, sender_id: usuario.id, body }); if (error) throw new Error(errorBonito(error)); }
  function escuchar(convId, alLlegar) {
    const canal = sb.channel('chat-' + convId).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` }, p => alLlegar(p.new)).subscribe();
    return () => sb.removeChannel(canal);
  }

  // ---------- Soporte ----------
  async function soporte(email, message) { const { error } = await sb.from('support_tickets').insert({ email, message, user_id: usuario ? usuario.id : null }); if (error) throw new Error(errorBonito(error)); }

  return { sb, sesionLista, usuario: () => usuario, rol: rolActual, registrar, entrar, salir, recuperar, guardarPerfilProfe, sincronizarFavs, fav,
    pedirClase, misClases, cambiarClase, misInformes, enviarInforme, unirseGrupo, salirGrupo, proponerGrupo, crearGrupo, grupoPorCodigo, unirseConCodigo,
    grupoDetalle, mensajesGrupo, enviarGrupo, escucharGrupo, ajustarGrupo, nuevoEnlaceGrupo, borrarGrupo, marcarSesion, quitarSesion,
    conversaciones, abrirConversacion, mensajes, enviar, escuchar, soporte, nombreZonaBD, errorBonito };
})();
