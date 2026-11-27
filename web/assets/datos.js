/* Datos de ejemplo para la maqueta. En la versión real salen de Supabase
   (vista public_teachers, tablas zones, subjects, levels…). */
window.D = (() => {
  const ASIG = [
    { id: 'mat', nombre: 'Matemáticas', c: '#E4552A' },
    { id: 'ing', nombre: 'Inglés', c: '#1E4C8A' },
    { id: 'fyq', nombre: 'Física y Química', c: '#7A4BC2' },
    { id: 'len', nombre: 'Lengua', c: '#B7791F' },
    { id: 'pro', nombre: 'Programación', c: '#13857B' },
    { id: 'mus', nombre: 'Música', c: '#C2417A' },
    { id: 'bio', nombre: 'Biología', c: '#3F7D3A' },
    { id: 'his', nombre: 'Historia', c: '#7C5A3A' },
    { id: 'eco', nombre: 'Economía y contabilidad', c: '#4A5F6E' },
    { id: 'fra', nombre: 'Francés', c: '#2D6FB0' }
  ];
  const NIVELES = ['Primaria', 'ESO', 'Bachillerato', 'FP', 'Universidad', 'Adultos'];

  // Barrios con coordenadas reales (aprox. centro de cada barrio o municipio)
  const ZONAS = [
    ['centro', 'Centro', 40.4168, -3.7038], ['chamberi', 'Chamberí', 40.4365, -3.7038], ['salamanca', 'Salamanca', 40.4292, -3.6797],
    ['chamartin', 'Chamartín', 40.4587, -3.6771], ['retiro', 'Retiro', 40.4097, -3.6768], ['moncloa', 'Moncloa-Aravaca', 40.4392, -3.7385],
    ['arganzuela', 'Arganzuela', 40.3986, -3.6977], ['carabanchel', 'Carabanchel', 40.3833, -3.7310], ['usera', 'Usera', 40.3836, -3.7067],
    ['vallecas', 'Vallecas', 40.3889, -3.6585], ['hortaleza', 'Hortaleza', 40.4722, -3.6417], ['alcobendas', 'Alcobendas', 40.5373, -3.6372],
    ['rozas', 'Las Rozas', 40.4929, -3.8737], ['pozuelo', 'Pozuelo', 40.4350, -3.8137], ['majadahonda', 'Majadahonda', 40.4731, -3.8722],
    ['boadilla', 'Boadilla', 40.4052, -3.8781], ['alcorcon', 'Alcorcón', 40.3457, -3.8243], ['leganes', 'Leganés', 40.3281, -3.7645],
    ['getafe', 'Getafe', 40.3057, -3.7329], ['alcala', 'Alcalá de Henares', 40.4818, -3.3644]
  ].map(([id, nombre, lat, lng]) => ({ id, nombre, lat, lng }));
  const zona = id => ZONAS.find(z => z.id === id);
  const kmEntre = (a, b) => {
    const A = zona(a), B = zona(b); if (!A || !B) return 99;
    const r = Math.PI / 180, dLat = (B.lat - A.lat) * r, dLng = (B.lng - A.lng) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(A.lat * r) * Math.cos(B.lat * r) * Math.sin(dLng / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(h));
  };
  const distancia = (a, b) => kmEntre(a, b) / 0.075; // misma escala que antes (120 ≈ 9 km)
  const km = (a, b) => kmEntre(a, b).toFixed(1).replace('.', ',');

  const P = (id, nombre, estudios, asig, niveles, modo, zonaId, precio, nota, clases, extra = {}) =>
    ({ id, nombre, estudios, asig, niveles, modo, zona: zonaId, precio, nota, clases, verificado: true, certificado: true,
       grupos: false, responde: '1 h', idiomas: ['Español'], ...extra });

  const PROFES = [
    P('laura', 'Laura Méndez', 'Grado en Matemáticas · UAM', ['mat', 'fyq'], ['ESO', 'Bachillerato'], 'ambas', 'chamberi', 18, 4.9, 240,
      { grupos: true, corta: 'Matemáticas y física con ejercicios graduados y seguimiento tema a tema.',
        bio: 'Graduada en Matemáticas, llevo seis años dando refuerzo de ESO y Bachillerato. Empiezo cada tema desde lo básico, resolvemos ejercicios juntos y dejo tareas cortas para el día siguiente. También preparo la PAU (antes EBAU) con exámenes de años anteriores.',
        resenas: [['Marta G.', 5, 'Mi hijo ha pasado de suspender a sacar notable en un trimestre.'], ['Javier P.', 5, 'Puntual, clara y muy paciente.'], ['Lucía R.', 4, 'Muy buena, echo en falta más horas por la tarde.']] }),
    P('daniel', 'Daniel Ortiz', 'Filología Inglesa · C2 Cambridge', ['ing', 'len'], ['Primaria', 'ESO', 'Bachillerato', 'Adultos'], 'online', null, 15, 4.8, 180,
      { idiomas: ['Español', 'Inglés'], corta: 'Inglés con conversación desde el primer día y preparación de B1, B2 y C1.',
        bio: 'Graduado en Filología Inglesa con C2 de Cambridge. Mezclo gramática y conversación desde la primera clase y preparo exámenes oficiales. En lengua trabajo comentario de texto y expresión escrita.',
        resenas: [['Carmen S.', 5, 'Mi hija aprobó el B2 a la primera.'], ['Andrés M.', 5, 'Muy flexible con los horarios.']] }),
    P('sara', 'Sara Iglesias', 'Ingeniería Informática · UPM', ['pro', 'mat'], ['FP', 'Universidad'], 'online', null, 25, 4.9, 120,
      { corta: 'Programación con proyectos reales para FP y universidad.',
        bio: 'Ingeniera informática y desarrolladora web. Enseño con proyectos de verdad, de las bases a una aplicación completa, y reviso tu código entre clases por mensaje.',
        resenas: [['Pablo D.', 5, 'Me ayudó a sacar Programación del ciclo.'], ['Irene L.', 5, 'Clases prácticas y con ejemplos reales.']] }),
    P('marcos', 'Marcos Vidal', 'Grado en Biología · UCM', ['bio', 'fyq'], ['ESO', 'Bachillerato', 'Universidad'], 'presencial', 'carabanchel', 20, 4.7, 95,
      { grupos: true, corta: 'Biología y química con esquemas y exámenes de otros años.',
        bio: 'Graduado en Biología por la Complutense. Preparo esquemas de cada tema y repasamos exámenes anteriores. Clases en persona, también en grupos de hasta tres alumnos del barrio.',
        resenas: [['Rosa T.', 5, 'Mi hijo por fin entiende la genética.'], ['Damián C.', 4, 'Las clases en grupo funcionan muy bien.']] }),
    P('elena', 'Elena Cano', 'Conservatorio · Piano y lenguaje musical', ['mus'], ['Primaria', 'ESO', 'Adultos'], 'ambas', 'rozas', 22, 5.0, 310,
      { corta: 'Piano y lenguaje musical adaptados a cada edad.',
        bio: 'Formada en el conservatorio. Adapto cada clase a la edad: juegos para los pequeños y repertorio a elegir para adolescentes. Preparo pruebas de acceso al conservatorio.',
        resenas: [['Sonia V.', 5, 'Mi hija de siete años está encantada.'], ['Raúl E.', 5, 'Mi hijo superó la prueba de acceso.']] }),
    P('pablo', 'Pablo Ruiz', 'Grado en Historia · UAH', ['his', 'len'], ['ESO', 'Bachillerato'], 'ambas', 'alcala', 14, 4.6, 70,
      { grupos: true, corta: 'Historia y lengua con líneas del tiempo y técnicas de estudio.',
        bio: 'Graduado en Historia por la Universidad de Alcalá. Ordeno la materia con líneas del tiempo y resúmenes y enseño técnicas de estudio. En lengua, comentario y ortografía.',
        resenas: [['Elena F.', 5, 'Con sus resúmenes mi hijo estudia mucho mejor.'], ['Hugo B.', 4, 'Explica claro y es muy puntual.']] }),
    P('nuria', 'Nuria Sanz', 'Máster en Profesorado · Matemáticas', ['mat'], ['Primaria', 'ESO'], 'presencial', 'salamanca', 19, 4.8, 150,
      { grupos: true, corta: 'Matemáticas de primaria y ESO sin miedo, paso a paso.',
        bio: 'Profesora de matemáticas con el máster de profesorado. Me especializo en alumnos que han cogido manía a la asignatura: empezamos por lo que sí saben.',
        resenas: [['Óscar L.', 5, 'Mi hija ya no llora con los deberes.'], ['Beatriz M.', 5, 'Muy cercana y con método.']] }),
    P('ivan', 'Iván Rojas', 'Grado en Física · UCM', ['fyq', 'mat'], ['Bachillerato', 'Universidad'], 'ambas', 'moncloa', 24, 4.9, 205,
      { corta: 'Física de bachillerato y primeros cursos de carrera.',
        bio: 'Físico de la Complutense. Preparo la PAU de física y asignaturas de primero de ingeniería. Mucho problema resuelto y explicado en pizarra.',
        resenas: [['Clara N.', 5, 'Saqué un 9 en física de la PAU.'], ['Tomás R.', 5, 'Explica lo que en clase no se entiende.']] }),
    P('ana', 'Ana Lorenzo', 'Traducción e Interpretación · francés C1', ['fra', 'ing'], ['ESO', 'Bachillerato', 'Adultos'], 'ambas', 'chamartin', 17, 4.7, 88,
      { idiomas: ['Español', 'Francés', 'Inglés'], corta: 'Francés e inglés con conversación y exámenes DELF.',
        bio: 'Traductora con francés C1. Preparo DELF A2–B2 y refuerzo de francés de ESO. Las clases son en francés desde el primer día, a tu ritmo.',
        resenas: [['Lola P.', 5, 'Aprobé el DELF B1.'], ['Iker S.', 4, 'Muy dinámica.']] }),
    P('jorge', 'Jorge Martín', 'Técnico Superior en Administración y Finanzas', ['eco'], ['FP', 'Bachillerato'], 'ambas', 'getafe', 16, 4.8, 64,
      { grupos: true, corta: 'Contabilidad, economía y módulos de FP de administración.',
        bio: 'Trabajo en una asesoría y doy clase de contabilidad, gestión financiera y economía de la empresa. Ideal para módulos de grado medio y superior de administración.',
        resenas: [['Sofía T.', 5, 'Por fin entiendo el plan contable.'], ['Rubén A.', 5, 'Muy práctico, con casos reales.']] }),
    P('carmen', 'Carmen Gil', 'Grado en Filología Hispánica · UCM', ['len', 'his'], ['ESO', 'Bachillerato'], 'presencial', 'retiro', 18, 4.9, 175,
      { grupos: true, corta: 'Lengua y literatura: comentario de texto y redacción.',
        bio: 'Filóloga. Comentario de texto, sintaxis y literatura para la PAU. Trabajamos con textos reales y corrijo redacciones entre clases.',
        resenas: [['Paula R.', 5, 'Mi nota de lengua subió dos puntos.'], ['Diego V.', 5, 'La sintaxis ya no es un problema.']] }),
    P('hugo', 'Hugo Navarro', 'Estudiante de 4º de Matemáticas · UC3M', ['mat', 'pro'], ['Primaria', 'ESO'], 'presencial', 'leganes', 12, 4.6, 40,
      { grupos: true, corta: 'Refuerzo de matemáticas y primeros pasos en programación.',
        bio: 'Estudio el último curso de Matemáticas. Doy refuerzo de primaria y ESO y talleres de programación con Scratch y Python para chavales.',
        resenas: [['Eva M.', 5, 'Mi hijo está encantado con Scratch.']] }),
    P('lucia', 'Lucía Prieto', 'Grado en Biotecnología · UAM', ['bio', 'fyq', 'mat'], ['ESO', 'Bachillerato'], 'ambas', 'alcobendas', 19, 4.8, 132,
      { corta: 'Ciencias de ESO y bachillerato con mapas mentales.',
        bio: 'Biotecnóloga. Doy biología, química y matemáticas con mapas mentales y muchos ejemplos de laboratorio.',
        resenas: [['Alba C.', 5, 'Explica la química como nadie.'], ['Marco D.', 5, 'Muy organizada.']] }),
    P('sergio', 'Sergio Blanco', 'Grado en Música · Guitarra', ['mus'], ['Primaria', 'ESO', 'Adultos'], 'presencial', 'vallecas', 15, 4.7, 98,
      { grupos: true, corta: 'Guitarra y lenguaje musical para todas las edades.',
        bio: 'Guitarrista titulado. Clases de guitarra española y eléctrica, lenguaje musical y grupos pequeños para tocar juntos.',
        resenas: [['Nerea G.', 5, 'En tres meses toco mis canciones favoritas.']] }),
    P('marta', 'Marta Ibáñez', 'Grado en Economía · Carlos III', ['eco', 'mat'], ['Bachillerato', 'Universidad'], 'online', null, 20, 4.8, 110,
      { corta: 'Economía, estadística y matemáticas aplicadas.',
        bio: 'Economista. Doy economía de bachillerato, estadística y matemáticas aplicadas a las ciencias sociales.',
        resenas: [['Jaime O.', 5, 'Aprobé estadística gracias a ella.']] }),
    P('alberto', 'Alberto Peña', 'Grado en Ingeniería de Telecomunicación', ['pro', 'fyq'], ['Bachillerato', 'FP', 'Universidad'], 'ambas', 'pozuelo', 23, 4.9, 140,
      { corta: 'Programación, electrónica y física para técnicos.',
        bio: 'Ingeniero de telecomunicación. Programación (Python, Java, C), electrónica y física para FP y universidad.',
        resenas: [['Lara B.', 5, 'Me salvó Sistemas en el ciclo.']] }),
    P('irene', 'Irene Castro', 'Grado en Educación Primaria · mención inglés', ['ing', 'mat', 'len'], ['Primaria'], 'presencial', 'majadahonda', 15, 4.9, 220,
      { grupos: true, corta: 'Deberes, técnicas de estudio e inglés para primaria.',
        bio: 'Maestra de primaria con mención en inglés. Ayudo con deberes, lectura, cálculo e inglés, y enseño a organizarse.',
        resenas: [['Gema F.', 5, 'Mi hijo ahora se organiza solo.'], ['Luis K.', 5, 'Una maestra de las de antes.']] }),
    P('raul', 'Raúl Herrero', 'Grado en Historia del Arte · UCM', ['his'], ['Bachillerato'], 'ambas', 'arganzuela', 17, 4.6, 52,
      { corta: 'Historia e historia del arte para la PAU.',
        bio: 'Historiador del arte. Preparo historia de España e historia del arte de la PAU con láminas y fichas.',
        resenas: [['Elsa P.', 5, 'Me sé todas las láminas.']] }),
    P('beatriz', 'Beatriz Molina', 'Grado en Química · UAH', ['fyq', 'mat'], ['ESO', 'Bachillerato'], 'presencial', 'usera', 16, 4.7, 77,
      { grupos: true, corta: 'Química y matemáticas con problemas tipo examen.',
        bio: 'Química de formación. Formulación, estequiometría y matemáticas de ESO con muchos problemas tipo examen.',
        resenas: [['Iván T.', 4, 'La formulación ya no me asusta.']] }),
    P('tomas', 'Tomás Reyes', 'Grado en Estudios Ingleses · CAE C1', ['ing'], ['ESO', 'Bachillerato'], 'presencial', 'centro', 18, 4.8, 160,
      { grupos: true, idiomas: ['Español', 'Inglés'], corta: 'Inglés de instituto y Cambridge B2 First.',
        bio: 'Profesor de inglés. Refuerzo de instituto y preparación del B2 First con exámenes reales y speaking cada semana.',
        resenas: [['Noa R.', 5, 'Saqué el First con A.']] }),
    P('celia', 'Celia Vega', 'Grado en Pedagogía · UCM', ['len', 'mat'], ['Primaria', 'ESO'], 'presencial', 'hortaleza', 16, 4.9, 190,
      { grupos: true, corta: 'Técnicas de estudio y refuerzo para alumnos con dificultades.',
        bio: 'Pedagoga. Trabajo con chavales con TDAH y dislexia: rutinas, técnicas de estudio y refuerzo de lengua y matemáticas.',
        resenas: [['Rocío A.', 5, 'Ha cambiado la forma de estudiar de mi hijo.']] }),
    P('dario', 'Darío Fuentes', 'Grado en Ingeniería Informática · URJC', ['pro'], ['FP', 'Universidad', 'Adultos'], 'presencial', 'alcorcon', 21, 4.7, 58,
      { corta: 'Programación web y bases de datos para DAM y DAW.',
        bio: 'Desarrollador. Preparo módulos de DAM y DAW: programación, bases de datos y lenguajes de marcas.',
        resenas: [['Kevin L.', 5, 'Aprobé Bases de Datos a la primera.']] }),
    P('paula', 'Paula Romero', 'Grado en Matemáticas · UCM', ['mat'], ['Bachillerato', 'Universidad'], 'presencial', 'boadilla', 22, 4.8, 101,
      { corta: 'Matemáticas II, cálculo y álgebra.',
        bio: 'Matemática. Matemáticas II de la PAU, cálculo y álgebra de primero de carrera.',
        resenas: [['Adrián V.', 5, 'Me explicó integrales en dos clases.']] })
  ];

  // Disponibilidad determinista (L–S, 16 h–21 h) a partir del id
  const DIAS = ['L', 'M', 'X', 'J', 'V', 'S'];
  const HORAS = [16, 17, 18, 19, 20];
  const semilla = s => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  PROFES.forEach(p => {
    let s = semilla(p.id);
    p.libre = [];
    DIAS.forEach(d => HORAS.forEach(h => { s = (s * 1103515245 + 12345) >>> 0; if (s % 100 < 38) p.libre.push(d + h); }));
    p.resenas = (p.resenas || []).map(([autor, estrellas, texto]) => ({ autor, estrellas, texto }));
    p.precioGrupo = Math.round(p.precio * 0.6);
  });
  const profe = id => PROFES.find(p => p.id === id);

  const GRUPOS = [
    { id: 'g1', profe: 'laura', asig: 'mat', curso: '4º ESO', zona: 'chamberi', dia: 'Martes', hora: '18:00', plazas: 3, ocupadas: 2 },
    { id: 'g2', profe: 'marcos', asig: 'bio', curso: '2º Bachillerato', zona: 'carabanchel', dia: 'Jueves', hora: '17:00', plazas: 3, ocupadas: 1 },
    { id: 'g3', profe: 'carmen', asig: 'len', curso: '2º Bachillerato', zona: 'retiro', dia: 'Lunes', hora: '19:00', plazas: 4, ocupadas: 3 },
    { id: 'g4', profe: 'nuria', asig: 'mat', curso: '1º ESO', zona: 'salamanca', dia: 'Miércoles', hora: '17:00', plazas: 3, ocupadas: 1 },
    { id: 'g5', profe: 'tomas', asig: 'ing', curso: '3º ESO', zona: 'centro', dia: 'Viernes', hora: '16:00', plazas: 4, ocupadas: 2 },
    { id: 'g6', profe: 'jorge', asig: 'eco', curso: 'FP Grado superior', zona: 'getafe', dia: 'Martes', hora: '19:00', plazas: 4, ocupadas: 2 },
    { id: 'g7', profe: 'irene', asig: 'ing', curso: '5º Primaria', zona: 'majadahonda', dia: 'Jueves', hora: '16:00', plazas: 3, ocupadas: 2 },
    { id: 'g8', profe: 'beatriz', asig: 'fyq', curso: '3º ESO', zona: 'usera', dia: 'Lunes', hora: '18:00', plazas: 3, ocupadas: 1 },
    { id: 'g9', profe: 'celia', asig: 'len', curso: '6º Primaria', zona: 'hortaleza', dia: 'Miércoles', hora: '17:00', plazas: 3, ocupadas: 2 },
    { id: 'g10', profe: 'sergio', asig: 'mus', curso: 'Iniciación', zona: 'vallecas', dia: 'Sábado', hora: '11:00', plazas: 4, ocupadas: 1 },
    { id: 'g11', profe: 'pablo', asig: 'his', curso: '2º Bachillerato', zona: 'alcala', dia: 'Jueves', hora: '19:00', plazas: 4, ocupadas: 3 },
    { id: 'g12', profe: 'hugo', asig: 'pro', curso: 'Scratch · 10–12 años', zona: 'leganes', dia: 'Sábado', hora: '10:00', plazas: 4, ocupadas: 2 }
  ];

  // Modelo de negocio: la comisión baja cuanto más tiempo siguen juntos profe y familia
  const TRAMOS = [{ hasta: 5, pct: 15 }, { hasta: 20, pct: 10 }, { hasta: Infinity, pct: 5 }];
  const comision = n => TRAMOS.find(t => n <= t.hasta).pct;
  // Precio por alumno en grupo: el profe cobra más por hora y cada familia paga menos
  const precioGrupo = (base, alumnos) => alumnos <= 1 ? base : Math.round(base * (alumnos === 2 ? 0.7 : alumnos === 3 ? 0.58 : 0.5));

  const TITULACIONES = [
    'Grado en Matemáticas', 'Grado en Física', 'Grado en Química', 'Grado en Biología', 'Grado en Biotecnología', 'Grado en Bioquímica',
    'Grado en Ingeniería Informática', 'Grado en Ingeniería de Telecomunicación', 'Grado en Ingeniería Industrial', 'Grado en Arquitectura',
    'Grado en Economía', 'Grado en ADE', 'Grado en Derecho', 'Grado en Psicología', 'Grado en Pedagogía', 'Grado en Educación Primaria',
    'Grado en Educación Infantil', 'Grado en Filología Hispánica', 'Grado en Estudios Ingleses', 'Grado en Filología Inglesa',
    'Grado en Traducción e Interpretación', 'Grado en Historia', 'Grado en Historia del Arte', 'Grado en Filosofía', 'Grado en Geografía',
    'Grado en Periodismo', 'Grado en Medicina', 'Grado en Enfermería', 'Grado en Farmacia', 'Grado en Música', 'Título superior de Música (conservatorio)',
    'Máster en Formación del Profesorado', 'Máster en Enseñanza del Español', 'Máster en Ciencia de Datos', 'Doctorado',
    'Técnico Superior en Administración y Finanzas', 'Técnico Superior en DAM', 'Técnico Superior en DAW', 'Técnico Superior en ASIR',
    'Técnico Superior en Educación Infantil', 'Técnico Superior en Integración Social', 'Técnico en Gestión Administrativa',
    'Técnico en Sistemas Microinformáticos y Redes', 'Bachillerato (estudiante universitario)', 'Certificado C1 de inglés', 'Certificado C2 de inglés',
    'DELF/DALF de francés', 'Estudiante de grado (indica cuál en «centro»)'
  ];

  const FAQ = [
    ['¿Cuánto cuesta usar la web?', 'Buscar, escribir a profes y tener perfil es gratis. No hay cuotas. Solo se paga la clase, y de ese pago nos quedamos una comisión que baja cuanto más tiempo seguís juntos: 15 % las 5 primeras clases, 10 % de la 6 a la 20 y 5 % a partir de la 21.'],
    ['¿Qué es la primera clase a prueba?', 'La primera clase con un profe nuevo se paga al reservar, pero si en las 24 horas siguientes nos dices que no encaja, te devolvemos el dinero entero. El profe cobra igualmente la mitad: la ponemos nosotros.'],
    ['¿Cómo funcionan los grupos de estudio?', 'Entre 2 y 4 alumnos de la misma zona (el mismo barrio o barrios de al lado) y del mismo curso comparten profe. Cada familia paga bastante menos que en una clase individual y el profe gana más por hora. Puedes unirte a un grupo abierto o proponer uno; te avisamos cuando haya gente suficiente.'],
    ['¿Cómo sé que el profe es de fiar?', 'Antes de publicar un perfil hacemos una videollamada con el profe, comprobamos su titulación y le pedimos el certificado negativo del Registro Central de Delitos Sexuales, obligatorio para trabajar con menores. Solo guardamos que está comprobado, nunca el documento ni el DNI.'],
    ['¿Se ve la dirección del profe o la mía?', 'Nunca. En el mapa solo aparece el barrio aproximado. El sitio de la clase lo acordáis por mensaje cuando ya hay una reserva.'],
    ['Mi hijo es menor, ¿quién habla con el profe?', 'La cuenta la abre la madre, el padre o el tutor y los mensajes llegan a esa cuenta. El alumno puede ver sus clases e informes, pero el chat con el profe es de la familia.'],
    ['¿Y si hay que cancelar?', 'Gratis hasta 24 horas antes. Con menos tiempo se paga la mitad, que va al profe. Si cancela el profe, te devolvemos todo y te proponemos otra hora.'],
    ['¿Qué es el informe después de cada clase?', 'Dos minutos que el profe rellena al terminar: qué se ha trabajado, qué cuesta y qué toca después. Lo recibe la familia en su panel y por correo.'],
    ['¿Cuándo cobra el profe?', 'A las 48 horas de cada clase, en su cuenta bancaria. Los bonos de varias clases se le pagan clase a clase.']
  ];

  return { listo: Promise.resolve(), ASIG, NIVELES, ZONAS, zona, distancia, km, PROFES, profe, GRUPOS, TRAMOS, comision, precioGrupo, TITULACIONES, FAQ, DIAS, HORAS,
    asig: id => ASIG.find(a => a.id === id) };
})();
