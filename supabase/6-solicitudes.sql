-- ClasUno · Solicitudes de clase: online o en persona, perfil del alumno y chat desde el profe
-- Pegar en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez.

-- ---------- 1. Cada clase dice si es online o en persona ----------
alter table public.clases add column if not exists modalidad text check (modalidad in ('presencial', 'online'));

-- Solo se puede pedir como la ofrece el profe; si el profe solo hace una, se pone esa. Después no se cambia.
create or replace function public.clases_modalidad()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare m text;
begin
  if tg_op = 'UPDATE' then new.modalidad := old.modalidad; return new; end if;
  select modality into m from public.teacher_profiles where user_id = new.teacher_id;
  if new.modalidad is null and m in ('presencial', 'online') then new.modalidad := m; end if;
  if new.modalidad is not null and m in ('presencial', 'online') and new.modalidad <> m then
    raise exception 'Este profe solo da clases %', case m when 'online' then 'online' else 'en persona' end;
  end if;
  return new;
end $$;
drop trigger if exists clases_modalidad on public.clases;
create trigger clases_modalidad before insert or update on public.clases for each row execute function public.clases_modalidad();

-- ---------- 2. El perfil del alumno, para el profe ----------
-- Solo para familias que le han pedido clase o con las que ya tiene conversación. Sin correo ni apellidos completos.
create or replace function public.perfil_alumno(fam uuid)
returns jsonb language sql stable security definer set search_path = ''
as $$
  select case
    when auth.uid() is null
      or (not exists (select 1 from public.clases c where c.teacher_id = auth.uid() and c.familia_id = fam)
          and not exists (select 1 from public.conversations v where v.teacher_id = auth.uid() and v.student_id = fam))
    then null
    else (
      select jsonb_build_object(
        'id', p.id, 'nombre', p.first_name, 'inicial', left(p.last_name, 1), 'avatar', p.avatar_url, 'desde', p.created_at,
        'tipo', coalesce(u.raw_user_meta_data ->> 'tipo', 'familia'),
        'zona', u.raw_user_meta_data ->> 'zona',
        'hijos', coalesce(u.raw_user_meta_data -> 'hijos', '[]'::jsonb),
        'clases', (select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'empieza', c.empieza, 'tipo', c.tipo, 'minutos', c.minutos,
                     'estado', c.estado, 'modalidad', c.modalidad, 'alumno', c.alumno) order by c.empieza desc), '[]'::jsonb)
                   from public.clases c where c.teacher_id = auth.uid() and c.familia_id = fam),
        'informes', (select count(*) from public.informes i where i.teacher_id = auth.uid() and i.familia_id = fam),
        'conversacion', (select v.id from public.conversations v where v.teacher_id = auth.uid() and v.student_id = fam)
      )
      from public.profiles p join auth.users u on u.id = p.id
      where p.id = fam
    )
  end
$$;
revoke all on function public.perfil_alumno(uuid) from public, anon;
grant execute on function public.perfil_alumno(uuid) to authenticated;

-- ---------- 3. El profe puede empezar el chat con una familia que le ha pedido clase ----------
create or replace function public.abrir_chat_familia(fam uuid)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare cid uuid;
begin
  if auth.uid() is null then raise exception 'Hace falta iniciar sesión'; end if;
  if not exists (select 1 from public.clases c where c.teacher_id = auth.uid() and c.familia_id = fam) then
    raise exception 'Solo puedes escribir a familias que te han pedido clase';
  end if;
  select id into cid from public.conversations where student_id = fam and teacher_id = auth.uid();
  if cid is null then
    insert into public.conversations (student_id, teacher_id) values (fam, auth.uid()) returning id into cid;
  end if;
  return cid;
end $$;
revoke all on function public.abrir_chat_familia(uuid) from public, anon;
grant execute on function public.abrir_chat_familia(uuid) to authenticated;
