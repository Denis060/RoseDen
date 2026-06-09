select 'profiles email column' as phase_4b_check,
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'email'
  ) then 'ready' else 'missing' end as status
union all
select 'staff list function',
  case when to_regprocedure('public.list_staff_members()') is not null
    then 'ready' else 'missing' end
union all
select 'staff access function',
  case when to_regprocedure(
    'public.set_staff_access(uuid,text,public.user_role)'
  ) is not null then 'ready' else 'missing' end
union all
select 'admin inventory policy',
  case when exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'inventory'
      and policyname = 'admin update inventory'
  ) then 'ready' else 'missing' end
union all
select 'admin image policy',
  case when exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'admin upload product images'
  ) then 'ready' else 'missing' end;

