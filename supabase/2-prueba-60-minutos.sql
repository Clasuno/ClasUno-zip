-- La primera clase a prueba solo puede ser de 60 minutos.
-- La web ya no deja elegir otra duración; esta regla lo asegura también en la base de datos.
-- Se pega en Supabase → SQL Editor → Run. Se puede ejecutar más de una vez.
-- «not valid» respeta las clases de prueba que ya existan con otra duración y solo vigila las nuevas.

alter table public.clases drop constraint if exists clases_prueba_60;
alter table public.clases add constraint clases_prueba_60
  check (tipo <> 'prueba' or minutos = 60) not valid;
