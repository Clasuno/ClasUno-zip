-- =====================================================================
--  1 · Conectar la web nueva (26-nov-2026)
--  Pegar entero en Supabase → SQL Editor → Run. Se puede ejecutar más de
--  una vez: no borra datos ni toca lo que ya funciona.
--  Proyecto: ywfrtfypmhypacbktjch
-- =====================================================================

-- ---------- 1. Barrios con coordenadas reales (para el mapa) ----------
alter table public.zones add column if not exists lat double precision;
alter table public.zones add column if not exists lng double precision;
update public.zones z set lat = v.lat, lng = v.lng
from (values
  ('Centro', 40.4168, -3.7038), ('Chamberí', 40.4365, -3.7038), ('Salamanca', 40.4292, -3.6797),
  ('Chamartín', 40.4587, -3.6771), ('Retiro', 40.4097, -3.6768), ('Moncloa-Aravaca', 40.4392, -3.7385),
  ('Arganzuela', 40.3986, -3.6977), ('Carabanchel', 40.3833, -3.7310), ('Usera', 40.3836, -3.7067),
  ('Vallecas', 40.3889, -3.6585), ('Hortaleza', 40.4722, -3.6417), ('Alcobendas', 40.5373, -3.6372),
  ('Las Rozas de Madrid', 40.4929, -3.8737), ('Pozuelo de Alarcón', 40.4350, -3.8137), ('Majadahonda', 40.4731, -3.8722),
  ('Boadilla del Monte', 40.4052, -3.8781), ('Alcorcón', 40.3457, -3.8243), ('Leganés', 40.3281, -3.7645),
  ('Getafe', 40.3057, -3.7329), ('Alcalá de Henares', 40.4818, -3.3644)
) as v(name, lat, lng)
where z.name = v.name;

-- ---------- 2. Asignaturas y nivel nuevos ----------
do $$
declare n text;
begin
  foreach n in array array['Economía y contabilidad', 'Francés'] loop
    if not exists (select 1 from public.subjects where name = n) then
      begin
        insert into public.subjects (name) values (n);
      exception when others then
        insert into public.subjects (id, name) values ((select coalesce(max(id), 0) + 1 from public.subjects), n);
      end;
    end if;
  end loop;
  if not exists (select 1 from public.levels where name = 'Adultos') then
    begin
      insert into public.levels (name, sort_order) values ('Adultos', 6);
    exception when others then
      insert into public.levels (id, name, sort_order) values ((select coalesce(max(id), 0) + 1 from public.levels), 'Adultos', 6);
    end;
  end if;
end $$;

-- ---------- 3. Datos nuevos del profe ----------
alter table public.teacher_profiles add column if not exists acepta_grupos boolean not null default false;
alter table public.teacher_profiles add column if not exists certificado boolean not null default false; -- lo marca un admin tras verlo

-- ---------- 4. Profes aprobados para la web pública ----------
-- La vista public_teachers falla para los visitantes (consulta conversations, que no pueden leer).
-- Esta función devuelve solo columnas públicas de los profes aprobados.
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
    'classes', t.classes_count, 'positive', t.positive_reviews, 'verified', t.verified,
    'certificado', t.certificado, 'grupos', t.acepta_grupos,
    'languages', to_jsonb(t.languages), 'availability', to_jsonb(t.availability), 'experience', t.experience_years,
    'subjects', (select coalesce(jsonb_agg(s.name), '[]'::jsonb) from public.teacher_subjects ts join public.subjects s on s.id = ts.subject_id where ts.teacher_id = t.user_id),
    'levels',   (select coalesce(jsonb_agg(l.name), '[]'::jsonb) from public.teacher_levels tl join public.levels l on l.id = tl.level_id where tl.teacher_id = t.user_id)
  )), '[]'::jsonb)
  from public.teacher_profiles t
  join public.profiles p on p.id = t.user_id
  where lower(t.status::text) in ('approved', 'aprobado', 'publicado', 'active', 'activo');
$$;
revoke all on function public.profes_publicos() from public;
grant execute on function public.profes_publicos() to anon, authenticated;

