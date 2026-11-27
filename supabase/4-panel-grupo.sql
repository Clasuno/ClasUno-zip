-- ClasUno · Panel de cada grupo de estudio: miembros, calendario de clases, chat y ajustes
-- Pegar en Supabase → SQL Editor → Run (después de 3-crear-grupos.sql). Se puede ejecutar más de una vez.
--
-- · Solo entran al panel las familias del grupo, quien lo creó y su profe.
-- · Calendario: las clases salen cada semana del día y la hora del grupo; se pueden cancelar días sueltos
--   o añadir clases extra (tabla grupo_sesiones).
-- · Chat del grupo en tiempo real (tabla grupo_mensajes).
-- · Ajustes: quien lo creó (o su profe) cambia público/privado, plazas, día y hora, y puede sacar un enlace nuevo.

-- ---------- 1. ¿Estoy en este grupo? ¿Lo puedo gestionar? ----------
create or replace function public.en_grupo(g uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.grupos x where x.id = g and (x.creado_por = auth.uid() or x.teacher_id = auth.uid()))
      or exists (select 1 from public.grupo_miembros m where m.grupo_id = g and m.familia_id = auth.uid())
$$;
revoke all on function public.en_grupo(uuid) from public;
grant execute on function public.en_grupo(uuid) to authenticated;

create or replace function public.gestiona_grupo(g uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.grupos x where x.id = g and (x.creado_por = auth.uid() or x.teacher_id = auth.uid())) $$;
revoke all on function public.gestiona_grupo(uuid) from public;
grant execute on function public.gestiona_grupo(uuid) to authenticated;

-- ---------- 2. Chat del grupo ----------
create table if not exists public.grupo_mensajes (
  id bigint generated always as identity primary key,
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  autor_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  texto text not null check (char_length(trim(texto)) between 1 and 2000),
  creado timestamptz not null default now()
);
create index if not exists grupo_mensajes_grupo on public.grupo_mensajes (grupo_id, creado);
alter table public.grupo_mensajes enable row level security;
drop policy if exists "gmsj_ver" on public.grupo_mensajes;
create policy "gmsj_ver" on public.grupo_mensajes for select to authenticated using (public.en_grupo(grupo_id));
drop policy if exists "gmsj_escribir" on public.grupo_mensajes;
create policy "gmsj_escribir" on public.grupo_mensajes for insert to authenticated with check (autor_id = (select auth.uid()) and public.en_grupo(grupo_id));
drop policy if exists "gmsj_borrar" on public.grupo_mensajes;
create policy "gmsj_borrar" on public.grupo_mensajes for delete to authenticated using (autor_id = (select auth.uid()));

-- Este proyecto no da permisos automáticos a las tablas nuevas: se dan aquí (las reglas RLS de arriba siguen mandando)
grant select, insert, delete on public.grupo_mensajes to authenticated;

do $$ begin
  alter publication supabase_realtime add table public.grupo_mensajes;
exception when others then null; end $$;

-- ---------- 3. Calendario: clases canceladas o extra ----------
create table if not exists public.grupo_sesiones (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.grupos (id) on delete cascade,
  fecha date not null,
  hora text check (char_length(hora) <= 12),
  estado text not null check (estado in ('cancelada', 'extra')),
  nota text check (char_length(nota) <= 200),
  creado_por uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  creado timestamptz not null default now(),
  unique (grupo_id, fecha, estado)
);
alter table public.grupo_sesiones enable row level security;
drop policy if exists "gses_ver" on public.grupo_sesiones;
create policy "gses_ver" on public.grupo_sesiones for select to authenticated using (public.en_grupo(grupo_id));
drop policy if exists "gses_gestionar" on public.grupo_sesiones;
create policy "gses_gestionar" on public.grupo_sesiones for all to authenticated
  using (public.gestiona_grupo(grupo_id)) with check (public.gestiona_grupo(grupo_id) and creado_por = (select auth.uid()));
grant select, insert, update, delete on public.grupo_sesiones to authenticated;

-- ---------- 4. Ajustes: solo con estas funciones (que no se pueda cambiar el profe ni el dueño a mano) ----------
drop policy if exists "grupos_familia_cambiar" on public.grupos;

