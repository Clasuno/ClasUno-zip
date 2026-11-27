-- ClasUno · Las familias crean grupos de estudio, públicos o privados
-- Pegar en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez.
--
-- · Público: sale en el tablón y se puede unir cualquier familia.
-- · Privado: no sale en el tablón; solo se entra con el enlace de invitación (grupos.html?invitacion=<codigo>).
-- · Un grupo creado por una familia puede no tener profe todavía: lo pone después ClasUno o un profe.

-- ---------- 1. Columnas nuevas ----------
alter table public.grupos alter column teacher_id drop not null;
alter table public.grupos add column if not exists creado_por uuid references public.profiles (id) on delete cascade default auth.uid();
alter table public.grupos add column if not exists privado boolean not null default false;
alter table public.grupos add column if not exists codigo text not null default replace(gen_random_uuid()::text, '-', '');
create unique index if not exists grupos_codigo on public.grupos (codigo);
alter table public.grupos drop constraint if exists grupos_con_dueno;
alter table public.grupos add constraint grupos_con_dueno check (teacher_id is not null or creado_por is not null) not valid;

-- ---------- 2. Quién ve cada grupo ----------
-- Los públicos, cualquiera. Los privados, solo quien lo ha creado, su profe y quien ya está dentro.
-- (Para entrar a uno privado con el enlace se usa grupo_por_codigo(), más abajo.)
create or replace function public.es_miembro(g uuid)
returns boolean language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.grupo_miembros m where m.grupo_id = g and m.familia_id = auth.uid()) $$;
revoke all on function public.es_miembro(uuid) from public;
grant execute on function public.es_miembro(uuid) to anon, authenticated; -- la usa la regla de lectura de grupos

drop policy if exists "grupos_ver" on public.grupos;
create policy "grupos_ver" on public.grupos for select to anon, authenticated using (
  not privado
  or teacher_id = (select auth.uid())
  or creado_por = (select auth.uid())
  or public.es_miembro(id)
);

-- La familia que crea el grupo lo puede cambiar (por ejemplo, de privado a público) o borrar
drop policy if exists "grupos_familia_crear" on public.grupos;
create policy "grupos_familia_crear" on public.grupos for insert to authenticated with check (creado_por = (select auth.uid()) and teacher_id is null);
drop policy if exists "grupos_familia_cambiar" on public.grupos;
create policy "grupos_familia_cambiar" on public.grupos for update to authenticated using (creado_por = (select auth.uid())) with check (creado_por = (select auth.uid()));
drop policy if exists "grupos_familia_borrar" on public.grupos;
create policy "grupos_familia_borrar" on public.grupos for delete to authenticated using (creado_por = (select auth.uid()));

-- ---------- 3. Unirse ----------
-- Directamente solo a los públicos (o al tuyo). A los privados se entra con unirse_con_codigo().
drop policy if exists "miembros_unirse" on public.grupo_miembros;
create policy "miembros_unirse" on public.grupo_miembros for insert to authenticated with check (
  familia_id = (select auth.uid())
  and exists (select 1 from public.grupos g where g.id = grupo_id and (not g.privado or g.creado_por = (select auth.uid())))
);

-- Los miembros de un grupo ven quién más hay (para el profe y las familias del grupo)
drop policy if exists "miembros_ver" on public.grupo_miembros;
create policy "miembros_ver" on public.grupo_miembros for select to authenticated using (
  familia_id = (select auth.uid())
  or exists (select 1 from public.grupos g where g.id = grupo_id and (g.teacher_id = (select auth.uid()) or g.creado_por = (select auth.uid())))
);

-- ---------- 4. Funciones que usa la web ----------
-- Fila de un grupo tal como la ve la web. El código de invitación solo se da a quien ya está dentro o lo ha creado.
create or replace function public.grupo_json(g public.grupos)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', g.id, 'profe', g.teacher_id, 'asignatura', g.asignatura, 'curso', g.curso, 'zona', g.zona, 'dia', g.dia, 'hora', g.hora,
    'plazas', g.plazas, 'ocupadas', (select count(*) from public.grupo_miembros m where m.grupo_id = g.id),
    'privado', g.privado,
    'mio', g.creado_por is not null and g.creado_por = auth.uid(),
    'dentro', exists (select 1 from public.grupo_miembros m where m.grupo_id = g.id and m.familia_id = auth.uid()),
    'codigo', case when g.creado_por = auth.uid() or g.teacher_id = auth.uid()
                     or exists (select 1 from public.grupo_miembros m where m.grupo_id = g.id and m.familia_id = auth.uid())
                   then g.codigo end
  )
