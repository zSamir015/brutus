-- Subscribers: anon/authenticated cannot read or write directly (RLS with no policies).
-- Inserts go ONLY through the `subscribe` Edge Function (service role).
create table public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique check (char_length(email) <= 254),
  created_at timestamptz not null default now()
);
alter table public.subscribers enable row level security;
alter table public.subscribers force row level security;
revoke all on public.subscribers from anon, authenticated;

-- Rate limiting / IP limiting (fixed window)
create table public.rate_limits (
  key          text primary key,
  count        int not null,
  window_start timestamptz not null
);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

create or replace function public.check_rate_limit(p_key text, p_max int, p_window_seconds int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare c int;
begin
  insert into rate_limits as r (key, count, window_start) values (p_key, 1, now())
  on conflict (key) do update
    set count        = case when r.window_start < now() - make_interval(secs => p_window_seconds) then 1 else r.count + 1 end,
        window_start = case when r.window_start < now() - make_interval(secs => p_window_seconds) then now() else r.window_start end
  returning count into c;
  return c <= p_max;
end;
$$;
revoke all on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int) to service_role;
