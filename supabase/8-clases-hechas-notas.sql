-- 8. Clases hechas de verdad, exámenes, notas, estadísticas del profe y «avísame cuando tenga hueco» (28-nov-2026)
-- Pegar en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez.

-- =====================================================================
-- 1. Clase hecha: el profe marca «He llegado» y «Clase terminada».
--    Si nadie dice nada, la clase se da por hecha 6 horas después de acabar.
-- =====================================================================
alter table public.clases add column if not exists llegada timestamptz;
alter table public.clases add column if not exists terminada timestamptz;
alter table public.clases add column if not exists cerrada_sola boolean not null default false;

-- Igual que antes (precio y comisión los pone la base de datos) y, además, las reglas de «llegada» y «hecha»
create or replace function public.clases_calcular()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare base numeric; hechas int; servidor boolean := auth.uid() is null or coalesce(current_setting('clasuno.cierre', true) = '1', false);
begin
  if tg_op = 'INSERT' then
    select price_per_hour into base from public.teacher_profiles
      where user_id = new.teacher_id and lower(status::text) in ('approved', 'aprobado', 'publicado', 'active', 'activo');
    if base is null then raise exception 'Ese profe no está disponible'; end if;
    if new.teacher_id = new.familia_id then raise exception 'No puedes reservarte una clase a ti mismo'; end if;
    new.precio := round(base * new.minutos / 60.0 * case new.tipo when 'bono' then 9.5 when 'grupo' then 0.58 else 1 end, 2);
    select count(*) into hechas from public.clases where teacher_id = new.teacher_id and familia_id = new.familia_id and estado = 'hecha';
    new.comision := case when hechas < 5 then 15 when hechas < 20 then 10 else 5 end;
    new.estado := 'pedida'; new.llegada := null; new.terminada := null; new.cerrada_sola := false;
    return new;
  end if;

  -- Al cambiar una clase solo se puede tocar el estado y la hora
  new.teacher_id := old.teacher_id; new.familia_id := old.familia_id; new.tipo := old.tipo;
  new.precio := old.precio; new.comision := old.comision; new.minutos := old.minutos; new.creada := old.creada;
  if auth.uid() = old.familia_id and new.estado not in (old.estado, 'cancelada') then raise exception 'La familia solo puede cancelar'; end if;

  -- Una clase hecha ya no cambia (es la que se cobra y la que baja la comisión)
  if old.estado = 'hecha' and new.estado <> 'hecha' and not servidor then raise exception 'Esa clase ya está hecha y no se puede cambiar'; end if;

  -- «He llegado»: solo el profe, con la clase aceptada y desde media hora antes. La hora la pone la base de datos.
  if new.llegada is not null and old.llegada is null then
    if not servidor and auth.uid() <> old.teacher_id then raise exception 'Solo el profe puede marcar que ha llegado'; end if;
    if old.estado <> 'aceptada' then raise exception 'Esa clase no está aceptada'; end if;
    if now() < old.empieza - interval '30 minutes' then raise exception 'Todavía es pronto: puedes marcarlo desde media hora antes'; end if;
    new.llegada := now();
  else
    new.llegada := old.llegada;
  end if;

  -- «Clase terminada»: solo el profe (o el cierre automático), con la clase aceptada y ya empezada
  if new.estado = 'hecha' and old.estado <> 'hecha' then
    if not servidor and auth.uid() <> old.teacher_id then raise exception 'Solo el profe puede marcar la clase como hecha'; end if;
    if old.estado <> 'aceptada' then raise exception 'Solo se puede dar por hecha una clase aceptada'; end if;
    if now() < old.empieza then raise exception 'La clase todavía no ha empezado'; end if;
    new.terminada := now();
    new.cerrada_sola := coalesce(current_setting('clasuno.cierre', true) = '1', false);
  else
    new.terminada := old.terminada; new.cerrada_sola := old.cerrada_sola;
  end if;
  return new;
end $$;
drop trigger if exists clases_calcular on public.clases;
create trigger clases_calcular before insert or update on public.clases for each row execute function public.clases_calcular();

