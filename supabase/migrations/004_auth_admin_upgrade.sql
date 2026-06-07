-- Forward-only upgrade for projects that already ran migrations 001-003.
-- Safe to run more than once because CREATE OR REPLACE updates the function.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case
      when not exists (select 1 from public.profiles) then 'admin'::public.user_role
      else 'staff'::public.user_role
    end
  )
  on conflict (id) do update
  set full_name = excluded.full_name;

  return new;
end;
$$;

-- If the intended first admin account already exists, promote it explicitly.
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where lower(email) = lower('joinriseafrica@gmail.com')
  limit 1
);