create or replace function public.ajustar_grupo(gid uuid, p_privado boolean, p_plazas int, p_dia text, p_hora text)
returns void language plpgsql security definer set search_path = ''
as $$
declare dentro int;
begin
  if not public.gestiona_grupo(gid) then raise exception 'Solo quien ha creado el grupo puede cambiar los ajustes'; end if;
  select count(*) into dentro from public.grupo_miembros where grupo_id = gid;
  if p_plazas is not null and (p_plazas < 2 or p_plazas > 4) then raise exception 'El grupo tiene que ser de 2 a 4 alumnos'; end if;
  if p_plazas is not null and p_plazas < dentro then raise exception 'Ya hay % alumnos en el grupo: no puedes bajar a %', dentro, p_plazas; end if;
  update public.grupos set
    privado = coalesce(p_privado, privado),
    plazas = coalesce(p_plazas, plazas),
    dia = coalesce(left(nullif(trim(p_dia), ''), 20), dia),
    hora = coalesce(left(nullif(trim(p_hora), ''), 12), hora)
  where id = gid;
end $$;
revoke all on function public.ajustar_grupo(uuid, boolean, int, text, text) from public;
grant execute on function public.ajustar_grupo(uuid, boolean, int, text, text) to authenticated;

-- Enlace de invitación nuevo: el anterior deja de servir
create or replace function public.nuevo_enlace_grupo(gid uuid)
returns text language plpgsql security definer set search_path = ''
as $$
declare c text := replace(gen_random_uuid()::text, '-', '');
begin
  if not public.gestiona_grupo(gid) then raise exception 'Solo quien ha creado el grupo puede cambiar el enlace'; end if;
  update public.grupos set codigo = c where id = gid;
  return c;
end $$;
revoke all on function public.nuevo_enlace_grupo(uuid) from public;
grant execute on function public.nuevo_enlace_grupo(uuid) to authenticated;

-- Salir del grupo. Si sale quien lo creó, el grupo pasa a la familia que lleva más tiempo; si no queda nadie, se borra.
create or replace function public.salir_de_grupo(gid uuid)
returns void language plpgsql security definer set search_path = ''
as $$
declare g public.grupos; siguiente uuid;
begin
  if auth.uid() is null then raise exception 'Entra en tu cuenta'; end if;
  select * into g from public.grupos where id = gid;
  if g.id is null then return; end if;
  delete from public.grupo_miembros where grupo_id = gid and familia_id = auth.uid();
  if g.creado_por = auth.uid() then
    select familia_id into siguiente from public.grupo_miembros where grupo_id = gid order by unido limit 1;
    if siguiente is null and g.teacher_id is null then
      delete from public.grupos where id = gid;
    else
      update public.grupos set creado_por = siguiente where id = gid;
    end if;
  end if;
end $$;
revoke all on function public.salir_de_grupo(uuid) from public;
grant execute on function public.salir_de_grupo(uuid) to authenticated;

-- ---------- 5. Todo lo del panel en una llamada ----------
create or replace function public.grupo_detalle(gid uuid)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare g public.grupos; r jsonb;
begin
  select * into g from public.grupos where id = gid;
  if g.id is null or not public.en_grupo(gid) then return null; end if;
  r := public.grupo_json(g) || jsonb_build_object(
    'codigo', g.codigo,
    'creado', g.creado,
    'gestiona', coalesce(g.creado_por = auth.uid(), false) or coalesce(g.teacher_id = auth.uid(), false),
    'yo', auth.uid(),
    'profe_info', (select jsonb_build_object('id', p.id, 'nombre', trim(p.first_name || ' ' || p.last_name), 'avatar', p.avatar_url)
                   from public.profiles p where p.id = g.teacher_id),
    'miembros', coalesce((select jsonb_agg(jsonb_build_object(
        'id', m.familia_id, 'alumno', m.alumno, 'nombre', p.first_name, 'creador', m.familia_id = g.creado_por, 'unido', m.unido
      ) order by m.unido) from public.grupo_miembros m join public.profiles p on p.id = m.familia_id where m.grupo_id = gid), '[]'::jsonb),
    'sesiones', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'fecha', s.fecha, 'hora', s.hora, 'estado', s.estado, 'nota', s.nota) order by s.fecha)
      from public.grupo_sesiones s where s.grupo_id = gid), '[]'::jsonb)
  );
  return r;
end $$;
revoke all on function public.grupo_detalle(uuid) from public;
grant execute on function public.grupo_detalle(uuid) to authenticated;
