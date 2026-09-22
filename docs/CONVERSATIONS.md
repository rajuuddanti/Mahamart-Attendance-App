# Mahamart Attendance — Conversation Handoff

## Purpose
This file preserves important conversation context that may otherwise be lost when moving to another ChatGPT account or chat.

## Latest session
- User ended the session after deciding to continue the next day.
- Android kiosk was running successfully.
- The kiosk still used a temporary employee selector.
- User identified that this is not the intended final attendance flow.
- Next work is real employee facial recognition.

## Important conversation context
- User prefers practical, step-by-step implementation.
- User wants the assistant to handle technical work and provide exact actions when needed.
- The project should not be expanded with unrelated features without discussion.
- Live testing is important before adding more functionality.
- GitHub documentation is the cross-account memory source.

## Current next-session starting point
Start with the Android face-recognition implementation:
1. Verify/fix the mobile sign-in bug.
2. Confirm Expo/React Native versions.
3. Select a compatible camera + face detection/embedding + liveness stack.
4. Build the native/development-build setup if required.
5. Replace the employee selector with real recognition.

## Handoff rule
Whenever the user says "bye", update this file with the important conversation context from that session and commit it with the other handoff documents.


## Complete historical addendum
### Product-origin conversation
The user wanted a SalaryBox-like attendance product for Mahamart, but specifically attendance-only. Payroll was excluded from the beginning. The user wanted to start with the web admin and later connect Android kiosks.

### Scale conversation
The first deployment is for an office of roughly 12 people, with architecture intended to grow to multiple stores and roughly 400 employees. Admin/backend users are expected to be roughly 4–6 initially.

### Technology conversation
We discussed why a web app is preferable to an .exe: the core work is server/database work, so an .exe would not automatically make backend operations faster. The chosen stack became Next.js/TypeScript + Vercel + Supabase + GitHub, with Expo React Native for Android.

### UI/product conversation
The web admin was designed with Dashboard, Employees, Locations, Attendance, Reports, Users & Roles, Rules and Settings. Employees, locations and users became clickable/detail-oriented. Employee creation includes a shift.

### Attendance simplification conversation
The employee flow was intentionally simplified from a more flexible action set to only Shift In and Shift Out. The user did not want employees manually controlling ordinary breaks. Admin-authorized breaks became the model.

### Location conversation
A major decision was separating assigned/designated employee location from actual punch location. This was important for remote workers: a remote-authorized employee physically at a registered store should show that store as the actual punch location; otherwise show Remote plus GPS.

### Live-test conversation
The /live web route was built to verify Supabase integration. The root web UI was still partly local/prototype. Employee creation was later connected to Supabase after the user discovered that creating an employee in the prototype did not populate the live database.

### Android conversation
The Android kiosk was built as a shared kiosk with manager login. Temporary employee selection was used only to test database attendance before biometric recognition was implemented.

### Errors/troubleshooting conversation
Windows PowerShell blocked npm.ps1, so npm.cmd was used. Expo tunnel setup requested @expo/ngrok. Expo dependency fixing was attempted. A rn-get-polyfills React Native bundling error occurred. The Android emulator/device eventually displayed the kiosk.

### Database troubleshooting conversation
The code expected remote punch/location columns before the live Supabase schema had them. The user applied the required ALTER TABLE statements manually. This is now part of the known live environment state.

### Facial recognition conversation
The user saw the kiosk and asked where the facial scanner was. We clarified that the current build was only a selector prototype. The user agreed to proceed with real face recognition. The final flow must identify employees automatically, include liveness, and keep existing GPS/attendance logic.

### Cross-account conversation
The user specifically wants enough documentation to survive ChatGPT conversation limits or changing accounts. They asked for not only project brain but also conversation, decisions and implementations. The documentation system was therefore expanded to eight files and made a permanent "bye" routine.
