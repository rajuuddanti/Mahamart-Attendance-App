# Mahamart Attendance — Implementations

## Web
- Next.js + TypeScript web admin.
- Vercel deployment.
- Supabase client connected using publishable key.
- Dashboard, Employees, Locations, Attendance, Reports, Users & Roles, Rules and Settings UI.
- Employee creation connected to Supabase.
- Employee shift assignment implemented.
- Attendance UI uses Shift In/Shift Out state.
- Admin-authorized break creation implemented in employee attendance detail.
- Realtime attendance groundwork implemented.

## Supabase
- Core company/location/employee/user/role/permission/profile/attendance schema created.
- Shifts and attendance_breaks added.
- Duplicate Shift In / invalid Shift Out database protection added.
- RLS enabled.
- Realtime attendance tables configured.
- Employee remote_punch_allowed field added.
- Attendance punch GPS/location fields added:
  - latitude
  - longitude
  - accuracy_m
  - geo_verified
  - punch_location_name
  - punch_mode
- Existing face_template and face_capture_path fields are available as a starting point for future biometric enrollment.

## Android kiosk
- Expo React Native kiosk exists under /mobile.
- Manager login implemented.
- Temporary employee selector implemented for live testing.
- Shift In/Shift Out implemented.
- Authorized Break In implemented.
- GPS/geofence groundwork implemented.
- Remote punch location handling implemented.
- Android app connects to the same Supabase project.

## Current known implementation issue
mobile/App.tsx has an accidental setPunchPlace(geo.name) reference inside signIn(), where geo is not defined. Verify/fix before the next kiosk test.

## Current limitation
The Android kiosk does NOT yet have real facial recognition. The employee selector is temporary and must be removed from the final kiosk flow.

## Next implementation
- Choose a compatible native camera/vision/ML stack.
- Add liveness/anti-spoofing.
- Enroll employee face templates.
- Match live faces to employees.
- Automatically select the recognized employee.
- Reuse existing Shift In/Shift Out, GPS/geofence and Supabase punch logic.
- Test on the Android kiosk.

## Handoff rule
Whenever the user says "bye", update this file with all implementation changes from the session and commit it with the other handoff documents.


## Historical implementation timeline
1. Built initial interactive admin prototype.
2. Added attendance rules and role management.
3. Added Excel employee import.
4. Added date filters, attendance counts, employee records and punch history.
5. Added Supabase live attendance schema.
6. Added Supabase web client and /live test page.
7. Added Expo Android kiosk and Supabase connection.
8. Added live-test documentation.
9. Added shift/geofence/break/punch-integrity schema.
10. Simplified kiosk to single state-aware Shift In/Out.
11. Added Expo location support.
12. Added admin break workflow and kiosk geofence groundwork.
13. Added remote punch authorization and actual punch location.
14. Connected employee creation to Supabase.
15. Created project brain and five initial handoff documents.
16. Expanded handoff to eight documents.
17. Current next implementation: real face recognition.

## Testing/removal history
- Web manual punches were used for connectivity testing.
- The selector-based Android punch flow is temporary.
- Flexible employee break controls were removed from the intended flow.
- Accidental CRM tables bills/call_logs were removed after attendance SQL was pasted into the wrong Supabase project.
- No production biometric stack has been installed yet.
