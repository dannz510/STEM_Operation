-- STEM Lab OS: multi-tenant foundation, RBAC, asset custody, tasks and auditability.
-- Apply with Supabase CLI after linking the target project.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create type public.account_status as enum ('PENDING', 'ACTIVE', 'SUSPENDED');
create type public.workspace_role as enum ('ADMIN', 'MANAGER', 'OPERATOR', 'MEMBER');
create type public.rank_level as enum ('CADET', 'OPERATOR', 'LEAD', 'CHIEF');
create type public.asset_status as enum ('AVAILABLE', 'IN_USE', 'MAINTENANCE', 'DAMAGED', 'LOST');
create type public.loan_status as enum ('ACTIVE', 'RETURNED', 'OVERDUE', 'DISPUTED');
create type public.task_status as enum ('BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED');
create type public.task_priority as enum ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
create type public.incident_status as enum ('OPEN', 'INVESTIGATING', 'RESOLVED');

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  avatar_url text,
  status public.account_status not null default 'PENDING',
  rank public.rank_level not null default 'CADET',
  merit_points integer not null default 0 check (merit_points >= 0),
  demerit_points integer not null default 0 check (demerit_points >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_memberships (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.workspace_role not null default 'MEMBER',
  sub_branch_code text,
  joined_at timestamptz not null default now(),
  active boolean not null default true,
  primary key (workspace_id, user_id)
);

create index workspace_memberships_user_idx on public.workspace_memberships(user_id, active);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  request_id uuid,
  created_at timestamptz not null default now()
);

create index audit_logs_workspace_created_idx on public.audit_logs(workspace_id, created_at desc);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  code text not null,
  name text not null,
  category text not null,
  branch_owner text,
  status public.asset_status not null default 'AVAILABLE',
  location text not null default '',
  serial_number text,
  value_vnd bigint not null default 0 check (value_vnd >= 0),
  qr_token text not null unique default encode(gen_random_bytes(18), 'hex'),
  tags text[] not null default '{}',
  metadata jsonb not null default '{}',
  last_maintenance date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, code)
);

create index assets_workspace_status_idx on public.assets(workspace_id, status);
create index assets_tags_gin_idx on public.assets using gin(tags);

create table public.borrow_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  asset_id uuid not null references public.assets(id) on delete restrict,
  borrower_id uuid not null references public.profiles(id) on delete restrict,
  status public.loan_status not null default 'ACTIVE',
  borrowed_at timestamptz not null default now(),
  expected_return_at timestamptz not null,
  returned_at timestamptz,
  condition_on_loan text not null default '',
  condition_on_return text,
  note text,
  request_id uuid not null,
  created_at timestamptz not null default now(),
  unique (workspace_id, request_id)
);

create unique index one_active_loan_per_asset_idx
  on public.borrow_logs(asset_id)
  where status in ('ACTIVE', 'OVERDUE');

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  reporter_id uuid references public.profiles(id) on delete set null,
  title text not null,
  severity text not null,
  category text not null,
  sub_branch_code text,
  description text not null default '',
  immediate_action text not null default '',
  status public.incident_status not null default 'OPEN',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  created_by uuid not null references public.profiles(id) on delete restrict,
  assignee_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null default '',
  status public.task_status not null default 'TODO',
  priority public.task_priority not null default 'MEDIUM',
  points_reward integer not null default 10 check (points_reward >= 0),
  due_at timestamptz,
  completed_at timestamptz,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_workspace_status_idx on public.tasks(workspace_id, status, due_at);

create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null default 'CONFIRMED',
  color_code text not null default '#0284C7',
  created_at timestamptz not null default now(),
  check (end_at > start_at),
  exclude using gist (
    workspace_id with =,
    user_id with =,
    tstzrange(start_at, end_at, '[)') with &&
  ) where (status = 'CONFIRMED')
);

create table public.point_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  code text not null,
  reason text not null,
  amount integer not null,
  enabled boolean not null default true,
  unique (workspace_id, code)
);

create table public.point_transactions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  amount integer not null check (amount <> 0),
  reason text not null,
  source_type text not null,
  source_id uuid,
  idempotency_key text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (workspace_id, idempotency_key)
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  code text not null,
  name text not null,
  description text not null default '',
  icon text not null default 'award',
  unique (workspace_id, code)
);

create table public.member_badges (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  primary key (workspace_id, user_id, badge_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  event_type text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}',
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_memberships
    where workspace_id = target_workspace
      and user_id = auth.uid()
      and active = true
  );
$$;

