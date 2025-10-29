<!-- 93d59fb7-03b2-46e3-b384-082d5039472b 8e37516a-23c3-49e1-a80c-d6af0dc0f533 -->
# Confetti Around "Zrobione" Button

1. Add Dependency

- Install `react-confetti` via `pnpm` to provide the confetti animation component.

2. Enhance `status-buttons`

- Update `src/components/moves/status-buttons.tsx` to track when the "Zrobione" button is pressed and capture its bounding box via a ref.
- Trigger a timed confetti burst using `ReactConfetti`, rendered through a `createPortal` overlay anchored to the captured bounds so the animation stays around the button.
- Ensure the confetti effect only runs on the client and cleans up timers on unmount.