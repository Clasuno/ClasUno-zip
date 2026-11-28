-- 7. Reseñas de las familias (28-nov-2026)
-- Una familia puntúa a un profe (1 a 5 estrellas y, si quiere, un comentario) cuando ya ha tenido
-- al menos una clase con él que haya terminado. Una reseña por familia y profe: si vuelve a puntuar, se cambia la suya.
-- Las reseñas salen en el buscador y en la ficha del profe a través de profes_publicos().

create table if not exists public.resenas (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id) on delete cascade,
  familia_id uuid not null references public.profiles (id) on delete cascade,
  estrellas smallint not null check (estrellas between 1 and 5),
  texto text check (char_length(texto) <= 600),
  autor text,
  creada timestamptz not null default now(),
  cambiada timestamptz,
  unique (teacher_id, familia_id)
);
create index if not exists resenas_profe_idx on public.resenas (teacher_id, creada desc);
alter table public.resenas enable row level security;

-- La base de datos pone el nombre que se publica («Marta P.») y comprueba que ya ha habido clase
create or replace function public.resenas_comprobar()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare nom text; ape text;
begin
  if tg_op = 'UPDATE' then
    new.teacher_id := old.teacher_id; new.familia_id := old.familia_id; new.creada := old.creada; new.cambiada := now();
  end if;
  if not exists (
    select 1 from public.clases c
    where c.teacher_id = new.teacher_id and c.familia_id = new.familia_id
      and c.estado in ('aceptada', 'hecha') and c.empieza + c.minutos * interval '1 minute' < now()
  ) then
    raise exception 'Solo puedes valorar a un profe después de tener clase con él';
  end if;
  select first_name, last_name into nom, ape from public.profiles where id = new.familia_id;
  new.autor := trim(coalesce(nullif(trim(nom), ''), 'Familia') || coalesce(' ' || nullif(left(trim(ape), 1), '') || '.', ''));
  new.texto := nullif(trim(coalesce(new.texto, '')), '');
  return new;
end $$;
drop trigger if exists resenas_comprobar on public.resenas;
create trigger resenas_comprobar before insert or update on public.resenas for each row execute function public.resenas_comprobar();

drop policy if exists "resenas_ver" on public.resenas;
create policy "resenas_ver" on public.resenas for select to authenticated using ((select auth.uid()) in (teacher_id, familia_id));
drop policy if exists "resenas_escribir" on public.resenas;
create policy "resenas_escribir" on public.resenas for insert to authenticated with check (familia_id = (select auth.uid()));
drop policy if exists "resenas_cambiar" on public.resenas;
create policy "resenas_cambiar" on public.resenas for update to authenticated using (familia_id = (select auth.uid())) with check (familia_id = (select auth.uid()));
drop policy if exists "resenas_borrar" on public.resenas;
create policy "resenas_borrar" on public.resenas for delete to authenticated using (familia_id = (select auth.uid()));
-- Este proyecto no da permisos automáticos a las tablas nuevas
grant select, insert, update, delete on public.resenas to authenticated;

-- profes_publicos() con la nota media, el número de reseñas y las 20 últimas
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
    'levels',   (select coalesce(jsonb_agg(l.name), '[]'::jsonb) from public.teacher_levels tl join public.levels l on l.id = tl.level_id where tl.teacher_id = t.user_id),
    'nota',      (select round(avg(r.estrellas)::numeric, 1) from public.resenas r where r.teacher_id = t.user_id),
    'n_resenas', (select count(*) from public.resenas r where r.teacher_id = t.user_id),
    'reparto',   (select jsonb_build_array(
                    count(*) filter (where r.estrellas = 5), count(*) filter (where r.estrellas = 4), count(*) filter (where r.estrellas = 3),
                    count(*) filter (where r.estrellas = 2), count(*) filter (where r.estrellas = 1))
                  from public.resenas r where r.teacher_id = t.user_id),
    'resenas',   (select coalesce(jsonb_agg(jsonb_build_object('autor', x.autor, 'estrellas', x.estrellas, 'texto', x.texto, 'creada', x.creada) order by x.creada desc), '[]'::jsonb)
                  from (select r.autor, r.estrellas, r.texto, r.creada from public.resenas r where r.teacher_id = t.user_id order by r.creada desc limit 20) x)
  )), '[]'::jsonb)
  from public.teacher_profiles t
  join public.profiles p on p.id = t.user_id
  where lower(t.status::text) in ('approved', 'aprobado', 'publicado', 'active', 'activo');
$$;
revoke all on function public.profes_publicos() from public;
grant execute on function public.profes_publicos() to anon, authenticated;
