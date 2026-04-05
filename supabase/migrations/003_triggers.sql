-- ============================================================
-- Trigger: auto-create profile row when a new user signs up
-- Reads role and display_name from raw_user_meta_data
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'role',
    coalesce(new.raw_user_meta_data ->> 'display_name', new.email),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================
-- Trigger: update chores.updated_at on row update
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger chores_updated_at
  before update on public.chores
  for each row
  execute function public.set_updated_at();
