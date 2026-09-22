# Mahamart Attendance — Architecture

## Stack
- Next.js + TypeScript: Web Admin
- Vercel: Web hosting
- GitHub: Source control
- Supabase: PostgreSQL, Auth, RLS, Realtime
- Expo React Native: Android kiosk
- xlsx: Excel import

## Applications
Web Admin manages employees, locations, attendance, reports, users/roles and rules.

Android is a shared store kiosk. A manager signs in and employees use the kiosk for attendance. Current Android app is a manual live-test prototype; face recognition is the next implementation target.

## Realtime
Use Supabase Realtime for live attendance changes. Historical reports should use normal database queries.

## Performance
Query only required data, use indexes and pagination, filter efficiently, use bulk imports and avoid unnecessary sequential API calls.

## Security
Clients use publishable Supabase keys. Service-role keys stay server-side. RLS is enabled. Biometric data needs additional production security review.

## Android face-recognition direction
The final kiosk flow is:
camera -> face detection -> liveness -> face embedding -> employee match -> Shift In/Out state check -> GPS/geofence -> Supabase punch -> Realtime -> Web Admin.

The current selector-based kiosk remains a development/live-test tool only.

Expo Go/device LocalAuthentication is not sufficient for this custom employee-identification workflow. The implementation should use a compatible native camera/vision/ML stack and an Expo development build if required. Confirm package/SDK compatibility before installing or committing the biometric stack.

## Deployment
Web deploys from GitHub main to Vercel. Android lives under /mobile and is independent of Vercel.

## Handoff rule
When the user says “bye”, update all project Markdown handoff documents with the latest architecture, implementation state, decisions and next step, then commit the documentation to GitHub.


## Architecture history
The architecture evolved from a local-looking web prototype into a live Supabase-backed web test plus an independent Expo kiosk.

The root web UI is not the same thing as the /live integration test. This distinction matters when troubleshooting why data appears in one screen but not Supabase.

The Android app is intentionally independent of Vercel. It uses Supabase directly.

The face-recognition layer is the remaining major architectural component before the kiosk can become the intended real attendance mechanism.
