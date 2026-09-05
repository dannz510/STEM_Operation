-- Optional Firebase identity bridge for profiles created through Supabase Auth.
-- Firebase ID tokens are still verified server-side; this column is only a mapping.
alter table public.profiles add column if not exists firebase_uid text unique;
create index if not exists profiles_firebase_uid_idx on public.profiles(firebase_uid);
