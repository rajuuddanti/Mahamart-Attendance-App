# Mahamart Attendance — Master Project Brain

## 1. Why this project exists
Mahamart needs a practical attendance-management system similar in concept to SalaryBox, but focused on attendance rather than payroll. The goal is to control employee attendance across an office/store network, with a web admin system and shared Android kiosks.

The project is being built so that:
- the business owns the source code;
- Supabase holds the live application data;
- Vercel hosts the web admin;
- Android kiosks handle real employee attendance;
- GitHub documentation preserves the project context across ChatGPT accounts/chats.

The user has previously built a CRM web application with ChatGPT on Render and is comfortable directing product requirements while ChatGPT handles much of the technical implementation.

## 2. Product scope
### Included
- Employee management
- Locations/stores
- Attendance
- Shift In / Shift Out
- Admin-authorized breaks
- Attendance rules
- Daily/monthly reports
- Users and roles
- Permissions
- Excel employee import/export groundwork
- GPS/geofence validation
- Remote punch authorization
- Android shared kiosk
- Planned employee facial recognition

### Explicitly excluded for now
- Payroll/salary calculation
- Full HR/payroll suite
- Unrelated CRM functionality
- Production biometric hardening until the recognition design is validated
- Advanced features until live testing and HR review are complete

## 3. Target organization
Initial test environment:
- One office
- Approximately 12 employees
- Approximately 4–6 admin/backend users

Future target:
- Multiple stores/locations
- Approximately 400 employees
- Store managers and supervisors with location-scoped access

## 4. Architecture
- Web Admin: Next.js + TypeScript
- Web hosting: Vercel
- Source: GitHub
- Database/Auth/Realtime: Supabase PostgreSQL
- Android kiosk: Expo React Native under /mobile
- Domain: GoDaddy can be used for the domain; GoDaddy hosting is not required

Data flow:
Android Kiosk / approved remote punch -> Supabase -> attendance -> Realtime -> Web Admin.

## 5. Attendance model
Normal employee flow is deliberately simple:
1. Shift In
2. Shift Out

After Shift In, only Shift Out is available.
After Shift Out, Shift In becomes available again.
Duplicate Shift In and invalid Shift Out are blocked in UI and database.

## 6. Break model
Employees do not get ordinary Break Out/Break In controls.

Admin workflow:
Attendance -> employee -> attendance detail -> Create Break -> Start Break + remarks.

Backend stores the authorized break.
Mobile can show Break In while that authorized break is open.

## 7. Shifts
Every employee gets a default shift during creation.
Examples used during development:
- 09:00–18:00
- 09:00–18:30

## 8. Attendance rules
Default seeded rule:
- Shift 09:00–18:00
- Grace 15 minutes
- Under 5 worked hours = Absent
- Under 8 worked hours = Half Day
- 8+ worked hours = Present
- Require Shift Out
- Allow early Shift In
- No week-off logic currently

Monthly reporting cycle:
21st through 20th.
Daily codes: P, H, A.
Total Present Days = Present + Half Day.

## 9. Locations and punch location
Employee designated location and actual punch location are separate.

Kiosk:
- Kiosk is intended to be tied to its assigned store.
- GPS/geofence validation is required.
- Punch outside allowed radius is rejected.

Remote punch:
- Explicitly enabled per employee.
- GPS and accuracy are captured.
- If physically inside a registered store geofence, actual punch location is that store.
- Otherwise actual punch location is Remote plus GPS.
- Employee designated location is never overwritten.

## 10. Roles
- Super Admin
- Company Admin
- HR
- Store Manager
- Supervisor
- Employee

Permissions cover:
- employee view/create/edit/delete
- attendance view/edit
- reports/export
- locations
- users
- settings/rules

Store-scoped users should only access assigned locations.

## 11. Web application
Main sections:
- Dashboard
- Employees
- Locations
- Attendance
- Reports
- Users & Roles
- Rules
- Settings

Employee creation now writes to Supabase.
Employee rows, locations and users have detail/edit interactions.

