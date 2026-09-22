# Mahamart Attendance — Project Brain

## Goal
Build a SalaryBox-style attendance system for Mahamart, focused on attendance only. No payroll/salary calculation.

## Architecture
- Web Admin: Next.js + TypeScript
- Web hosting: Vercel
- Source: GitHub
- Backend: Supabase PostgreSQL, Auth, RLS, Realtime
- Android: Expo React Native shared kiosk
- Android code: /mobile
- Supabase SQL: /supabase

Data flow: Android Kiosk / approved remote punch -> Supabase -> attendance -> Realtime -> Web Admin.

## Attendance workflow
Normal employee flow is intentionally simple:
1. Shift In
2. Shift Out

Once Shift In is done, only Shift Out is offered. Once Shift Out is done, Shift In becomes available again. Duplicate Shift In and invalid Shift Out are blocked in both UI and database.

## Break workflow
Employees do not get normal Break Out/Break In buttons.
Admin opens Attendance -> employee -> detail popup -> Create Break -> remarks -> Start Break.
The authorized break is stored in the backend. Mobile can show Break In while that break is open.

## Employee shifts
Every employee gets a default shift during creation. Current examples:
- 09:00-18:00
- 09:00-18:30

## Locations
Employees have a designated/assigned location. Locations should be clickable and show relevant data.
Location data includes name, address, latitude, longitude and geofence radius.

## Punch location
Designated location and actual punch location are separate.

Kiosk employees:
- Kiosk is locked to its assigned store.
- GPS/geofence verification is used.
- Punch outside the allowed radius is rejected.

Remote-punch employees:
- Explicitly authorized per employee.
- GPS captured at punch time.
- If inside a registered store geofence, record that store as actual punch location.
- Otherwise record Remote plus GPS/accuracy.
- Do not overwrite the employee's designated location.

## Roles
- Super Admin
- Company Admin
- HR
- Store Manager
- Supervisor
- Employee

Permissions cover employees, attendance, reports/export, locations, users and rules. Store-scoped users should only access assigned locations.

## Reports
Daily:
Employee ID | Name | Designation | Designated Location | Role | First In | Last Out

Monthly cycle is 21st through 20th:
Employee ID | Name | Role | Total Present Days | Present | Half | Absent | daily columns
Daily codes: P, H, A.
Total Present Days = Present + Half Day.
No week-offs currently.

## Attendance rules
Default:
- Shift 09:00-18:00
- Grace 15 minutes
- Under 5 worked hours = Absent
- Under 8 worked hours = Half Day
- 8+ = Present
- Require Shift Out
- Allow early Shift In
No week-off logic.

## Face recognition
This is now the next active feature after the live-test baseline.
The Android kiosk must eventually:
1. Open the front camera.
2. Detect a face.
3. Perform liveness/anti-spoofing.
4. Generate a face embedding from the live face.
5. Match it against enrolled employee face templates.
6. Identify the employee automatically; no employee selector in the final kiosk flow.
7. Apply the existing Shift In/Shift Out rules.
8. Apply GPS/geofence and actual punch-location rules.
9. Write the verified attendance punch to Supabase.

Prefer on-device processing where practical. Face templates/embeddings are sensitive biometric data and require secure storage, access control, and production hardening. Expo device LocalAuthentication is not the employee-recognition solution; it authenticates the device owner's biometric and cannot identify one of our employees.

Current Android app is still a manual employee-selector prototype. The next implementation step is to choose and integrate a compatible camera + face detection/embedding + liveness stack, likely requiring an Expo development build/native modules. Do not fake face recognition with a camera preview or device biometric prompt.

## Database
Core tables:
companies, locations, employees, roles, permissions, role_permissions, profiles, attendance_rules, attendance_punches.

Added:
shifts, attendance_breaks.

Employee additions:
shift_id, remote_punch_allowed.

Location additions:
latitude, longitude, geofence_radius_m.

Punch additions:
latitude, longitude, accuracy_m, geo_verified, punch_location_name, punch_mode.

A PostgreSQL trigger prevents duplicate Shift In while an open shift exists and prevents Shift Out without an open Shift In.

## Security
Use Supabase publishable keys in browser/mobile. Never expose service-role/secret keys. RLS is enabled. Full granular role-permission DB enforcement is still a production-hardening task. Biometric data requires additional protection.

## Current UI
Sections:
Dashboard, Employees, Locations, Attendance, Reports, Users & Roles, Rules, Settings.

Employee rows, location cards and users are clickable. Employee creation includes shift assignment. Attendance shows only the appropriate Shift In/Shift Out action. Admin break creation is available in employee detail.

## Excel
Employee import supports employee ID, name, location, phone, email, DOB, gender, address, emergency contact/phone, joining date, designation, department, PAN, Aadhaar, bank account and IFSC.

## Current live-test baseline
- Supabase authentication
- Employees
- Shift In/Out
- Duplicate-punch protection
- Admin-authorized breaks
- Break In
- Realtime attendance groundwork
- Location/geofence groundwork
- Remote-punch groundwork
- Android kiosk app connected to Supabase
- Android GPS punch fields connected to the database

The temporary Android employee selector is only for testing. Final kiosk punching must use face recognition.

## Known current Android issue
mobile/App.tsx previously had an accidental setPunchPlace(geo.name) reference inside signIn() even though geo is not defined there. Verify/fix this before relying on kiosk sign-in.

## Deliberately deferred
Payroll, production biometric hardening, advanced HR workflows, final DB-level granular permissions, production kiosk lockdown, final geofence configuration for every store, advanced reporting/export and other HR-requested features.

## Current stop point
The project is paused between the initial live test and the next face-recognition implementation. The last user-visible state was the Android kiosk running with a manual employee selector. User wants to continue with real facial recognition next.

## Cross-account handoff rule
When the user says “bye” at the end of a work session, before ending the session update:
- docs/PROJECT_BRAIN.md
- docs/DATABASE.md
- docs/BUSINESS_RULES.md
- docs/ARCHITECTURE.md
- docs/DEVELOPMENT_LOG.md

The updates should capture the latest completed work, database changes, decisions, bugs, current stop point, and exact next step. Commit the documentation to GitHub so another ChatGPT account can resume from the repository without relying on chat history.

## Project rule
GitHub contains the implementation. These documents preserve the important product decisions, business rules, architecture, database state, development history and current handoff so the project can be resumed in another ChatGPT conversation/account.
