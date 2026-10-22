alter table public.tasks
add column if not exists grade numeric(6, 2),
add column if not exists grade_max numeric(6, 2) not null default 100;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_valid_grade'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
    add constraint tasks_valid_grade
    check (
      grade is null
      or (
        grade >= 0
        and grade <= grade_max
        and grade_max > 0
      )
    );
  end if;
end $$;

create index if not exists tasks_user_graded_idx
on public.tasks (user_id, class_id)
where grade is not null;
