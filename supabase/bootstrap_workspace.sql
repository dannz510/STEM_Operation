-- Run this in Supabase SQL Editor after creating and confirming the first Auth user.
-- Replace only the three values below before running.
do $$
declare
  owner_email text := 'YOUR_ADMIN_EMAIL';
  workspace_name text := 'Chau Thanh STEM Lab';
  workspace_slug text := 'chau-thanh-stem';
  owner_id uuid;
  workspace_id uuid;
begin
  select id into owner_id from public.profiles where email = lower(owner_email);
  if owner_id is null then
    raise exception 'Create and confirm the Auth user first: %', owner_email;
  end if;

  update public.profiles
  set status = 'ACTIVE', updated_at = now()
  where id = owner_id;

  insert into public.workspaces (name, slug)
  values (workspace_name, workspace_slug)
  on conflict (slug) do update set name = excluded.name, updated_at = now()
  returning id into workspace_id;

  insert into public.workspace_memberships (workspace_id, user_id, role, active)
  values (workspace_id, owner_id, 'ADMIN', true)
  on conflict (workspace_id, user_id) do update
    set role = 'ADMIN', active = true;
end $$;
