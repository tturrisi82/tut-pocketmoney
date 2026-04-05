-- Single-row settings table (enforced by check constraint on id = 1)
create table public.app_settings (
  id             integer primary key default 1 check (id = 1),
  weekly_target  numeric(10,2) not null default 10.00,
  updated_at     timestamptz default now()
);

-- Seed the default row
insert into public.app_settings (id, weekly_target) values (1, 10.00);

-- RLS
alter table public.app_settings enable row level security;

-- Everyone authenticated can read
create policy "settings_select"
  on public.app_settings for select
  using (auth.role() = 'authenticated');

-- Only parent can update
create policy "settings_update"
  on public.app_settings for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- updated_at trigger
create trigger app_settings_updated_at
  before update on public.app_settings
  for each row
  execute function public.set_updated_at();