-- ---------- 5. Guardar el perfil del profe desde el alta ----------
-- Se ejecuta con los permisos del propio profe (respeta las reglas de seguridad que ya hay).
create or replace function public.guardar_perfil_profe(datos jsonb, asignaturas text[], niveles text[])
returns void
language plpgsql security invoker set search_path = ''
as $$
declare r public.teacher_profiles;
begin
  if auth.uid() is null then raise exception 'Hace falta iniciar sesión'; end if;
  r := jsonb_populate_record(null::public.teacher_profiles, datos);
  update public.teacher_profiles set
    degree = r.degree, center = r.center, headline = r.headline, description = r.description,
    modality = r.modality, zone = r.zone, price_per_hour = r.price_per_hour,
    availability = r.availability, languages = r.languages, acepta_grupos = coalesce(r.acepta_grupos, false)
  where user_id = auth.uid();
  if not found then
    insert into public.teacher_profiles (user_id, degree, center, headline, description, modality, zone, price_per_hour, availability, languages, acepta_grupos)
    values (auth.uid(), r.degree, r.center, r.headline, r.description, r.modality, r.zone, r.price_per_hour, r.availability, r.languages, coalesce(r.acepta_grupos, false));
  end if;
  delete from public.teacher_subjects where teacher_id = auth.uid();
  insert into public.teacher_subjects (teacher_id, subject_id) select auth.uid(), s.id from public.subjects s where s.name = any (asignaturas);
  delete from public.teacher_levels where teacher_id = auth.uid();
  insert into public.teacher_levels (teacher_id, level_id) select auth.uid(), l.id from public.levels l where l.name = any (niveles);
end $$;
revoke all on function public.guardar_perfil_profe(jsonb, text[], text[]) from public;
grant execute on function public.guardar_perfil_profe(jsonb, text[], text[]) to authenticated;

-- ---------- 6. Clases (reservas) con la comisión que baja ----------
create table if not exists public.clases (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  familia_id uuid not null references public.profiles (id) on delete cascade,
  alumno text check (char_length(alumno) <= 80),
  tipo text not null check (tipo in ('prueba', 'suelta', 'bono', 'grupo')),
  empieza timestamptz not null,
  minutos smallint not null default 60 check (minutos between 30 and 180),
  precio numeric(8, 2) not null default 0,
  comision smallint not null default 15,
  estado text not null default 'pedida' check (estado in ('pedida', 'aceptada', 'hecha', 'cancelada', 'rechazada')),
  creada timestamptz not null default now()
);
create index if not exists clases_teacher_idx on public.clases (teacher_id, empieza);
create index if not exists clases_familia_idx on public.clases (familia_id, empieza);
alter table public.clases enable row level security;

-- El precio y la comisión los pone la base de datos, nunca el navegador
create or replace function public.clases_calcular()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare base numeric; hechas int;
begin
  if tg_op = 'INSERT' then
    select price_per_hour into base from public.teacher_profiles
      where user_id = new.teacher_id and lower(status::text) in ('approved', 'aprobado', 'publicado', 'active', 'activo');
    if base is null then raise exception 'Ese profe no está disponible'; end if;
    if new.teacher_id = new.familia_id then raise exception 'No puedes reservarte una clase a ti mismo'; end if;
    new.precio := round(base * new.minutos / 60.0 * case new.tipo when 'bono' then 9.5 when 'grupo' then 0.58 else 1 end, 2);
    select count(*) into hechas from public.clases where teacher_id = new.teacher_id and familia_id = new.familia_id and estado = 'hecha';
    new.comision := case when hechas < 5 then 15 when hechas < 20 then 10 else 5 end;
    new.estado := 'pedida';
  else
    -- Al cambiar una clase solo se puede tocar el estado y la hora
    new.teacher_id := old.teacher_id; new.familia_id := old.familia_id; new.tipo := old.tipo;
    new.precio := old.precio; new.comision := old.comision; new.minutos := old.minutos; new.creada := old.creada;
    if auth.uid() = old.familia_id and new.estado not in (old.estado, 'cancelada') then raise exception 'La familia solo puede cancelar'; end if;
  end if;
  return new;
end $$;
drop trigger if exists clases_calcular on public.clases;
create trigger clases_calcular before insert or update on public.clases for each row execute function public.clases_calcular();

drop policy if exists "clases_ver" on public.clases;
create policy "clases_ver" on public.clases for select to authenticated using ((select auth.uid()) in (teacher_id, familia_id));
drop policy if exists "clases_pedir" on public.clases;
create policy "clases_pedir" on public.clases for insert to authenticated with check (familia_id = (select auth.uid()));
drop policy if exists "clases_cambiar" on public.clases;
create policy "clases_cambiar" on public.clases for update to authenticated using ((select auth.uid()) in (teacher_id, familia_id)) with check ((select auth.uid()) in (teacher_id, familia_id));

