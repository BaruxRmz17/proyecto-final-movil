alter table public.profiles
add column if not exists avatar_color text not null default '#7957DC'
check (
  avatar_color = any (
    array[
      '#7957DC',
      '#2563EB',
      '#0F766E',
      '#DB7C26',
      '#D9468B'
    ]::text[]
  )
);

alter table public.profiles
add column if not exists avatar_emoji text
check (
  avatar_emoji is null
  or avatar_emoji = any (
    array[
      '🌟',
      '🚀',
      '🎨',
      '📚',
      '🎮',
      '🧠',
      '🌱',
      '🔥'
    ]::text[]
  )
);
