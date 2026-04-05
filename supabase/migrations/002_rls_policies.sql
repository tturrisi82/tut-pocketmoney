-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.chores enable row level security;
alter table public.chore_instances enable row level security;
alter table public.notification_log enable row level security;

-- ============================================================
-- profiles policies
-- ============================================================
create policy "profiles_select_all"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- chores policies
-- ============================================================
create policy "chores_select_authenticated"
  on public.chores for select
  using (auth.role() = 'authenticated');

create policy "chores_insert_parent"
  on public.chores for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

create policy "chores_update_parent"
  on public.chores for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

create policy "chores_delete_parent"
  on public.chores for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );

-- ============================================================
-- chore_instances policies
-- ============================================================
create policy "instances_select_authenticated"
  on public.chore_instances for select
  using (auth.role() = 'authenticated');

create policy "instances_insert_authenticated"
  on public.chore_instances for insert
  with check (auth.role() = 'authenticated');

-- Child can only set status to 'pending_approval'
create policy "instances_update_child"
  on public.chore_instances for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'child'
    )
  )
  with check (status = 'pending_approval');

-- Parent can set status to 'approved' or 'rejected'
create policy "instances_update_parent"
  on public.chore_instances for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  )
  with check (status in ('approved', 'rejected'));

-- ============================================================
-- notification_log policies
-- ============================================================
create policy "notif_select_parent"
  on public.notification_log for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'parent'
    )
  );
-- Insert/update is handled by Edge Function using service role key (bypasses RLS)
