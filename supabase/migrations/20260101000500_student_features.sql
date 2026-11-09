alter table public.articles
  add column if not exists status text not null default 'published',
  add column if not exists difficulty text not null default 'all-levels';

alter table public.articles
  drop constraint if exists articles_status_check,
  add constraint articles_status_check
    check (status in ('draft', 'published', 'archived'));

alter table public.articles
  drop constraint if exists articles_difficulty_check,
  add constraint articles_difficulty_check
    check (difficulty in ('all-levels', 'beginner', 'intermediate', 'advanced'));

drop policy if exists "Public read articles" on public.articles;
drop policy if exists "Public read published articles" on public.articles;
create policy "Public read published articles"
  on public.articles for select
  to anon, authenticated
  using (status = 'published');

create table if not exists public.student_study_plans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.student_study_plans enable row level security;
revoke all on public.student_study_plans from anon, public;
grant select, insert, update, delete on public.student_study_plans to authenticated;

drop policy if exists "Students manage their own study plan" on public.student_study_plans;
create policy "Students manage their own study plan"
  on public.student_study_plans for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.study_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  email text not null,
  reminder_at timestamptz not null,
  sent_at timestamptz,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, title, reminder_at)
);

create index if not exists study_reminders_due_idx
  on public.study_reminders (reminder_at)
  where sent_at is null;

alter table public.study_reminders enable row level security;
revoke all on public.study_reminders from anon, public;
grant select, insert, delete on public.study_reminders to authenticated;

drop policy if exists "Students read their own reminders" on public.study_reminders;
create policy "Students read their own reminders"
  on public.study_reminders for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Students create their own reminders" on public.study_reminders;
create policy "Students create their own reminders"
  on public.study_reminders for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and lower(email) = lower(auth.jwt() ->> 'email')
    and reminder_at > now()
    and reminder_at <= now() + interval '1 year'
  );

drop policy if exists "Students cancel their own reminders" on public.study_reminders;
create policy "Students cancel their own reminders"
  on public.study_reminders for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.claim_due_study_reminders(p_limit integer default 100)
returns table (id uuid, title text, email text, reminder_at timestamptz)
language sql
security definer
set search_path = public
as $$
  with claimable as (
    select reminder.id
    from public.study_reminders as reminder
    where reminder.sent_at is null
      and reminder.reminder_at <= now()
      and (reminder.claimed_at is null or reminder.claimed_at < now() - interval '15 minutes')
    order by reminder.reminder_at asc
    for update skip locked
    limit greatest(1, least(coalesce(p_limit, 100), 100))
  ),
  claimed as (
    update public.study_reminders as reminder
    set claimed_at = now()
    from claimable
    where reminder.id = claimable.id
    returning reminder.id, reminder.title, reminder.email, reminder.reminder_at
  )
  select claimed.id, claimed.title, claimed.email, claimed.reminder_at
  from claimed;
$$;

revoke all on function public.claim_due_study_reminders(integer) from public, anon, authenticated;
grant execute on function public.claim_due_study_reminders(integer) to service_role;
