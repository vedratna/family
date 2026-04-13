## Why

The SettingsPage has theme picker and family switcher but no notification preferences UI, despite `notificationPreferences` query, `updateNotificationPreference` mutation, and a `setDefaults` use case all existing on the backend. Users cannot control which notifications they receive.

## What Changes

**Settings page — add Notifications section:**

- New section on SettingsPage below the theme picker
- Lists all 4 notification categories with current enabled/disabled state:
  - Events & Reminders (event reminders, RSVP changes)
  - Family Updates (new members, role changes)
  - Social Feed (new posts in feed)
  - Comments on My Posts
- Each category shown with a toggle switch
- Toggle calls `updateNotificationPreference` mutation
- After toggle: refetch preferences to reflect server state

**Default preferences:**

- When user joins a family (acceptInvitation, createFamily), backend's `setDefaults` should run automatically (verify it does)
- All categories default to enabled

**Reusable toggle component:**

- Build `web/src/components/Toggle.tsx` — accessible switch component (button with role="switch", aria-checked)
- Used in notification settings, can be reused elsewhere

## Capabilities

### New Capabilities

- `web-toggle`: Reusable toggle/switch component

### Modified Capabilities

- `web-feature-screens`: SettingsPage gains notification preferences section
- `crud-forms`: Notification preference toggle as a CRUD action

## Impact

- **New files**: `web/src/components/Toggle.tsx`
- **Modified files**: SettingsPage.tsx
- **Backend verification**: confirm `setDefaults` runs on createFamily and acceptInvitation
- **No schema changes** (operations already exist)
- **Prerequisite**: none (can be done independently)
