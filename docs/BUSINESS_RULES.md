# Mahamart Attendance — Business Rules

## Punching
1. Normal flow is Shift In -> Shift Out.
2. After Shift In, only Shift Out is offered.
3. After Shift Out, Shift In is offered again.
4. Duplicate Shift In is blocked while a shift is open.
5. Shift Out without an open Shift In is blocked.
6. Enforce these rules in UI and database.

## Breaks
1. Employees do not receive normal Break Out.
2. Admin creates an authorized break from employee attendance detail.
3. Admin enters remarks.
4. Backend stores the break.
5. Mobile shows Break In while the authorized break is open.

## Shifts
1. Every employee has a default shift.
2. Shift is assigned during employee creation.
3. Current examples: 09:00-18:00 and 09:00-18:30.

## Locations
1. Employee has a designated location.
2. Location can have coordinates and a geofence radius.
3. Kiosk can be restricted to its assigned location.
4. Remote punch permission is employee-specific.
5. Actual punch location is separate from designated location.

## Remote Punch
1. Must be explicitly enabled.
2. GPS is captured.
3. Inside a registered store geofence -> record store name.
4. Outside registered stores -> record Remote plus GPS.
5. Do not overwrite designated location.

## Face Recognition Kiosk
1. Final kiosk must not require employees to select their name.
2. Kiosk uses the front camera to identify the employee.
3. Recognition must include liveness/anti-spoofing before accepting a punch.
4. The recognized employee is then checked against normal Shift In/Shift Out state rules.
5. GPS/geofence validation still applies.
6. Actual punch location remains separate from designated employee location.
7. Face templates/embeddings are sensitive biometric data and must not be exposed casually.
8. Device biometric authentication is not a substitute for employee face recognition.

## Attendance
Default:
- Grace 15 minutes
- Under 5 hours = Absent
- Under 8 hours = Half Day
- 8+ hours = Present
- No week-offs currently.

## Reports
Monthly cycle is 21st through 20th.
Total Present Days = Present + Half Day.
Daily codes: P, H, A.

## Handoff rule
When the user says “bye” at the end of a session, the latest business decisions and completed changes must be written into all project .md handoff documents and committed to GitHub.