-- Cierre automático: las clases aceptadas que acabaron hace más de 6 horas pasan a «hecha»
create or replace function public.cerrar_clases_pasadas()
returns int language plpgsql security definer set search_path = ''
as $$
declare n int;
begin
  perform set_config('clasuno.cierre', '1', true);
  update public.clases set estado = 'hecha'
    where estado = 'aceptada' and empieza + minutos * interval '1 minute' + interval '6 hours' < now();
  get diagnostics n = row_count;
  perform set_config('clasuno.cierre', '', true);
  return n;
end $$;
revoke all on function public.cerrar_clases_pasadas() from public, anon;
grant execute on function public.cerrar_clases_pasadas() to authenticated;

-- Que se ejecute solo cada hora (pg_cron). Si no se puede activar, la web lo llama al abrir el panel.
do $cron$
begin
  create extension if not exists pg_cron with schema pg_catalog;
  perform cron.schedule('clasuno-cerrar-clases', '15 * * * *', 'select public.cerrar_clases_pasadas()');
exception when others then
  raise notice 'pg_cron no disponible (%): el panel cerrará las clases al abrirse', sqlerrm;
end
$cron$;

-- =====================================================================
-- 2. Fechas de examen (las apunta la familia; las ven sus profes)
-- =====================================================================
create table if not exists public.examenes (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  alumno text check (char_length(alumno) <= 80),
  asignatura text not null check (char_length(asignatura) between 2 and 40),
  fecha date not null,
  tema text check (char_length(tema) <= 120),
  creado timestamptz not null default now()
);
create index if not exists examenes_familia_idx on public.examenes (familia_id, fecha);
alter table public.examenes enable row level security;
drop policy if exists "examenes_familia" on public.examenes;
create policy "examenes_familia" on public.examenes for all to authenticated
  using (familia_id = (select auth.uid())) with check (familia_id = (select auth.uid()));
drop policy if exists "examenes_profe" on public.examenes;
create policy "examenes_profe" on public.examenes for select to authenticated using (
  exists (select 1 from public.clases c where c.teacher_id = (select auth.uid()) and c.familia_id = examenes.familia_id and c.estado in ('pedida', 'aceptada', 'hecha')));
grant select, insert, update, delete on public.examenes to authenticated;

-- =====================================================================
-- 3. Notas de examen (las escribe la familia). Si dice qué profe le da esa asignatura,
--    cuentan para la mejora media de ese profe, siempre de forma anónima.
-- =====================================================================
create table if not exists public.notas (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  alumno text check (char_length(alumno) <= 80),
  asignatura text not null check (char_length(asignatura) between 2 and 40),
  nota numeric(4, 2) not null check (nota between 0 and 10),
  fecha date not null default current_date,
  antes boolean not null default false,      -- nota de antes de empezar con el profe (punto de partida)
  examen_id uuid references public.examenes (id) on delete set null,
  teacher_id uuid references public.profiles (id) on delete set null,
  creada timestamptz not null default now()
);
create index if not exists notas_familia_idx on public.notas (familia_id, fecha);
create index if not exists notas_profe_idx on public.notas (teacher_id);
alter table public.notas enable row level security;

-- Solo se puede atribuir una nota a un profe con el que la familia tiene o ha tenido clase
create or replace function public.notas_comprobar()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if new.teacher_id is not null and not exists (
    select 1 from public.clases c where c.teacher_id = new.teacher_id and c.familia_id = new.familia_id and c.estado in ('pedida', 'aceptada', 'hecha')
  ) then
    raise exception 'Solo puedes asociar la nota a un profe con el que tienes clases';
  end if;
  if new.fecha > current_date then raise exception 'La fecha de la nota no puede ser futura'; end if;
  return new;
end $$;
drop trigger if exists notas_comprobar on public.notas;
create trigger notas_comprobar before insert or update on public.notas for each row execute function public.notas_comprobar();

drop policy if exists "notas_familia" on public.notas;
create policy "notas_familia" on public.notas for all to authenticated
  using (familia_id = (select auth.uid())) with check (familia_id = (select auth.uid()));
drop policy if exists "notas_profe" on public.notas;
create policy "notas_profe" on public.notas for select to authenticated using (teacher_id = (select auth.uid()));
grant select, insert, update, delete on public.notas to authenticated;

