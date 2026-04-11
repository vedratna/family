## Why

The app has 24 screens, mock data for every feature, and a tab navigator — but nothing connects them. Opening the app shows a header, empty space, and tab icons. Users cannot browse any screen or see any mock data. This change wires everything together so the app is fully browsable in mock mode.

## What Changes

- Connect 5 tab screens (Feed, Calendar, Tree, Chores, More) to the TabNavigator with content rendering based on active tab
- Pass mock data from MockDataProvider into each screen's props
- Add intra-tab navigation so tapping items opens detail screens (e.g., post → comments, event → event detail, person → relationships)
- Add a "More" tab screen aggregating settings, members, notifications, and family switcher
- Wire the AppHeader's family switcher button to cycle families (already exists) with visible theme change

## Capabilities

### New Capabilities

- `screen-wiring`: Tab-to-screen routing, mock data binding, and intra-tab navigation for the mobile app in mock mode

### Modified Capabilities

_(None — no spec-level behavior changes. All screens and mock data already exist.)_

## Impact

- **Modified files**: `src/App.tsx` (render screens based on active tab), individual screen files (minor prop adaptations if needed)
- **New files**: Possibly a `ScreenRouter.tsx` or similar component to map tabs → screens and handle intra-tab navigation state
- **Dependencies**: None new — all using existing React Native primitives and mock data
- **No changes to**: Backend, shared types, infra, mock data files, providers
