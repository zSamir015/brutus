-- Hardening on top of 001.

-- Record explicit consent (the Edge Function requires consent = true).
alter table public.subscribers add column if not exists consented_at timestamptz not null default now();

-- Same as subscribers: RLS forced for the table owner too.
alter table public.rate_limits force row level security;

-- Cleanup: without this, rate_limits grows forever with every new IP/email.
create index if not exists rate_limits_window_start_idx on public.rate_limits (window_start);

create extension if not exists pg_cron;
select cron.schedule(
  'purge-rate-limits',
  '*/15 * * * *',
  $$ delete from public.rate_limits where window_start < now() - interval '1 hour' $$
);