-- Mejora media de los alumnos de un profe: por alumno y asignatura, de la nota de partida
-- (la marcada «antes» o la primera) a la última. Solo alumnos con dos notas o más.
create or replace function public.mejora_profe(t uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  with g as (
    select n.familia_id, coalesce(n.alumno, '') al, n.asignatura,
      (array_agg(n.nota order by n.antes desc, n.fecha, n.creada))[1] as inicio,
      (array_agg(n.nota order by n.fecha desc, n.creada desc))[1] as fin,
      count(*) as cuantas
    from public.notas n where n.teacher_id = t
    group by 1, 2, 3
  )
  select jsonb_build_object('media', round(avg(fin - inicio), 1), 'alumnos', count(*)) from g where cuantas >= 2;
$$;
revoke all on function public.mejora_profe(uuid) from public, anon, authenticated;

-- =====================================================================
-- 4. Estadísticas del profe: visitas a su ficha y tiempo real de respuesta
-- =====================================================================
create table if not exists public.visitas_ficha (
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  dia date not null default current_date,
  n int not null default 0,
  primary key (teacher_id, dia)
);
alter table public.visitas_ficha enable row level security; -- sin reglas: solo se usa desde las funciones

-- La ficha cuenta una visita (la web solo la manda una vez por sesión y no cuenta las del propio profe)
create or replace function public.contar_visita(t uuid)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  if t is null or t = auth.uid() then return; end if;
  if not exists (select 1 from public.teacher_profiles where user_id = t and lower(status::text) in ('approved', 'aprobado', 'publicado', 'active', 'activo')) then return; end if;
  insert into public.visitas_ficha (teacher_id, dia, n) values (t, current_date, 1)
    on conflict (teacher_id, dia) do update set n = public.visitas_ficha.n + 1;
end $$;
revoke all on function public.contar_visita(uuid) from public;
grant execute on function public.contar_visita(uuid) to anon, authenticated;

-- Minutos que tarda (mediana) en contestar cuando una familia le escribe, en los últimos 90 días.
-- Se mide desde el primer mensaje de la familia sin contestar hasta la respuesta del profe. Hacen falta 3 respuestas.
create or replace function public.responde_minutos(t uuid)
returns int language sql stable security definer set search_path = ''
as $$
  with m as (
    select c.id as conv, m.sender_id, m.created_at,
      count(*) filter (where m.sender_id = t) over (partition by c.id order by m.created_at, m.id rows between unbounded preceding and current row) as g
    from public.conversations c join public.messages m on m.conversation_id = c.id
    where c.teacher_id = t and m.created_at > now() - interval '90 days'
  ),
  fam as (select conv, g, min(created_at) as primero from m where sender_id <> t group by conv, g),
  resp as (select conv, g - 1 as g, min(created_at) as respuesta from m where sender_id = t group by conv, g)
  select case when count(*) >= 3 then round(percentile_cont(0.5) within group (order by extract(epoch from (r.respuesta - f.primero)) / 60))::int end
  from fam f join resp r using (conv, g);
$$;
revoke all on function public.responde_minutos(uuid) from public, anon, authenticated;

-- =====================================================================
-- 5. «Avísame cuando tenga hueco»
-- =====================================================================
alter table public.teacher_profiles add column if not exists completo boolean not null default false;

create table if not exists public.avisame (
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  familia_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  creado timestamptz not null default now(),
  avisado timestamptz,          -- cuando el profe vuelve a tener hueco
  visto boolean not null default false,
  primary key (teacher_id, familia_id)
);
alter table public.avisame enable row level security;
drop policy if exists "avisame_familia" on public.avisame;
create policy "avisame_familia" on public.avisame for all to authenticated
  using (familia_id = (select auth.uid())) with check (familia_id = (select auth.uid()));
grant select, insert, update, delete on public.avisame to authenticated;

-- El profe dice si tiene el horario completo. Al volver a tener hueco, se avisa a las familias que esperan.
create or replace function public.poner_completo(b boolean)
returns int language plpgsql security definer set search_path = ''
as $$
declare n int := 0;
begin
  if auth.uid() is null then raise exception 'Hace falta iniciar sesión'; end if;
  update public.teacher_profiles set completo = b where user_id = auth.uid();
  if not found then raise exception 'No tienes perfil de profe'; end if;
  if not b then
    update public.avisame set avisado = now(), visto = false where teacher_id = auth.uid() and avisado is null;
    get diagnostics n = row_count;
  end if;
  return n;
end $$;
revoke all on function public.poner_completo(boolean) from public, anon;
grant execute on function public.poner_completo(boolean) to authenticated;

-- Todo lo que ve el profe en «Estadísticas»
create or replace function public.mis_estadisticas()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'visitas_30', (select coalesce(sum(n), 0) from public.visitas_ficha where teacher_id = auth.uid() and dia > current_date - 30),
    'visitas_semanas', (select jsonb_agg(coalesce((select sum(v.n) from public.visitas_ficha v where v.teacher_id = auth.uid()
                          and v.dia >= s.lunes and v.dia < s.lunes + 7), 0) order by s.lunes)
                        from (select (date_trunc('week', current_date) - make_interval(weeks => k))::date as lunes from generate_series(0, 7) k) s),
    'escriben_30', (select count(*) from public.conversations where teacher_id = auth.uid() and created_at > now() - interval '30 days'),
    'solicitudes_30', (select count(*) from public.clases where teacher_id = auth.uid() and creada > now() - interval '30 days'),
    'aceptadas_30', (select count(*) from public.clases where teacher_id = auth.uid() and creada > now() - interval '30 days' and estado in ('aceptada', 'hecha')),
    'hechas', (select count(*) from public.clases where teacher_id = auth.uid() and estado = 'hecha'),
    'responde_min', public.responde_minutos(auth.uid()),
    'mejora', public.mejora_profe(auth.uid()),
    'completo', (select completo from public.teacher_profiles where user_id = auth.uid()),
    'esperando', (select count(*) from public.avisame where teacher_id = auth.uid() and avisado is null)
  );
