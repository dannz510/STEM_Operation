-- supabase/migrations/0004_sync_metadata.sql
-- Adds sync metadata columns (version, updated_at auto-trigger) and
-- enables Supabase Realtime publications for key tables.

-- ─── Helper: auto-update updated_at on row change ────────────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── Version counter for Optimistic Locking ───────────────────────────────────
-- Add version column to tasks and schedules (key mutable entities).

alter table public.tasks
  add column if not exists version integer not null default 0;

alter table public.schedules
  add column if not exists version integer not null default 0;

-- Auto-increment version on every update
create or replace function public.bump_version()
returns trigger
language plpgsql
as $$
begin
  new.version = coalesce(old.version, 0) + 1;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_bump_version on public.tasks;
create trigger tasks_bump_version
  before update on public.tasks
  for each row execute function public.bump_version();

drop trigger if exists schedules_bump_version on public.schedules;
create trigger schedules_bump_version
  before update on public.schedules
  for each row execute function public.bump_version();

-- Auto-touch updated_at for assets and borrow_logs (already has updated_at)
drop trigger if exists assets_touch_updated_at on public.assets;
create trigger assets_touch_updated_at
  before update on public.assets
  for each row execute function public.touch_updated_at();

-- ─── Device ID tracking in outbox_events ─────────────────────────────────────

alter table public.outbox_events
  add column if not exists device_id text;

alter table public.outbox_events
  add column if not exists client_timestamp bigint; -- unix ms from client

-- ─── Supabase Realtime Publications ─────────────────────────────────────────
-- Enable row-level realtime for the tables that clients subscribe to.
-- Supabase enables this per-table via the realtime schema publication.

-- Note: In hosted Supabase, you must also toggle "Realtime" on in the Table Editor UI.
-- These SQL statements configure it at the database level.

drop publication if exists supabase_realtime_stem;

create publication supabase_realtime_stem
  for table
    public.tasks,
    public.schedules,
    public.assets,
    public.borrow_logs,
    public.incidents,
    public.notifications,
    public.profiles;

-- ─── Index improvements for sync queries ─────────────────────────────────────

create index if not exists tasks_updated_at_idx
  on public.tasks(workspace_id, updated_at desc);

create index if not exists schedules_updated_at_idx
  on public.schedules(workspace_id, updated_at desc);

create index if not exists assets_updated_at_idx
  on public.assets(workspace_id, updated_at desc);