$$;
revoke all on function public.grupo_json(public.grupos) from public, anon, authenticated; -- solo la usan las funciones de abajo

-- Tablón: los públicos y, además, los privados en los que estás
create or replace function public.grupos_abiertos()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(public.grupo_json(g) order by g.creado desc), '[]'::jsonb)
  from public.grupos g
  where not g.privado
     or g.creado_por = auth.uid()
     or g.teacher_id = auth.uid()
     or exists (select 1 from public.grupo_miembros m where m.grupo_id = g.id and m.familia_id = auth.uid());
$$;
revoke all on function public.grupos_abiertos() from public;
grant execute on function public.grupos_abiertos() to anon, authenticated;

-- Abrir un grupo con el enlace de invitación (también los privados)
create or replace function public.grupo_por_codigo(c text)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select public.grupo_json(g) || jsonb_build_object('codigo', g.codigo)
  from public.grupos g where g.codigo = c
$$;
revoke all on function public.grupo_por_codigo(text) from public;
grant execute on function public.grupo_por_codigo(text) to anon, authenticated;

-- Unirse con el enlace de invitación
drop function if exists public.unirse_con_codigo(text, text);
create or replace function public.unirse_con_codigo(c text, p_alumno text default null)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare gid uuid;
begin
  if auth.uid() is null then raise exception 'Entra en tu cuenta para unirte al grupo'; end if;
  select id into gid from public.grupos where codigo = c;
  if gid is null then raise exception 'Este enlace de invitación no es válido'; end if;
  insert into public.grupo_miembros (grupo_id, familia_id, alumno) values (gid, auth.uid(), left(p_alumno, 60))
  on conflict (grupo_id, familia_id) do nothing;
  return gid;
end $$;
revoke all on function public.unirse_con_codigo(text, text) from public;
grant execute on function public.unirse_con_codigo(text, text) to authenticated;

-- Crear un grupo como familia (y entrar en él)
drop function if exists public.crear_grupo(text, text, text, text, text, int, boolean, text);
create or replace function public.crear_grupo(p_asignatura text, p_curso text, p_zona text, p_dia text, p_hora text, p_plazas int, p_privado boolean, p_alumno text default null)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare g public.grupos;
begin
  if auth.uid() is null then raise exception 'Entra en tu cuenta para crear un grupo'; end if;
  if coalesce(trim(p_asignatura), '') = '' or coalesce(trim(p_curso), '') = '' or coalesce(trim(p_zona), '') = '' then
    raise exception 'Faltan la asignatura, el curso o el barrio';
  end if;
  if (select count(*) from public.grupos x where x.creado_por = auth.uid()) >= 10 then raise exception 'Ya has creado 10 grupos'; end if;
  insert into public.grupos (teacher_id, creado_por, asignatura, curso, zona, dia, hora, plazas, privado)
  values (null, auth.uid(), left(p_asignatura, 60), left(p_curso, 40), left(p_zona, 60), left(coalesce(p_dia, 'Por decidir'), 20),
          left(coalesce(p_hora, 'Por decidir'), 12), greatest(2, least(4, coalesce(p_plazas, 4))), coalesce(p_privado, false))
  returning * into g;
  insert into public.grupo_miembros (grupo_id, familia_id, alumno) values (g.id, auth.uid(), left(p_alumno, 60));
  return public.grupo_json(g) || jsonb_build_object('mio', true, 'dentro', true, 'codigo', g.codigo, 'ocupadas', 1);
end $$;
revoke all on function public.crear_grupo(text, text, text, text, text, int, boolean, text) from public;
grant execute on function public.crear_grupo(text, text, text, text, text, int, boolean, text) to authenticated;
