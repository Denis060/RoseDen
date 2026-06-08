-- RoseDen OS Phase 2: buying trips, linked expenses, and landed-cost reporting.
-- Run after migration 007. Safe to run more than once.

alter table public.expenses
  add column if not exists batch_id uuid references public.post_batches(id) on delete set null;

alter table public.post_batches
  add column if not exists status text not null default 'open',
  add column if not exists allocation_method text not null default 'per-unit';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'post_batches_status_check') then
    alter table public.post_batches add constraint post_batches_status_check
      check (status in ('planned', 'open', 'completed', 'cancelled'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'post_batches_allocation_method_check') then
    alter table public.post_batches add constraint post_batches_allocation_method_check
      check (allocation_method in ('per-unit', 'by-cost'));
  end if;
end $$;

create index if not exists expenses_batch_idx
on public.expenses(batch_id, expense_date desc);
