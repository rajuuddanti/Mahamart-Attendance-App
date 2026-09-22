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
