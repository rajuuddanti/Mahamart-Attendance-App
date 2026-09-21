-- Mahamart Attendance v2: shifts, geo-fencing, admin-managed breaks and punch integrity
create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  start_time time not null,
  end_time time not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(company_id,name)
);

alter table public.employees add column if not exists shift_id uuid references public.shifts(id) on delete set null;
alter table public.employees add column if not exists remote_punch_allowed boolean not null default false;
alter table public.attendance_punches add column if not exists punch_location_name text;
alter table public.attendance_punches add column if not exists punch_mode text not null default 'Kiosk';
alter table public.locations add column if not exists latitude numeric(10,7);
alter table public.locations add column if not exists longitude numeric(10,7);
alter table public.locations add column if not exists geofence_radius_m integer not null default 150;
alter table public.attendance_punches add column if not exists latitude numeric(10,7);
alter table public.attendance_punches add column if not exists longitude numeric(10,7);
alter table public.attendance_punches add column if not exists accuracy_m numeric(8,2);
alter table public.attendance_punches add column if not exists geo_verified boolean not null default false;

create table if not exists public.attendance_breaks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  remarks text,
  created_by uuid references auth.users(id) on delete set null,
  ended_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists employees_shift_idx on public.employees(shift_id);
create index if not exists breaks_employee_time_idx on public.attendance_breaks(employee_id,started_at desc);

insert into public.shifts(company_id,name,start_time,end_time)
select c.id,'9 AM - 6 PM','09:00','18:00'
from public.companies c
where c.name='Mahamart'
on conflict(company_id,name) do nothing;

insert into public.shifts(company_id,name,start_time,end_time)
select c.id,'9 AM - 6:30 PM','09:00','18:30'
from public.companies c
where c.name='Mahamart'
on conflict(company_id,name) do nothing;

update public.employees e
set shift_id=s.id
from public.shifts s
where e.shift_id is null and s.company_id=e.company_id and s.name='9 AM - 6 PM';

alter table public.shifts enable row level security;
alter table public.attendance_breaks enable row level security;

drop policy if exists "company shifts access" on public.shifts;
create policy "company shifts access" on public.shifts for all to authenticated
using(company_id=public.current_company_id())
with check(company_id=public.current_company_id());

drop policy if exists "company breaks access" on public.attendance_breaks;
create policy "company breaks access" on public.attendance_breaks for all to authenticated
using(company_id=public.current_company_id() and (public.current_location_id() is null or location_id=public.current_location_id()))
with check(company_id=public.current_company_id());

create or replace function public.validate_attendance_punch()
returns trigger language plpgsql security definer set search_path=public
as $$
declare
  last_shift_in timestamptz;
  last_shift_out timestamptz;
begin
  if NEW.action = 'Shift In' then
    select max(punched_at) into last_shift_in
    from public.attendance_punches
    where employee_id=NEW.employee_id and action='Shift In' and punched_at::date=NEW.punched_at::date;
    select max(punched_at) into last_shift_out
    from public.attendance_punches
    where employee_id=NEW.employee_id and action='Shift Out' and punched_at::date=NEW.punched_at::date;
    if last_shift_in is not null and (last_shift_out is null or last_shift_in > last_shift_out) then
      raise exception 'Employee is already checked in for this date';
    end if;
  elsif NEW.action = 'Shift Out' then
    select max(punched_at) into last_shift_in
    from public.attendance_punches
    where employee_id=NEW.employee_id and action='Shift In' and punched_at::date=NEW.punched_at::date;
    select max(punched_at) into last_shift_out
    from public.attendance_punches
    where employee_id=NEW.employee_id and action='Shift Out' and punched_at::date=NEW.punched_at::date;
    if last_shift_in is null or (last_shift_out is not null and last_shift_out >= last_shift_in) then
      raise exception 'Employee is not currently checked in';
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists validate_attendance_punch on public.attendance_punches;
create trigger validate_attendance_punch
before insert on public.attendance_punches
for each row execute function public.validate_attendance_punch();

alter publication supabase_realtime add table public.attendance_breaks;
