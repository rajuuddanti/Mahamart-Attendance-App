# Mahamart Attendance — Development Log

## Product direction
Attendance-only product. Web admin first. Android kiosk later. No payroll.

## Architecture
Next.js, Vercel, Supabase, GitHub, Expo React Native.

## Database
Created core attendance schema and seeded Mahamart, Head Office, roles, permissions and default attendance rules. Created a development Company Admin profile.

## Build fixes
Fixed web TypeScript issues for punch source literals, employee status literals and Excel import typing. Excluded /mobile from the root web TypeScript build because Expo has its own dependency environment. Added Supabase JS dependency to the web package.

## UI
Implemented Dashboard, Employees, Locations, Attendance, Reports, Users & Roles, Rules and Settings. Added employee/location/user detail and edit interactions, employee shift assignment, daily/monthly report layouts.

## Attendance
Simplified employee punching to Shift In/Shift Out. Added admin-controlled break workflow.

## Location
Added groundwork for store geofencing, GPS punch data, remote punch authorization and actual punch location tracking.

## Current stop point
Feature development is paused for live testing and HR review.

## Next restart
1. Live web/Supabase test.
2. Android kiosk test.
3. Shift In/Out test.
4. Admin break + employee Break In test.
5. Geofence test.
6. Remote-punch test.
7. Capture HR requirements.
