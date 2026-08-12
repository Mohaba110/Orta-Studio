create extension if not exists pgcrypto;

create table if not exists public.project_counters (
  year_key text primary key,
  last_value integer not null default 0 check (last_value between 0 and 9999)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  project_code text unique,
  client_name text not null,
  company text,
  email text not null,
  whatsapp text,
  country text not null,
  preferred_language text not null check (preferred_language in ('English', 'Türkçe')),
  service text not null,
  industry text not null,
  product_name text not null,
  description text not null,
  preferred_delivery text not null check (preferred_delivery in ('Standard', 'Priority', 'Flexible')),
  status text not null default 'Request Received' check (status in ('Request Received', 'Under Review', 'In Design', 'Waiting for Client', 'Completed')),
  access_token_hash text not null unique check (char_length(access_token_hash) = 64),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

create or replace function public.assign_project_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  yy text := to_char(coalesce(new.created_at, now()), 'YY');
  n integer;
begin
  if new.project_code is not null then
    return new;
  end if;
  insert into public.project_counters(year_key, last_value)
  values (yy, 1)
  on conflict (year_key) do update set last_value = public.project_counters.last_value + 1
  returning last_value into n;
  if n > 9999 then
    raise exception 'Annual ORTA project counter exhausted for year %', yy;
  end if;
  new.project_code := 'ORTA-' || yy || lpad(n::text, 4, '0');
  return new;
end;
$$;

drop trigger if exists projects_assign_code on public.projects;
create trigger projects_assign_code before insert on public.projects for each row execute function public.assign_project_code();

create table if not exists public.project_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  sender_type text not null check (sender_type in ('client', 'admin')),
  sender_name text,
  message text not null check (char_length(message) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null unique,
  original_name text not null,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  uploaded_by text not null check (uploaded_by in ('client', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.revision_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  request_text text not null check (char_length(request_text) between 1 and 6000),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.final_approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  approved_at timestamptz not null default now()
);

create table if not exists public.project_access_tokens (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  token_hash text not null unique check (char_length(token_hash) = 64),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  channel text not null check (channel in ('email')),
  recipient text not null,
  template text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create or replace function public.touch_project_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.projects set last_activity_at = now(), updated_at = now() where id = coalesce(new.project_id, old.project_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists messages_touch_project on public.project_messages;
create trigger messages_touch_project after insert or update or delete on public.project_messages for each row execute function public.touch_project_activity();
drop trigger if exists files_touch_project on public.project_files;
create trigger files_touch_project after insert or update or delete on public.project_files for each row execute function public.touch_project_activity();
drop trigger if exists revisions_touch_project on public.revision_requests;
create trigger revisions_touch_project after insert or update or delete on public.revision_requests for each row execute function public.touch_project_activity();

alter table public.projects enable row level security;
alter table public.project_counters enable row level security;
alter table public.project_messages enable row level security;
alter table public.project_files enable row level security;
alter table public.revision_requests enable row level security;
alter table public.final_approvals enable row level security;
alter table public.project_access_tokens enable row level security;
alter table public.admin_users enable row level security;
alter table public.notification_outbox enable row level security;

revoke all on public.project_access_tokens from anon, authenticated;
revoke all on public.notification_outbox from anon, authenticated;

drop policy if exists "admin can read own admin row" on public.admin_users;
create policy "admin can read own admin row" on public.admin_users for select to authenticated using (user_id = auth.uid());

drop policy if exists "admins manage projects" on public.projects;
create policy "admins manage projects" on public.projects for all to authenticated using (exists (select 1 from public.admin_users a where a.user_id = auth.uid())) with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "admins manage messages" on public.project_messages;
create policy "admins manage messages" on public.project_messages for all to authenticated using (exists (select 1 from public.admin_users a where a.user_id = auth.uid())) with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "admins manage files" on public.project_files;
create policy "admins manage files" on public.project_files for all to authenticated using (exists (select 1 from public.admin_users a where a.user_id = auth.uid())) with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "admins manage revisions" on public.revision_requests;
create policy "admins manage revisions" on public.revision_requests for all to authenticated using (exists (select 1 from public.admin_users a where a.user_id = auth.uid())) with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
drop policy if exists "admins read approvals" on public.final_approvals;
create policy "admins read approvals" on public.final_approvals for select to authenticated using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

insert into storage.buckets (id, name, public) values ('project-files', 'project-files', false) on conflict (id) do update set public = false;
drop policy if exists "admins manage project storage" on storage.objects;
create policy "admins manage project storage" on storage.objects for all to authenticated using (bucket_id = 'project-files' and exists (select 1 from public.admin_users a where a.user_id = auth.uid())) with check (bucket_id = 'project-files' and exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create index if not exists projects_status_idx on public.projects(status);
create index if not exists projects_last_activity_idx on public.projects(last_activity_at desc);
create index if not exists project_messages_project_idx on public.project_messages(project_id, created_at);
create index if not exists project_files_project_idx on public.project_files(project_id, created_at);
create index if not exists revision_requests_project_idx on public.revision_requests(project_id, status);
create index if not exists project_access_tokens_project_idx on public.project_access_tokens(project_id, expires_at desc);
