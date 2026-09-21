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

Android is a shared store kiosk. A manager signs in and employees use the kiosk for attendance. Current Android app is a manual live-test prototype; face recognition is deferred.

## Realtime
Use Supabase Realtime for live attendance changes. Historical reports should use normal database queries.

## Performance
Query only required data, use indexes and pagination, filter efficiently, use bulk imports and avoid unnecessary sequential API calls.

## Security
Clients use publishable Supabase keys. Service-role keys stay server-side. RLS is enabled. Biometric data needs additional production security review.

## Deployment
Web deploys from GitHub main to Vercel. Android lives under /mobile and is independent of Vercel.
