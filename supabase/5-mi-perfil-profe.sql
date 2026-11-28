-- ClasUno · El profe ve y edita su propio perfil desde su panel (pestaña «Mi perfil»)
-- Pegar en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez.

-- Su perfil completo, también si aún está pendiente de aprobar o en pausa (profes_publicos() solo da los aprobados)
create or replace function public.mi_perfil_profe()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', t.user_id, 'status', t.status,
    'nombre', trim(coalesce(p.first_name, '') || ' ' || coalesce(p.last_name, '')),
    'first_name', p.first_name, 'last_name', p.last_name, 'avatar', p.avatar_url,
    'degree', t.degree, 'center', t.center, 'headline', t.headline, 'description', t.description,
    'modality', t.modality, 'zone', t.zone, 'price', t.price_per_hour,
    'classes', t.classes_count, 'positive', t.positive_reviews, 'verified', t.verified,
    'certificado', t.certificado, 'grupos', t.acepta_grupos,
    'languages', to_jsonb(t.languages), 'availability', to_jsonb(t.availability), 'experience', t.experience_years,
    'subjects', (select coalesce(jsonb_agg(s.name), '[]'::jsonb) from public.teacher_subjects ts join public.subjects s on s.id = ts.subject_id where ts.teacher_id = t.user_id),
    'levels',   (select coalesce(jsonb_agg(l.name), '[]'::jsonb) from public.teacher_levels tl join public.levels l on l.id = tl.level_id where tl.teacher_id = t.user_id)
  )
  from public.teacher_profiles t join public.profiles p on p.id = t.user_id
  where t.user_id = auth.uid()
$$;
revoke all on function public.mi_perfil_profe() from public, anon;
grant execute on function public.mi_perfil_profe() to authenticated;

-- Guardar el perfil: igual que antes, y además los años de experiencia
-- (el aviso de seguridad no cambia: si un profe aprobado cambia sus estudios, vuelve a revisión)
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
    availability = r.availability, languages = r.languages, acepta_grupos = coalesce(r.acepta_grupos, false),
    experience_years = coalesce(r.experience_years, experience_years)
  where user_id = auth.uid();
  if not found then
    insert into public.teacher_profiles (user_id, degree, center, headline, description, modality, zone, price_per_hour, availability, languages, acepta_grupos, experience_years)
    values (auth.uid(), r.degree, r.center, r.headline, r.description, r.modality, r.zone, r.price_per_hour, r.availability, r.languages, coalesce(r.acepta_grupos, false), r.experience_years);
  end if;
  delete from public.teacher_subjects where teacher_id = auth.uid();
  insert into public.teacher_subjects (teacher_id, subject_id) select auth.uid(), s.id from public.subjects s where s.name = any (asignaturas);
  delete from public.teacher_levels where teacher_id = auth.uid();
  insert into public.teacher_levels (teacher_id, level_id) select auth.uid(), l.id from public.levels l where l.name = any (niveles);
end $$;
revoke all on function public.guardar_perfil_profe(jsonb, text[], text[]) from public;
grant execute on function public.guardar_perfil_profe(jsonb, text[], text[]) to authenticated;