create or replace function public.has_workspace_role(target_workspace uuid, allowed_roles public.workspace_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_memberships
    where workspace_id = target_workspace
      and user_id = auth.uid()
      and active = true
      and role = any(allowed_roles)
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.onboard_personnel(
  target_workspace uuid,
  target_email text,
  target_role public.workspace_role default 'MEMBER'
)
returns public.workspace_memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  target_profile public.profiles;
  membership public.workspace_memberships;
begin
  if not public.has_workspace_role(target_workspace, array['ADMIN'::public.workspace_role, 'MANAGER'::public.workspace_role]) then
    raise exception using errcode = '42501', message = 'FORBIDDEN: administrator or manager role required';
  end if;

  select * into target_profile
  from public.profiles
  where email = lower(trim(target_email));

  if target_profile.id is null then
    raise exception using errcode = 'P0001', message = 'MEMBER_NOT_FOUND: email has no registered account';
  end if;

  if target_profile.status <> 'ACTIVE' then
    raise exception using errcode = 'P0001', message = 'ACCOUNT_INACTIVE: account must be ACTIVE';
  end if;

  insert into public.workspace_memberships (workspace_id, user_id, role, active)
  values (target_workspace, target_profile.id, target_role, true)
  on conflict (workspace_id, user_id) do update
    set role = excluded.role, active = true;

  select * into membership
  from public.workspace_memberships
  where workspace_id = target_workspace and user_id = target_profile.id;

  return membership;
end;
$$;

create or replace function public.borrow_asset(
  target_workspace uuid,
  target_asset uuid,
  expected_return timestamptz,
  request uuid,
  note_text text default ''
)
returns public.borrow_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_asset public.assets;
  created_loan public.borrow_logs;
begin
  if not public.is_workspace_member(target_workspace) then
    raise exception using errcode = '42501', message = 'FORBIDDEN: active workspace membership required';
  end if;

  select * into created_loan
  from public.borrow_logs
  where workspace_id = target_workspace and request_id = request;
  if created_loan.id is not null then
    return created_loan;
  end if;

  select * into locked_asset from public.assets
  where id = target_asset and workspace_id = target_workspace
  for update;

  if locked_asset.id is null then
    raise exception using errcode = 'P0002', message = 'ASSET_NOT_FOUND';
  end if;
  if locked_asset.status <> 'AVAILABLE' then
    raise exception using errcode = 'P0001', message = 'ASSET_UNAVAILABLE';
  end if;

  insert into public.borrow_logs (workspace_id, asset_id, borrower_id, expected_return_at, note, request_id)
  values (target_workspace, target_asset, auth.uid(), expected_return, note_text, request)
  on conflict (workspace_id, request_id) do update set note = excluded.note
  returning * into created_loan;

  update public.assets set status = 'IN_USE', updated_at = now() where id = target_asset;
  insert into public.audit_logs (workspace_id, actor_id, action, entity_type, entity_id, after_data, request_id)
  values (target_workspace, auth.uid(), 'BORROW', 'ASSET', target_asset, to_jsonb(created_loan), request);
  return created_loan;
end;
$$;

create or replace function public.return_asset(
  target_workspace uuid,
  target_loan uuid,
  return_condition text,
  request uuid
)
returns public.borrow_logs
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_loan public.borrow_logs;
  updated_loan public.borrow_logs;
begin
  if not public.is_workspace_member(target_workspace) then
    raise exception using errcode = '42501', message = 'FORBIDDEN: active workspace membership required';
  end if;

  select * into locked_loan from public.borrow_logs
  where id = target_loan and workspace_id = target_workspace
  for update;
  if locked_loan.id is null then
    raise exception using errcode = 'P0002', message = 'LOAN_NOT_FOUND';
  end if;
  if locked_loan.status = 'RETURNED' then
    return locked_loan;
  end if;

  update public.borrow_logs
  set status = 'RETURNED', returned_at = now(), condition_on_return = return_condition
  where id = target_loan
  returning * into updated_loan;

  update public.assets set status = 'AVAILABLE', updated_at = now() where id = locked_loan.asset_id;
  insert into public.audit_logs (workspace_id, actor_id, action, entity_type, entity_id, before_data, after_data, request_id)
  values (target_workspace, auth.uid(), 'RETURN', 'BORROW_LOG', target_loan, to_jsonb(locked_loan), to_jsonb(updated_loan), request);
  return updated_loan;
end;
$$;

create or replace function public.award_points(
  target_workspace uuid,
  target_user uuid,
  point_amount integer,
  point_reason text,
  source_type text,
  source_entity uuid,
  idempotency text
)
returns public.point_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  transaction_row public.point_transactions;
begin
  if not public.has_workspace_role(target_workspace, array['ADMIN'::public.workspace_role, 'MANAGER'::public.workspace_role, 'OPERATOR'::public.workspace_role]) then
    raise exception using errcode = '42501', message = 'FORBIDDEN: point editor role required';
  end if;
  if point_amount = 0 then
    raise exception using errcode = '22023', message = 'POINT_AMOUNT_CANNOT_BE_ZERO';
  end if;

  insert into public.point_transactions (workspace_id, user_id, amount, reason, source_type, source_id, idempotency_key, created_by)
  values (target_workspace, target_user, point_amount, point_reason, source_type, source_entity, idempotency, auth.uid())
  on conflict (workspace_id, idempotency_key) do update set reason = excluded.reason
  returning * into transaction_row;

  update public.profiles
  set merit_points = greatest(0, merit_points + case when point_amount > 0 then point_amount else 0 end),
      demerit_points = greatest(0, demerit_points + case when point_amount < 0 then abs(point_amount) else 0 end),
      updated_at = now()
  where id = target_user;
  return transaction_row;
end;
$$;

alter table public.workspaces enable row level security;
alter table public.profiles enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.audit_logs enable row level security;
alter table public.assets enable row level security;
alter table public.borrow_logs enable row level security;
alter table public.incidents enable row level security;
alter table public.tasks enable row level security;
alter table public.schedules enable row level security;
alter table public.point_rules enable row level security;
alter table public.point_transactions enable row level security;
alter table public.badges enable row level security;
alter table public.member_badges enable row level security;
alter table public.notifications enable row level security;
alter table public.outbox_events enable row level security;

create policy workspace_member_read on public.workspaces for select using (public.is_workspace_member(id));
create policy profile_self_or_workspace_read on public.profiles for select using (id = auth.uid() or exists (select 1 from public.workspace_memberships m where m.user_id = profiles.id and public.is_workspace_member(m.workspace_id)));
create policy membership_read on public.workspace_memberships for select using (user_id = auth.uid() or public.is_workspace_member(workspace_id));
create policy membership_manage on public.workspace_memberships for all using (public.has_workspace_role(workspace_id, array['ADMIN'::public.workspace_role, 'MANAGER'::public.workspace_role]));

create policy audit_read on public.audit_logs for select using (public.has_workspace_role(workspace_id, array['ADMIN'::public.workspace_role, 'MANAGER'::public.workspace_role]));
create policy asset_read on public.assets for select using (public.is_workspace_member(workspace_id));
create policy asset_manage on public.assets for all using (public.has_workspace_role(workspace_id, array['ADMIN'::public.workspace_role, 'MANAGER'::public.workspace_role, 'OPERATOR'::public.workspace_role]));
create policy loan_read on public.borrow_logs for select using (public.is_workspace_member(workspace_id));
create policy incident_access on public.incidents for all using (public.is_workspace_member(workspace_id));
create policy task_access on public.tasks for all using (public.is_workspace_member(workspace_id));
create policy schedule_access on public.schedules for all using (public.is_workspace_member(workspace_id));
create policy points_read on public.point_transactions for select using (public.is_workspace_member(workspace_id));
create policy point_rules_access on public.point_rules for select using (public.is_workspace_member(workspace_id));
create policy badges_read on public.badges for select using (workspace_id is null or public.is_workspace_member(workspace_id));
create policy member_badges_read on public.member_badges for select using (public.is_workspace_member(workspace_id));
create policy notifications_access on public.notifications for all using (user_id = auth.uid() and public.is_workspace_member(workspace_id));
create policy outbox_read on public.outbox_events for select using (public.has_workspace_role(workspace_id, array['ADMIN'::public.workspace_role, 'MANAGER'::public.workspace_role]));

revoke all on function public.onboard_personnel(uuid, text, public.workspace_role) from public;
grant execute on function public.onboard_personnel(uuid, text, public.workspace_role) to authenticated;
revoke all on function public.borrow_asset(uuid, uuid, timestamptz, uuid, text) from public;
grant execute on function public.borrow_asset(uuid, uuid, timestamptz, uuid, text) to authenticated;
revoke all on function public.return_asset(uuid, uuid, text, uuid) from public;
grant execute on function public.return_asset(uuid, uuid, text, uuid) to authenticated;
revoke all on function public.award_points(uuid, uuid, integer, text, text, uuid, text) from public;
grant execute on function public.award_points(uuid, uuid, integer, text, text, uuid, text) to authenticated;