-- ---------- 7. Informes después de cada clase ----------
create table if not exists public.informes (
  id uuid primary key default gen_random_uuid(),
  clase_id uuid references public.clases (id) on delete set null,
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  familia_id uuid not null references public.profiles (id) on delete cascade,
  alumno text,
  tema text not null check (char_length(tema) between 2 and 120),
  bien text not null check (char_length(bien) <= 1000),
  cuesta text not null check (char_length(cuesta) <= 1000),
  luego text not null check (char_length(luego) <= 1000),
  seguridad smallint check (seguridad between 1 and 5),
  creado timestamptz not null default now()
);
create index if not exists informes_familia_idx on public.informes (familia_id, creado desc);
alter table public.informes enable row level security;
drop policy if exists "informes_ver" on public.informes;
create policy "informes_ver" on public.informes for select to authenticated using ((select auth.uid()) in (teacher_id, familia_id));
drop policy if exists "informes_escribir" on public.informes;
create policy "informes_escribir" on public.informes for insert to authenticated with check (
  teacher_id = (select auth.uid())
  and exists (select 1 from public.clases c where c.teacher_id = (select auth.uid()) and c.familia_id = informes.familia_id and c.estado in ('aceptada', 'hecha'))
);

-- ---------- 8. Grupos de portal ----------
create table if not exists public.grupos (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  asignatura text not null,
  curso text not null check (char_length(curso) <= 40),
  zona text not null,
  dia text not null,
  hora text not null,
  plazas smallint not null default 3 check (plazas between 2 and 4),
  creado timestamptz not null default now()
);
alter table public.grupos enable row level security;
drop policy if exists "grupos_ver" on public.grupos;
create policy "grupos_ver" on public.grupos for select to anon, authenticated using (true);
drop policy if exists "grupos_profe" on public.grupos;
create policy "grupos_profe" on public.grupos for all to authenticated using (teacher_id = (select auth.uid())) with check (teacher_id = (select auth.uid()));

create table if not exists public.grupo_miembros (
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  familia_id uuid not null references public.profiles (id) on delete cascade,
  alumno text,
  unido timestamptz not null default now(),
  primary key (grupo_id, familia_id)
);
alter table public.grupo_miembros enable row level security;
drop policy if exists "miembros_ver" on public.grupo_miembros;
create policy "miembros_ver" on public.grupo_miembros for select to authenticated using (
  familia_id = (select auth.uid()) or exists (select 1 from public.grupos g where g.id = grupo_id and g.teacher_id = (select auth.uid())));
drop policy if exists "miembros_unirse" on public.grupo_miembros;
create policy "miembros_unirse" on public.grupo_miembros for insert to authenticated with check (familia_id = (select auth.uid()));
drop policy if exists "miembros_salir" on public.grupo_miembros;
create policy "miembros_salir" on public.grupo_miembros for delete to authenticated using (familia_id = (select auth.uid()));

-- No dejar entrar si el grupo está lleno
create or replace function public.grupo_con_sitio()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  if (select count(*) from public.grupo_miembros where grupo_id = new.grupo_id) >= (select plazas from public.grupos where id = new.grupo_id) then
    raise exception 'El grupo está completo';
  end if;
  return new;
end $$;
drop trigger if exists grupo_con_sitio on public.grupo_miembros;
create trigger grupo_con_sitio before insert on public.grupo_miembros for each row execute function public.grupo_con_sitio();

-- Grupos abiertos con las plazas ocupadas, sin enseñar quién está dentro
create or replace function public.grupos_abiertos()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', g.id, 'profe', g.teacher_id, 'asignatura', g.asignatura, 'curso', g.curso, 'zona', g.zona, 'dia', g.dia, 'hora', g.hora,
    'plazas', g.plazas, 'ocupadas', (select count(*) from public.grupo_miembros m where m.grupo_id = g.id)
  ) order by g.creado desc), '[]'::jsonb)
  from public.grupos g;
$$;
revoke all on function public.grupos_abiertos() from public;
grant execute on function public.grupos_abiertos() to anon, authenticated;

create table if not exists public.grupo_propuestas (
  id uuid primary key default gen_random_uuid(),
  familia_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  asignatura text not null, curso text not null check (char_length(curso) <= 40), zona text not null, dia text,
  creada timestamptz not null default now()
);
alter table public.grupo_propuestas enable row level security;
drop policy if exists "propuestas_mias" on public.grupo_propuestas;
create policy "propuestas_mias" on public.grupo_propuestas for all to authenticated using (familia_id = (select auth.uid())) with check (familia_id = (select auth.uid()));

-- ---------- 9. Tiempo real para clases (solicitudes del profe) ----------
do $$ begin
  alter publication supabase_realtime add table public.clases;
exception when others then null; end $$;
