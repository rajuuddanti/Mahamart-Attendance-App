create extension if not exists pgcrypto;

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  address text,
  timezone text not null default 'Asia/Kolkata',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(company_id,name)
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_code text not null,
  full_name text not null,
  location_id uuid references public.locations(id) on delete set null,
  phone text,
  email text,
  dob date,
  gender text,
  address text,
  emergency_contact text,
  emergency_phone text,
  joining_date date,
  designation text,
  department text,
  pan text,
  aadhaar text,
  bank_account text,
  ifsc text,
  face_template jsonb,
  face_enrolled_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(company_id,employee_code)
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key(role_id,permission_id)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  full_name text,
  role_id uuid references public.roles(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  shift_start time not null default '09:00',
  shift_end time not null default '18:00',
  grace_minutes integer not null default 15 check(grace_minutes >= 0),
  absent_after time not null default '12:00',
  absent_hours numeric(5,2) not null default 5,
  half_day_hours numeric(5,2) not null default 8,
  working_hours_enabled boolean not null default true,
  multiple_breaks boolean not null default true,
  require_shift_out boolean not null default true,
  allow_early_in boolean not null default true,
  created_at timestamptz not null default now(),
  unique(company_id,location_id)
);

create table if not exists public.attendance_punches (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  action text not null check(action in ('Shift In','Shift Out','Break Out','Break In')),
  punched_at timestamptz not null default now(),
  source text not null default 'Web Admin' check(source in ('Web Admin','Kiosk')),
  face_verified boolean not null default false,
  face_confidence numeric(5,2),
  face_capture_path text,
  created_by uuid references auth.users(id) on delete set null,
  notes text
);

create index if not exists employees_company_location_idx on public.employees(company_id,location_id);
create index if not exists punches_company_employee_time_idx on public.attendance_punches(company_id,employee_id,punched_at desc);
create index if not exists punches_company_time_idx on public.attendance_punches(company_id,punched_at desc);

insert into public.roles(name,description) values
('Super Admin','Full system access'),
('Company Admin','Company-wide administration'),
('HR','Employee and attendance administration'),
('Store Manager','Assigned location management'),
('Supervisor','Attendance supervision'),
('Employee','Employee self-service')
on conflict(name) do nothing;

insert into public.permissions(code,description) values
('employees.view','View employees'),
('employees.manage','Create and edit employees'),
('attendance.view','View attendance'),
('attendance.manage','Manually edit attendance'),
('reports.view','View reports'),
('reports.export','Export reports'),
('locations.manage','Manage locations'),
('users.manage','Manage users and roles'),
('rules.manage','Manage attendance rules')
on conflict(code) do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p
where r.name='Super Admin'
on conflict do nothing;

insert into public.companies(name)
select 'Mahamart' where not exists(select 1 from public.companies);

insert into public.locations(company_id,name,address)
select c.id,'Head Office','Hyderabad'
from public.companies c
where c.name='Mahamart'
and not exists(select 1 from public.locations l where l.company_id=c.id and l.name='Head Office');

insert into public.attendance_rules(company_id,location_id)
select c.id,l.id from public.companies c join public.locations l on l.company_id=c.id and l.name='Head Office'
where not exists(select 1 from public.attendance_rules ar where ar.company_id=c.id and ar.location_id=l.id);

alter table public.companies enable row level security;
alter table public.locations enable row level security;
alter table public.employees enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.attendance_rules enable row level security;
alter table public.attendance_punches enable row level security;

create or replace function public.current_company_id()
returns uuid language sql stable security definer set search_path=public
as $$ select company_id from public.profiles where id=auth.uid() and active=true limit 1 $$;

create or replace function public.current_location_id()
returns uuid language sql stable security definer set search_path=public
as $$ select location_id from public.profiles where id=auth.uid() and active=true limit 1 $$;

drop policy if exists "company members read company" on public.companies;
create policy "company members read company" on public.companies for select to authenticated using(id=public.current_company_id());

drop policy if exists "company locations access" on public.locations;
create policy "company locations access" on public.locations for all to authenticated
using(company_id=public.current_company_id() and (public.current_location_id() is null or id=public.current_location_id()))
with check(company_id=public.current_company_id());

drop policy if exists "company employees access" on public.employees;
create policy "company employees access" on public.employees for all to authenticated
using(company_id=public.current_company_id() and (public.current_location_id() is null or location_id=public.current_location_id()))
with check(company_id=public.current_company_id());

drop policy if exists "roles readable" on public.roles;
create policy "roles readable" on public.roles for select to authenticated using(true);

drop policy if exists "permissions readable" on public.permissions;
create policy "permissions readable" on public.permissions for select to authenticated using(true);

drop policy if exists "role permissions readable" on public.role_permissions;
create policy "role permissions readable" on public.role_permissions for select to authenticated using(true);

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select to authenticated using(id=auth.uid());

drop policy if exists "company rules access" on public.attendance_rules;
create policy "company rules access" on public.attendance_rules for all to authenticated
using(company_id=public.current_company_id() and (location_id is null or public.current_location_id() is null or location_id=public.current_location_id()))
with check(company_id=public.current_company_id());

drop policy if exists "company punches access" on public.attendance_punches;
create policy "company punches access" on public.attendance_punches for all to authenticated
using(company_id=public.current_company_id() and (public.current_location_id() is null or location_id=public.current_location_id()))
with check(company_id=public.current_company_id());

alter publication supabase_realtime add table public.attendance_punches;

-- After creating your first Supabase Auth user, run:
-- insert into public.profiles(id,company_id,full_name,role_id)
-- select u.id,c.id,'Raju',r.id
-- from auth.users u cross join public.companies c join public.roles r on r.name='Company Admin'
-- where u.email='YOUR_ADMIN_EMAIL';
