create table public.student_ai_daily_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  usage_date date not null,
  request_count integer not null default 0 check (request_count >= 0)
);

alter table public.student_ai_daily_usage enable row level security;
revoke all on public.student_ai_daily_usage from anon, authenticated;
grant all on public.student_ai_daily_usage to service_role;

create or replace function public.consume_student_ai_request(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  next_count integer;
begin
  insert into public.student_ai_daily_usage (user_id, usage_date, request_count)
  values (p_user_id, (now() at time zone 'utc')::date, 1)
  on conflict (user_id)
  do update set
    usage_date = excluded.usage_date,
    request_count = case
      when public.student_ai_daily_usage.usage_date = excluded.usage_date
        then public.student_ai_daily_usage.request_count + 1
      else 1
    end
  where public.student_ai_daily_usage.usage_date <> excluded.usage_date
    or public.student_ai_daily_usage.request_count < 20
  returning request_count into next_count;

  return next_count is not null;
end;
$$;

revoke all on function public.consume_student_ai_request(uuid) from public, anon, authenticated;
grant execute on function public.consume_student_ai_request(uuid) to service_role;
