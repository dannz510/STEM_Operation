-- supabase/migrations/0005_default_workspace.sql
-- Tự động khởi tạo workspace cá nhân khi profile mới được tạo thông qua sync API.

create or replace function public.get_or_create_default_workspace(target_user_id text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_workspace_id uuid;
  new_workspace_id uuid;
  user_profile public.profiles;
  workspace_name text;
  workspace_slug text;
begin
  -- 1. Tìm workspace active hiện có của user
  select workspace_id into existing_workspace_id
  from public.workspace_memberships
  where user_id = target_user_id
    and active = true
  limit 1;

  if existing_workspace_id is not null then
    return existing_workspace_id;
  end if;

  -- 2. Lấy thông tin profile để đặt tên workspace
  select * into user_profile
  from public.profiles
  where id = target_user_id;

  workspace_name := coalesce(
    nullif(trim(user_profile.full_name), ''),
    split_part(user_profile.email, '@', 1),
    'My Lab'
  ) || '''s Lab';

  workspace_slug := lower(
    regexp_replace(
      regexp_replace(workspace_name, '[^a-zA-Z0-9]+', '-', 'g'),
      '^-|-$', '', 'g'
    )
  );

  workspace_slug := substring(workspace_slug for 35) || '-' || extract(epoch from now())::bigint::text;

  -- 3. Tạo workspace mới
  insert into public.workspaces (name, slug)
  values (workspace_name, workspace_slug)
  returning id into new_workspace_id;

  -- 4. Thêm user làm ADMIN của workspace cá nhân
  insert into public.workspace_memberships (workspace_id, user_id, role, active)
  values (new_workspace_id, target_user_id, 'ADMIN', true)
  on conflict (workspace_id, user_id) do update
    set role = 'ADMIN', active = true;

  return new_workspace_id;
end;
$$;

revoke all on function public.get_or_create_default_workspace(text) from public;
grant execute on function public.get_or_create_default_workspace(text) to authenticated;

-- Trigger tự động tạo workspace khi profile mới được insert từ sync.ts
create or replace function public.handle_new_user_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    perform public.get_or_create_default_workspace(new.id);
  exception when others then
    raise warning 'Failed to auto-create workspace for user %: %', new.id, sqlerrm;
  end;
  return new;
end;
$$;

drop trigger if exists on_profile_created_provision_workspace on public.profiles;
create trigger on_profile_created_provision_workspace
  after insert on public.profiles
  for each row execute function public.handle_new_user_workspace();

drop policy if exists workspace_create_own on public.workspaces;
create policy workspace_create_own
  on public.workspaces
  for insert
  with check (true);

drop policy if exists membership_self_read on public.workspace_memberships;
create policy membership_self_read
  on public.workspace_memberships
  for select
  using (user_id = auth.uid()::text);