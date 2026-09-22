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

## Android live test
Connected the Expo React Native kiosk to the same Supabase project.
Current test kiosk:
- Manager login
- Employee selector (temporary)
- Shift In/Shift Out
- Authorized Break In
- GPS/geofence groundwork
- Remote punch fields

During testing, Supabase schema-cache errors for remote punch/location fields were resolved by applying the required columns directly to the database.

## Face recognition next
The user identified that the selector is not the intended product flow. The next implementation must replace the employee selector with actual front-camera employee face recognition, including liveness/anti-spoofing, embedding/matching, and integration with the existing attendance + GPS/geofence logic.

Do not treat a camera preview or device biometric prompt as employee face recognition.

## Known issue to verify
mobile/App.tsx has an accidental setPunchPlace(geo.name) reference inside signIn() where geo is not defined. Fix/verify this before the next kiosk test.

## Current stop point
Feature development is paused until the next session. Resume with face-recognition stack selection and implementation, then test on the Android kiosk.

## Next restart
1. Inspect/fix the current mobile sign-in bug.
2. Confirm current Expo/React Native SDK versions.
3. Select a compatible camera + face detection/embedding + liveness stack.
4. Create the required Expo development build/native setup.
5. Replace employee selector with real face recognition.
6. Enroll test employee face templates securely.
7. Test Shift In/Out with GPS/geofence and Supabase.
8. Review biometric security before production rollout.

## Session handoff protocol
Whenever the user says “bye”, update:
- docs/PROJECT_BRAIN.md
- docs/DATABASE.md
- docs/BUSINESS_RULES.md
- docs/ARCHITECTURE.md
- docs/DEVELOPMENT_LOG.md

Record the latest completed work, database changes, decisions, bugs, current stop point and next restart steps, then commit the documentation so another ChatGPT account can resume from GitHub alone.


## Full commit/history reference
The repository history confirms the implementation sequence. Important commits:
- 62e716a — attendance action button fixes
- 844475b — interactive admin styling
- e6319a3 — attendance rules and role management
- fcad22f — role/rule styling
- 5f28e6c — Excel import
- 66d3266 — attendance rules, filters, employee records, punch history
- 69cab11 — shift timing and selected-date attendance logic
- 2d6763f — dashboard date-filter attendance counts
- 876c841 — selected-date statuses
- b9ea53f — styling for filters/employee details/import
- 4301bed — live Supabase attendance schema
- 12177d08 — Supabase-connected Android kiosk
- d12a152 — Android Expo configuration
- 654cd9d — Supabase-connected live attendance page
- 58b4eb1 — Supabase JS dependency
- 87f6af6 — exclude mobile from web TypeScript build
- ca6fcd6 — shifts/geofencing/breaks/punch integrity
- e21190d — attendance workflow/clickable management UI
- 1fd99b1 — editable users/roles
- 52423e3 — single Shift In/Out
- 7f6dbe7 — Expo location
- 31935a3 — In/Out + admin breaks + kiosk geofence
- 2d05449 — remote punch/location fields
- 8f12b8b — remote punch implementation
- 4f342e4 — employee creation to Supabase
- 5f33072 — project brain
- ae07865 — architecture doc
- 942788a — business rules doc
- 4fb4ffb — database doc
- 8eff920 — development log
