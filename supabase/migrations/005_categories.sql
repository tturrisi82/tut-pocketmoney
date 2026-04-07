-- ============================================================
-- categories: parent-defined groupings for chores
-- ============================================================
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  sort_order  integer not null default 0,
  created_by  uuid not null references public.profiles(id),
  created_at  timestamptz default now()
);

alter table public.categories enable row level security;

create policy "categories_select"
  on public.categories for select
  using (auth.role() = 'authenticated');

create policy "categories_insert"
  on public.categories for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'parent')
  );

create policy "categories_update"
  on public.categories for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'parent')
  );

create policy "categories_delete"
  on public.categories for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'parent')
  );

-- ============================================================
-- Add category_id and sort_order to chores
-- ============================================================
alter table public.chores
  add column category_id uuid references public.categories(id) on delete set null,
  add column sort_order  integer not null default 0;
