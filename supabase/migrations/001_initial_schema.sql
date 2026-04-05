-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- profiles: extends auth.users with app-specific role data
-- ============================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null check (role in ('parent', 'child')),
  display_name text not null,
  email        text,
  created_at   timestamptz default now()
);

-- ============================================================
-- chores: chore templates (daily or weekly)
-- ============================================================
create table public.chores (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  frequency    text not null check (frequency in ('daily', 'weekly')),
  day_of_week  smallint check (day_of_week between 0 and 6), -- 0=Sun..6=Sat, weekly only
  is_active    boolean not null default true,
  created_by   uuid not null references public.profiles(id),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ============================================================
-- chore_instances: concrete occurrence of a chore on a date
-- ============================================================
create table public.chore_instances (
  id             uuid primary key default gen_random_uuid(),
  chore_id       uuid not null references public.chores(id) on delete cascade,
  due_date       date not null,
  status         text not null default 'pending'
                   check (status in ('pending', 'pending_approval', 'approved', 'rejected')),
  completed_at   timestamptz,
  reviewed_at    timestamptz,
  reviewed_by    uuid references public.profiles(id),
  rejection_note text,
  created_at     timestamptz default now(),

  unique (chore_id, due_date)
);

-- ============================================================
-- notification_log: dedup + audit trail for notifications
-- ============================================================
create table public.notification_log (
  id                uuid primary key default gen_random_uuid(),
  chore_instance_id uuid not null references public.chore_instances(id) on delete cascade,
  notification_type text not null,
  sent_at           timestamptz default now(),
  phone_to          text not null,
  success           boolean not null default true,
  error_message     text
);
