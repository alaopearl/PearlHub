create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "Admins can read their own admin record" on public.admin_users;
create policy "Admins can read their own admin record"
  on public.admin_users for select
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to authenticated;

drop policy if exists "Admins manage authors" on public.authors;
create policy "Admins manage authors" on public.authors
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage articles" on public.articles;
create policy "Admins manage articles" on public.articles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins manage tools" on public.tools;
create policy "Admins manage tools" on public.tools
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins read subscribers" on public.newsletter_subscribers;
create policy "Admins read subscribers" on public.newsletter_subscribers
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins read messages" on public.contact_messages;
create policy "Admins read messages" on public.contact_messages
  for select to authenticated using (public.is_admin());
