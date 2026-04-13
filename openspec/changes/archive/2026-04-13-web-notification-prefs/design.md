## Context

The audit (issue #62) found notification preferences are completely missing from the SettingsPage UI. The backend has a `notificationPreferences` query, an `updateNotificationPreference` mutation, a `setDefaults` use case, and 4 categories defined. The web client has the `NOTIFICATION_PREFS_QUERY` and `UPDATE_NOTIFICATION_PREF_MUTATION` operations and hooks. Only the UI layer is missing.

## Goals / Non-Goals

**Goals:**

- Settings page shows all 4 notification categories with current state
- User can toggle each category (calls `updateNotificationPreference`)
- Reusable `Toggle` component (accessible switch)
- Defaults are set automatically when a user joins/creates a family (verify backend does this; if not, add it)
- Loading + error states using existing components

**Non-Goals:**

- Per-event notification opt-out (out of scope, just per-category)
- Email/SMS preferences (no schema for them yet)
- Quiet hours / DND (out of scope)
- Push notification permission prompt (browser-native, separate concern)

## Decisions

### 1. Toggle Component

**Decision:** Build `web/src/components/Toggle.tsx` as an accessible switch (button with `role="switch"` and `aria-checked`).

```typescript
interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string; // for accessibility
}
```

Visual: pill-shaped track with sliding circle. Off = neutral grey, On = accent color. Tailwind only.

### 2. Settings Page Layout

**Decision:** Add a "Notifications" section to SettingsPage between the existing theme picker and members link.

```
Settings Page
├── Logout button (top)
├── Active Family card (theme picker)
├── Notifications section [NEW]
│   ├── Category 1: toggle
│   ├── Category 2: toggle
│   ├── Category 3: toggle
│   └── Category 4: toggle
├── Members link
└── Switch Family list
```

Each row: category label (bold), description (smaller), toggle on the right.

### 3. Categories with Friendly Labels

**Decision:** Map backend category enum to friendly UI labels:

| Enum value               | UI label             | Description                                |
| ------------------------ | -------------------- | ------------------------------------------ |
| `events-reminders`       | Events & Reminders   | Birthday, anniversary, and event reminders |
| `social-feed`            | Social Feed          | New posts in the family feed               |
| `social-comments-on-own` | Comments on My Posts | When someone comments on a post you wrote  |
| `family-updates`         | Family Updates       | New members, role changes, family settings |

Order in the UI matches priority (events first since they're most useful).

### 4. Toggle Behavior

**Decision:** Optimistic update: when user toggles, immediately update local state, then call mutation. On error, revert + show error toast/inline message.

Simpler alternative: pessimistic — wait for mutation, refetch, show new state. Requires brief loading.

**Decided pessimistic for v1:** simpler, no rollback logic. The toggle is disabled briefly while mutation is in flight. After success, refetch returns true state.

### 5. Default Preferences on Join

**Decision:** Backend should call `setDefaults` automatically in:

- `CreateFamily` use case (when a new family is created, set defaults for the creator)
- `AcceptInvitation` use case (when a user joins, set defaults)

Verify this currently happens. If not, add the calls. Without this, new users see "no preferences yet" — confusing.

If preferences don't exist when the user views Settings, the UI defaults to "all enabled" visually but each toggle action creates the record via upsert. Acceptable fallback.

## Risks / Trade-offs

**[Brief disabled state during pessimistic toggle]** — slight UX delay (~100ms). Acceptable for v1. Optimistic update can be added later.

**[Default categories drift]** — if backend adds a new category (e.g., "chore-reminders"), UI must be updated to show it. Acceptable since changes are infrequent and require schema updates anyway.
