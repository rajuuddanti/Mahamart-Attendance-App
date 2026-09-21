# Mahamart Attendance — Live Test Setup

## 1. Supabase database
Open Supabase SQL Editor and run `supabase/schema.sql` once.

Then create one Auth user (email/password) in Supabase Authentication > Users.

After creating that user, run the profile INSERT at the bottom of `supabase/schema.sql`, replacing the email.

## 2. Web
Copy `.env.example` to your Vercel environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

The publishable key is safe to expose in client apps; never put a service/secret key in the web or Android app. Supabase RLS protects the database.

## 3. Android live test
The `mobile/` folder is an Expo React Native kiosk prototype. Install dependencies, create `mobile/.env` from `mobile/.env.example`, then run `npx expo start` and open it with Expo Go. It uses the same Supabase project.

This first Android test build intentionally uses employee selection instead of face recognition so the database, authentication and punch synchronization can be tested before adding the camera/face-recognition layer.
