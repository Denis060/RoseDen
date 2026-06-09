-- Phase 4B, step 2 of 5: admin staff directory.
-- Safe to run more than once.

create or replace function public.list_staff_members()
returns table (
  id uuid,
  full_name text,
  email text,
  role public.user_role,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only administrators can view staff accounts';
  end if;

  return query
  select profile.id, profile.full_name, profile.email, profile.role, profile.created_at
  from public.profiles profile
  order by
    case when profile.role = 'admin' then 0 else 1 end,
    profile.created_at;
end;
$$;

grant execute on function public.list_staff_members() to authenticated;

