-- Phase 4B, step 3 of 5: safely change staff names and roles.
-- Safe to run more than once.

create or replace function public.set_staff_access(
  target_user_id uuid,
  new_full_name text,
  new_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Only administrators can change staff access';
  end if;

  if target_user_id = auth.uid() and new_role <> 'admin'::public.user_role then
    raise exception 'You cannot remove your own administrator access';
  end if;

  update public.profiles
  set
    full_name = trim(coalesce(new_full_name, '')),
    role = new_role
  where id = target_user_id;

  if not found then
    raise exception 'Staff account not found';
  end if;
end;
$$;

grant execute on function public.set_staff_access(uuid, text, public.user_role)
  to authenticated;

do $$
begin
  if to_regprocedure('public.record_audit_log()') is not null then
    drop trigger if exists audit_changes on public.profiles;
    create trigger audit_changes
      after insert or update or delete on public.profiles
      for each row execute function public.record_audit_log();
  end if;
end;
$$;

