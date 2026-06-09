-- Phase 4B, step 1 of 5: profile email and profile security.
-- Safe to run more than once.

alter table public.profiles
  add column if not exists email text not null default '';

update public.profiles profile
set email = coalesce(auth_user.email, '')
from auth.users auth_user
where auth_user.id = profile.id
  and profile.email is distinct from coalesce(auth_user.email, '');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    case
      when not exists (select 1 from public.profiles) then 'admin'::public.user_role
      else 'staff'::public.user_role
    end
  )
  on conflict (id) do update
  set
    full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name),
    email = excluded.email;

  return new;
end;
$$;

drop policy if exists "authenticated read profiles" on public.profiles;
drop policy if exists "users read own profile" on public.profiles;
drop policy if exists "admins read all profiles" on public.profiles;

create policy "users read own profile"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "admins read all profiles"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "users update own profile" on public.profiles;
revoke update on public.profiles from authenticated;

