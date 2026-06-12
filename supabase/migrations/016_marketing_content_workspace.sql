-- Phase 8A: simple content posting and channel performance workspace.
-- Safe to run more than once. Run after migration 015.

alter table public.content
  add column if not exists updated_at timestamptz not null default now();

create index if not exists content_posted_at_idx
  on public.content (posted_at desc);

create index if not exists content_channels_channel_idx
  on public.content_channels (channel);

-- Marketing strategy and performance are admin-managed.
drop policy if exists "authenticated insert content" on public.content;
drop policy if exists "authenticated update content" on public.content;
drop policy if exists "admin insert content" on public.content;
drop policy if exists "admin update content" on public.content;

create policy "admin insert content"
  on public.content for insert to authenticated
  with check (public.is_admin());

create policy "admin update content"
  on public.content for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "authenticated insert content_channels" on public.content_channels;
drop policy if exists "authenticated update content_channels" on public.content_channels;
drop policy if exists "admin insert content_channels" on public.content_channels;
drop policy if exists "admin update content_channels" on public.content_channels;

create policy "admin insert content_channels"
  on public.content_channels for insert to authenticated
  with check (public.is_admin());

create policy "admin update content_channels"
  on public.content_channels for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

do $migration$
begin
  if to_regprocedure('public.record_audit_log()') is not null then
    drop trigger if exists audit_changes on public.content;
    create trigger audit_changes
      after insert or update or delete on public.content
      for each row execute function public.record_audit_log();

    drop trigger if exists audit_changes on public.content_channels;
    create trigger audit_changes
      after insert or update or delete on public.content_channels
      for each row execute function public.record_audit_log();
  end if;
end
$migration$;
