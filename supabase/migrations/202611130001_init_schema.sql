create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default uuid_generate_v4(),
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  is_personal boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner','admin','member')),
  status text not null default 'active' check (status in ('active','invited','archived')),
  created_at timestamptz not null default now(),
  unique(workspace_id, user_id)
);

create table if not exists public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade unique,
  daily_productive_target_minutes integer not null default 480,
  preferred_work_days text[] not null default '{}',
  default_task_category_id uuid,
  default_project_id uuid,
  time_zone text not null default 'Asia/Kolkata',
  time_format text not null default '24h' check (time_format in ('12h','24h')),
  date_format text not null default 'YYYY-MM-DD',
  theme text not null default 'system' check (theme in ('light','dark','system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  color text,
  status text not null default 'active' check (status in ('active','archived')),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_categories (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  color text,
  description text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  category_id uuid references public.task_categories(id) on delete set null,
  title text not null,
  description text,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  status text not null default 'not_started' check (status in ('not_started','in_progress','paused','completed','cancelled')),
  estimated_duration_minutes integer,
  actual_duration_minutes integer,
  start_date date,
  due_date date,
  completed_at timestamptz,
  tags text[] not null default '{}',
  notes text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  assignee_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_templates (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  task_title text not null,
  description text,
  project_id uuid references public.projects(id) on delete set null,
  category_id uuid references public.task_categories(id) on delete set null,
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  estimated_duration_minutes integer,
  tags text[] not null default '{}',
  notes text,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timer_sessions (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  session_type text not null check (session_type in ('task','break','lunch','other')),
  status text not null check (status in ('running','paused','completed','cancelled')),
  started_at timestamptz not null,
  ended_at timestamptz,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timer_segments (
  id uuid primary key default uuid_generate_v4(),
  timer_session_id uuid not null references public.timer_sessions(id) on delete cascade,
  segment_start timestamptz not null,
  segment_end timestamptz,
  status text not null default 'active' check (status in ('active','paused','completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timer_events (
  id uuid primary key default uuid_generate_v4(),
  timer_session_id uuid not null references public.timer_sessions(id) on delete cascade,
  event_type text not null check (event_type in ('started','paused','resumed','completed','cancelled','adjusted')),
  event_timestamp timestamptz not null default now(),
  metadata jsonb not null default '{}',
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.manual_time_adjustments (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  timer_session_id uuid references public.timer_sessions(id) on delete set null,
  adjustment_type text not null check (adjustment_type in ('manual_add','manual_subtract','correction','reclassification')),
  minutes_delta integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.daily_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  note_date date not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  workspace_id uuid references public.workspaces(id) on delete set null,
  user_id uuid references public.profiles(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_email on public.profiles(email);
create index if not exists idx_workspaces_owner on public.workspaces(owner_user_id);
create index if not exists idx_workspace_members_workspace on public.workspace_members(workspace_id);
create index if not exists idx_workspace_members_user on public.workspace_members(user_id);
create index if not exists idx_projects_workspace on public.projects(workspace_id);
create index if not exists idx_tasks_workspace_status on public.tasks(workspace_id, status);
create index if not exists idx_tasks_due_date on public.tasks(workspace_id, due_date);
create index if not exists idx_task_templates_workspace on public.task_templates(workspace_id);
create index if not exists idx_timer_sessions_user_status on public.timer_sessions(user_id, status, started_at);
create index if not exists idx_timer_sessions_workspace_type on public.timer_sessions(workspace_id, session_type, started_at);
create index if not exists idx_timer_segments_session on public.timer_segments(timer_session_id, segment_start, segment_end);
create index if not exists idx_timer_events_session on public.timer_events(timer_session_id, event_timestamp);
create index if not exists idx_audit_logs_workspace on public.audit_logs(workspace_id, created_at);
create index if not exists idx_manual_adjustments_user on public.manual_time_adjustments(user_id, created_at);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.handle_updated_at();

create trigger set_workspaces_updated_at
before update on public.workspaces
for each row execute procedure public.handle_updated_at();

create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row execute procedure public.handle_updated_at();

create trigger set_projects_updated_at
before update on public.projects
for each row execute procedure public.handle_updated_at();

create trigger set_task_categories_updated_at
before update on public.task_categories
for each row execute procedure public.handle_updated_at();

create trigger set_tasks_updated_at
before update on public.tasks
for each row execute procedure public.handle_updated_at();

create trigger set_task_templates_updated_at
before update on public.task_templates
for each row execute procedure public.handle_updated_at();

create trigger set_timer_sessions_updated_at
before update on public.timer_sessions
for each row execute procedure public.handle_updated_at();

create trigger set_timer_segments_updated_at
before update on public.timer_segments
for each row execute procedure public.handle_updated_at();

create trigger set_daily_notes_updated_at
before update on public.daily_notes
for each row execute procedure public.handle_updated_at();

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.user_preferences enable row level security;
alter table public.projects enable row level security;
alter table public.task_categories enable row level security;
alter table public.tasks enable row level security;
alter table public.task_templates enable row level security;
alter table public.timer_sessions enable row level security;
alter table public.timer_segments enable row level security;
alter table public.timer_events enable row level security;
alter table public.manual_time_adjustments enable row level security;
alter table public.daily_notes enable row level security;
alter table public.audit_logs enable row level security;

create policy "Profiles are viewable by owner"
on public.profiles
for select using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert with check (auth.uid() = id);

create policy "Workspace owners and members can view workspaces"
on public.workspaces
for select using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.workspaces.id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

create policy "Workspace owner can update workspace"
on public.workspaces
for update using (
  owner_user_id = auth.uid()
);

create policy "Users can view their workspace memberships"
on public.workspace_members
for select using (user_id = auth.uid());

create policy "Workspace owners can insert workspace members"
on public.workspace_members
for insert with check (
  user_id = auth.uid() or exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_user_id = auth.uid()
  )
);

create policy "Workspace owners can update members"
on public.workspace_members
for update using (
  exists (
    select 1 from public.workspaces w
    where w.id = workspace_id and w.owner_user_id = auth.uid()
  )
);

create policy "Users can view their preferences"
on public.user_preferences
for select using (user_id = auth.uid());

create policy "Users can update own preferences"
on public.user_preferences
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can insert own preferences"
on public.user_preferences
for insert with check (user_id = auth.uid());

create policy "Workspace members can view projects"
on public.projects
for select using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.projects.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

create policy "Workspace members can insert projects"
on public.projects
for insert with check (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.projects.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

create policy "Workspace members can update projects"
on public.projects
for update using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.projects.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
) with check (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.projects.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

create policy "Workspace members can view task categories"
on public.task_categories
for select using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.task_categories.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

create policy "Workspace members can manage task categories"
on public.task_categories
for all using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.task_categories.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
) with check (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.task_categories.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

create policy "Workspace members can view tasks"
on public.tasks
for select using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.tasks.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

create policy "Workspace members can manage tasks"
on public.tasks
for all using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.tasks.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
) with check (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.tasks.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

create policy "Workspace members can view templates"
on public.task_templates
for select using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.task_templates.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

create policy "Workspace members can manage templates"
on public.task_templates
for all using (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.task_templates.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
) with check (
  exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = public.task_templates.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

create policy "Users can view own timer sessions"
on public.timer_sessions
for select using (user_id = auth.uid());

create policy "Users can manage own timer sessions"
on public.timer_sessions
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can view own timer segments"
on public.timer_segments
for select using (
  exists (
    select 1 from public.timer_sessions ts
    where ts.id = timer_session_id and ts.user_id = auth.uid()
  )
);

create policy "Users can manage own timer segments"
on public.timer_segments
for all using (
  exists (
    select 1 from public.timer_sessions ts
    where ts.id = timer_session_id and ts.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.timer_sessions ts
    where ts.id = timer_session_id and ts.user_id = auth.uid()
  )
);

create policy "Users can view own timer events"
on public.timer_events
for select using (
  exists (
    select 1 from public.timer_sessions ts
    where ts.id = timer_session_id and ts.user_id = auth.uid()
  )
);

create policy "Users can manage own timer events"
on public.timer_events
for all using (
  exists (
    select 1 from public.timer_sessions ts
    where ts.id = timer_session_id and ts.user_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.timer_sessions ts
    where ts.id = timer_session_id and ts.user_id = auth.uid()
  )
);

create policy "Users can view own manual adjustments"
on public.manual_time_adjustments
for select using (user_id = auth.uid());

create policy "Users can manage own manual adjustments"
on public.manual_time_adjustments
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can manage own notes"
on public.daily_notes
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Users can view own audit logs"
on public.audit_logs
for select using (user_id = auth.uid() or workspace_id in (
  select workspace_id from public.workspace_members where user_id = auth.uid()
));
