-- Tabla de tareas con RLS: cada usuario solo ve/modifica sus filas vía JWT (auth.uid()).
create table public.tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 80),
  done       boolean not null default false,
  created_at timestamptz not null default now()
);
create index tasks_user_created_idx on public.tasks (user_id, created_at desc);

alter table public.tasks enable row level security;
alter table public.tasks force row level security;

create policy "tasks_select_own" on public.tasks for select to authenticated using (user_id = auth.uid());
create policy "tasks_update_own" on public.tasks for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "tasks_delete_own" on public.tasks for delete to authenticated using (user_id = auth.uid());
-- Sin policy de INSERT para clientes: las altas SOLO pasan por la Edge Function (service role).
-- Defensa extra: el cliente tampoco puede reasignar user_id ni crear filas directo.
revoke insert on public.tasks from anon, authenticated;
revoke update on public.tasks from anon, authenticated; -- revocar a nivel tabla (el revoke por columna no tiene efecto sobre un grant de tabla)
grant update (done) on public.tasks to authenticated;   -- solo "done" editable por el cliente

-- Rate limiting / IP limiting (ventana fija). Solo accesible con service role.
create table public.rate_limits (
  key          text primary key,
  count        int not null,
  window_start timestamptz not null
);
alter table public.rate_limits enable row level security; -- sin policies = nadie salvo service role

create or replace function public.check_rate_limit(p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  c int;
begin
  insert into rate_limits as r (key, count, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
    set count        = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.count + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning count into c;
  return c <= p_max;
end;
$$;
revoke all on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int) to service_role;
