## 1. Backend — Default Preferences on Join

- [ ] 1.1 Verify CreateFamily use case — does it call notifPrefRepo.setDefaults? If not, add it after creating the membership
- [ ] 1.2 Verify AcceptInvitation use case — same check; add setDefaults call if missing
- [ ] 1.3 Run existing tests — make sure adding setDefaults doesn't break them
- [ ] 1.4 Verify e2e flow: create family → query notificationPreferences → returns 4 records

## 2. Toggle Component

- [ ] 2.1 Create `web/src/components/Toggle.tsx` with role="switch" + aria-checked
- [ ] 2.2 Visual: pill track (off=neutral, on=accent) with sliding circle
- [ ] 2.3 Add tests at `__tests__/Toggle.test.tsx` covering: checked/unchecked render, click → onChange, disabled blocks, label accessibility

## 3. Settings Page — Notifications Section

- [ ] 3.1 Add Notifications section between theme picker and members link
- [ ] 3.2 Use `useNotificationPrefs(activeFamilyId)` hook to fetch current preferences
- [ ] 3.3 Build a `CATEGORIES` constant with: enum value, label, description (4 entries)
- [ ] 3.4 For each category, render a row: label/description on left, Toggle on right
- [ ] 3.5 On toggle change: call `useUpdateNotificationPref` with familyId, category, enabled
- [ ] 3.6 On mutation success: refetch preferences (toggle reflects new state)
- [ ] 3.7 On mutation error: show inline error using formatErrorMessage near the toggles
- [ ] 3.8 During mutation: disable that specific toggle to prevent double-clicks
- [ ] 3.9 If no preference record exists for a category: default to enabled in the UI

## 4. Verification

- [ ] 4.1 Lint, typecheck, all tests pass
- [ ] 4.2 e2e-test.sh: assert notificationPreferences returns 4 records after createFamily
- [ ] 4.3 Manual: open Settings → see 4 toggles → click one → state persists across page refresh