The root web page remains partly a prototype/local-data UI, while /live is the Supabase-connected attendance test route.

## 12. Android kiosk
The Android application is a shared kiosk:
- manager signs in;
- employees use the kiosk;
- the final product must identify employees by face;
- employees should not select their names in the final kiosk.

The current app is still a live-test prototype with a temporary employee selector.

## 13. Face recognition — next major feature
Final flow:
camera -> face detection -> liveness/anti-spoofing -> face embedding -> employee match -> Shift In/Out state check -> GPS/geofence -> Supabase punch -> Realtime -> Web Admin.

Requirements:
- front camera
- automatic employee identification
- liveness/anti-spoofing
- secure employee enrollment
- face embeddings/templates
- no employee selector in final kiosk
- reuse existing attendance and location rules

Device LocalAuthentication is not suitable because it authenticates the device owner's enrolled biometric; it does not identify an employee against the company's employee database.

Prefer on-device processing where practical. Biometric data needs extra security/privacy review.

## 14. Database
Core:
companies, locations, employees, roles, permissions, role_permissions, profiles, attendance_rules, attendance_punches.

Added:
shifts, attendance_breaks.

Employee:
- shift_id
- remote_punch_allowed
- existing face_template / face_capture_path groundwork

Location:
- latitude
- longitude
- geofence_radius_m

Punch:
- latitude
- longitude
- accuracy_m
- geo_verified
- punch_location_name
- punch_mode

PostgreSQL integrity logic prevents duplicate Shift In while open and Shift Out without an open Shift In.

## 15. Security
- Use Supabase publishable keys in browser/mobile.
- Never expose service-role/secret keys.
- RLS is enabled.
- Granular role-permission enforcement at every DB policy still needs production hardening.
- Biometric data must not be casually exposed in admin UI.
- Production face recognition needs enrollment, liveness, storage and access-control review.

## 16. Excel
Employee import groundwork supports fields including:
employee ID, name, location, phone, email, DOB, gender, address, emergency contact/phone, joining date, designation, department, PAN, Aadhaar, bank account and IFSC.

## 17. Current live-test state
Working/implemented baseline:
- Supabase authentication
- Employees
- Employee creation connected to Supabase
- Shift In/Out
- duplicate punch protection
- admin-authorized breaks
- Break In
- realtime attendance groundwork
- location/geofence groundwork
- remote punch groundwork
- Android kiosk connected to Supabase
- Android GPS/location punch fields

Known:
- The web test page can manually create test punches; this is testing only, not the intended employee punch mechanism.
- The Android selector is temporary.
- Three test punches were recorded during live testing: Shift In, Shift Out, Shift In, all Web Admin with face_verified false.

## 18. Known bug
mobile/App.tsx has an accidental setPunchPlace(geo.name) reference inside signIn(), where geo is not defined. Verify/fix before the next kiosk test.

## 19. Current stop point
The user stopped after seeing the Android kiosk running and correctly asked where the facial scanner was. The project is paused immediately before implementing real facial recognition.

Next session:
1. Fix/verify Android sign-in bug.
2. Confirm current Expo/React Native versions.
3. Select compatible camera + face detection + embedding + liveness stack.
4. Create required Expo development/native build.
5. Replace employee selector with real recognition.
6. Enroll a test employee.
7. Test recognition + Shift In/Out + GPS/geofence + Supabase.
8. Review biometric security.

## 20. Cross-account rule
GitHub is the implementation source and these Markdown files are the handoff memory. Another ChatGPT account should read all eight before continuing.

Whenever the user says "bye", update all eight handoff files with the latest conversation, decisions, implementation state, database changes, removals, bugs, tests, deployments and next steps, then commit them to GitHub.


## Historical evolution
The product started as a broad attendance concept and was progressively narrowed into an attendance-only operational system. The important evolution was:
prototype admin UI -> attendance rules/reports -> Supabase backend -> Android kiosk -> GPS/geofence -> remote punch -> live testing -> real facial recognition as the next major step.

The documentation should preserve both current state and why earlier choices were made.