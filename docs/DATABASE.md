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

## Current database/live-test note
employees.remote_punch_allowed and the following attendance_punches GPS/location columns were manually applied to Supabase during live testing:
- latitude
- longitude
- accuracy_m
- geo_verified
- punch_location_name
- punch_mode

Face recognition will use the existing employee face-template storage (face_template / face_capture_path) as the starting point, but the final biometric schema and security policy still need review.

## Handoff rule
At the end of a session, when the user says “bye”, update this file with any database changes made during that session and commit the documentation to GitHub.


## Database history
The initial schema was expanded from basic attendance into shifts, breaks, geofencing, remote punching and biometric groundwork.

The live environment needed manual schema application because the running Supabase schema initially lagged the GitHub SQL. The user applied the missing employee remote-punch column and attendance GPS/location columns directly.

The biometric columns that exist are groundwork only. Do not assume they are ready for production face recognition.

## Important safety/context note
The user once pasted attendance SQL into the CRM Supabase project by mistake. It created unrelated bills and call_logs tables, which were removed. Future SQL must always be run against the Mahamart Attendance Supabase project.
