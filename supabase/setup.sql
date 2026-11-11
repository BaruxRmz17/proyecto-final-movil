-- Esquema inicial de Campus Mind para un proyecto Supabase nuevo.
-- Seguro para volver a ejecutar: no borra tablas ni registros.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre_completo text,
  universidad text,
  carrera text,
  semestre integer,
  avatar_color text not null default '#7957DC'
    check (avatar_color in ('#7957DC', '#2563EB', '#0F766E', '#DB7C26', '#D9468B')),
  avatar_emoji text
    check (avatar_emoji is null or avatar_emoji in ('🌟', '🚀', '🎨', '📚', '🎮', '🧠', '🌱', '🔥')),
  created_at timestamptz not null default now()
);

create table if not exists public.schedule_classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject text not null,
  teacher text not null default '',
  classroom text not null default '',
  start_time time not null,
  end_time time not null,
  days smallint[] not null check (cardinality(days) > 0),
  color text not null default '#7957DC',
  notes text not null default '',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time),
  check (days <@ array[0, 1, 2, 3, 4, 5, 6]::smallint[]),
  check (start_date is null or end_date is null or end_date >= start_date)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  class_id uuid not null,
  title text not null,
  description text,
  due_date date not null,
  due_time time,
  grade numeric(6, 2),
  grade_max numeric(6, 2) not null default 100,
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending'
    check (status in ('pending', 'completed')),
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_valid_grade check (
    grade is null or (grade >= 0 and grade <= grade_max and grade_max > 0)
  )
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists schedule_classes_set_updated_at on public.schedule_classes;
create trigger schedule_classes_set_updated_at
before update on public.schedule_classes
for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nombre_completo)
  values (new.id, new.raw_user_meta_data ->> 'nombre_completo')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create index if not exists schedule_classes_user_start_idx
  on public.schedule_classes (user_id, start_time);
create index if not exists tasks_user_due_idx
  on public.tasks (user_id, due_date, due_time);
create index if not exists tasks_user_archived_due_idx
  on public.tasks (user_id, archived, due_date, due_time);
create index if not exists tasks_user_graded_idx
  on public.tasks (user_id, class_id)
  where grade is not null;

alter table public.profiles enable row level security;
alter table public.schedule_classes enable row level security;
alter table public.tasks enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users can view own classes" on public.schedule_classes;
create policy "Users can view own classes" on public.schedule_classes
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can insert own classes" on public.schedule_classes;
create policy "Users can insert own classes" on public.schedule_classes
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update own classes" on public.schedule_classes;
create policy "Users can update own classes" on public.schedule_classes
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete own classes" on public.schedule_classes;
create policy "Users can delete own classes" on public.schedule_classes
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Users can view own tasks" on public.tasks;
create policy "Users can view own tasks" on public.tasks
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can insert own tasks" on public.tasks;
create policy "Users can insert own tasks" on public.tasks
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update own tasks" on public.tasks;
create policy "Users can update own tasks" on public.tasks
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users can delete own tasks" on public.tasks;
create policy "Users can delete own tasks" on public.tasks
  for delete to authenticated using ((select auth.uid()) = user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.schedule_classes to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;

notify pgrst, 'reload schema';
