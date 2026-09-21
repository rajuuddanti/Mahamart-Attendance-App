# Mahamart Attendance — Database Notes

## Core tables
companies, locations, employees, roles, permissions, role_permissions, profiles, attendance_rules, attendance_punches.

## Added tables
### shifts
Reusable employee shifts: company_id, name, start_time, end_time, active.

### attendance_breaks
Admin-authorized breaks: company_id, employee_id, location_id, started_at, ended_at, remarks, created_by, ended_by.

## Employee fields
shift_id
remote_punch_allowed

## Location fields
latitude
longitude
geofence_radius_m

## Punch fields
latitude
longitude
accuracy_m
geo_verified
punch_location_name
punch_mode

## Integrity
PostgreSQL trigger prevents duplicate Shift In while a shift is open and prevents Shift Out without an open Shift In.

## RLS
RLS is enabled. Current policies provide company/location access control. Full granular role-permission enforcement at DB policy level remains a production-hardening task.

## Sensitive data
Legal employee information and biometric templates require protection. Do not expose raw biometric templates in ordinary admin UI.
