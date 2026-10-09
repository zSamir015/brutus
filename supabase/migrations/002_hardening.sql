-- Endurecimiento posterior a 001.

-- Registro del consentimiento explícito (la Edge Function exige consent = true).
alter table public.subscribers add column if not exists consented_at timestamptz not null default now();

-- Igual que subscribers: RLS forzado también para el dueño de la tabla.
alter table public.rate_limits force row level security;

-- Limpieza: sin esto, rate_limits crece con cada IP/correo nuevo para siempre.
create index if not exists rate_limits_window_start_idx on public.rate_limits (window_start);

create extension if not exists pg_cron;
select cron.schedule(
  'purge-rate-limits',
  '*/15 * * * *',
  $$ delete from public.rate_limits where window_start < now() - interval '1 hour' $$
);