$$;
revoke all on function public.mis_estadisticas() from public, anon;
grant execute on function public.mis_estadisticas() to authenticated;

-- =====================================================================
-- 6. profes_publicos(): lo de antes + horario completo, tiempo de respuesta real,
--    mejora media de sus alumnos y clases hechas de verdad
-- =====================================================================
create or replace function public.profes_publicos()
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', t.user_id,
    'nombre', trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')),
    'avatar', p.avatar_url,
    'degree', t.degree, 'center', t.center, 'headline', t.headline, 'description', t.description,
    'modality', t.modality, 'zone', t.zone, 'price', t.price_per_hour,
    'classes', greatest(coalesce(t.classes_count, 0), (select count(*) from public.clases c where c.teacher_id = t.user_id and c.estado = 'hecha')),
    'positive', t.positive_reviews, 'verified', t.verified,
    'certificado', t.certificado, 'grupos', t.acepta_grupos, 'completo', t.completo,
    'languages', to_jsonb(t.languages), 'availability', to_jsonb(t.availability), 'experience', t.experience_years,
    'subjects', (select coalesce(jsonb_agg(s.name), '[]'::jsonb) from public.teacher_subjects ts join public.subjects s on s.id = ts.subject_id where ts.teacher_id = t.user_id),
    'levels',   (select coalesce(jsonb_agg(l.name), '[]'::jsonb) from public.teacher_levels tl join public.levels l on l.id = tl.level_id where tl.teacher_id = t.user_id),
    'nota',      (select round(avg(r.estrellas)::numeric, 1) from public.resenas r where r.teacher_id = t.user_id),
    'n_resenas', (select count(*) from public.resenas r where r.teacher_id = t.user_id),
    'reparto',   (select jsonb_build_array(
                    count(*) filter (where r.estrellas = 5), count(*) filter (where r.estrellas = 4), count(*) filter (where r.estrellas = 3),
                    count(*) filter (where r.estrellas = 2), count(*) filter (where r.estrellas = 1))
                  from public.resenas r where r.teacher_id = t.user_id),
    'resenas',   (select coalesce(jsonb_agg(jsonb_build_object('autor', x.autor, 'estrellas', x.estrellas, 'texto', x.texto, 'creada', x.creada) order by x.creada desc), '[]'::jsonb)
                  from (select r.autor, r.estrellas, r.texto, r.creada from public.resenas r where r.teacher_id = t.user_id order by r.creada desc limit 20) x),
    'responde_min', public.responde_minutos(t.user_id),
    'mejora', public.mejora_profe(t.user_id)
  )), '[]'::jsonb)
  from public.teacher_profiles t
  join public.profiles p on p.id = t.user_id
  where lower(t.status::text) in ('approved', 'aprobado', 'publicado', 'active', 'activo');
$$;
revoke all on function public.profes_publicos() from public;
grant execute on function public.profes_publicos() to anon, authenticated;
