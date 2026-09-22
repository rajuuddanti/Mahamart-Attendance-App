# Mahamart Attendance — Decisions

## Product decisions
- Attendance only; no payroll/salary calculation.
- Web Admin is the first application.
- Android is a shared store kiosk, not an individual employee-phone app.
- Normal employee attendance is Shift In -> Shift Out.
- Employees do not have ordinary Break Out/Break In buttons.
- Breaks are authorized by admin and then closed by the employee with Break In.
- Employees and admin/system users are separate concepts.
- Employee designated location is separate from actual punch location.
- Remote punch is explicitly authorized per employee.

## Location decisions
- Kiosk punches require GPS/geofence validation.
- A remote-authorized employee may punch outside stores.
- If a remote-authorized employee is physically inside a registered store geofence, the actual punch location should be that store.
- Otherwise the actual punch location is Remote with GPS/accuracy data.
- The employee's designated location must never be overwritten by the actual punch location.

## Face-recognition decisions
- Final kiosk must not ask employees to select their name.
- The kiosk should identify the employee using the front camera.
- Recognition must include liveness/anti-spoofing.
- Face recognition should produce a face embedding/template and match it against enrolled employees.
- Device biometric authentication such as Android fingerprint/face unlock is NOT the employee-recognition solution.
- Prefer on-device processing where practical.
- Biometric data requires additional security and privacy hardening.
- Do not fake face recognition with a camera preview.

## Architecture decisions
- GitHub is the source of implementation and project handoff documentation.
- Supabase is the backend/database/auth/realtime layer.
- Vercel hosts the web application.
- Expo React Native is used for Android kiosk development.
- Realtime is used for live attendance updates; normal database queries are used for historical reporting.

## Handoff decision
The seven Markdown handoff files are now the project's cross-account memory:
- PROJECT_BRAIN.md
- DATABASE.md
- BUSINESS_RULES.md
- ARCHITECTURE.md
- DEVELOPMENT_LOG.md
- CONVERSATIONS.md
- DECISIONS.md
- IMPLEMENTATIONS.md

Whenever the user says "bye", update all of them before ending the session.


## Historical decisions and rationale
- The product is attendance-only because payroll was deliberately kept outside the first scope.
- Web admin came first so HR/admin workflows could be validated before building the employee kiosk.
- Shared kiosks were selected because the intended store model is a manager-controlled device, not every employee carrying the attendance app.
- The employee selector was accepted only as a temporary testing shortcut. It is explicitly not a product decision.
- The break model was simplified to prevent employees from creating arbitrary breaks; admin authorization controls breaks.
- Actual punch location was separated from assigned location to support remote employees without corrupting employee master data.
- Remote punch is employee-specific so the company can authorize only selected employees.
- Face recognition must be real employee identification, not device biometric authentication.
- We chose not to finalize the biometric database structure before choosing the ML stack, because embedding/model formats and liveness implementation affect the schema.
- The user wants live testing before adding broad additional features.
