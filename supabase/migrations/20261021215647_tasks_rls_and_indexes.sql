alter table public.tasks enable row level security;

drop policy if exists "Users can view own tasks"
on public.tasks;

drop policy if exists "Users can insert own tasks"
on public.tasks;

drop policy if exists "Users can update own tasks"
on public.tasks;

drop policy if exists "Users can delete own tasks"
on public.tasks;

create policy "Users can view own tasks"
on public.tasks
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own tasks"
on public.tasks
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own tasks"
on public.tasks
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete own tasks"
on public.tasks
for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists tasks_user_due_idx
on public.tasks (user_id, due_date, due_time);
