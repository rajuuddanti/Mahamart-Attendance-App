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
