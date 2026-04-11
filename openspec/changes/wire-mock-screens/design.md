## Context

The mobile app has 24 screen components, a MockDataProvider with all feature data, and a TabNavigator that tracks `activeTab` state — but `App.tsx` renders nothing between the header and the tab bar. Each screen is a self-contained component accepting props (data + callbacks). The screens were built before navigation wiring.

## Goals / Non-Goals

**Goals:**

- Every tab renders its primary screen with mock data
- Users can tap into detail screens (post → comments, event → detail, person → relationships)
- Family switcher changes the active family and theme
- The full app is browsable end-to-end in mock mode

**Non-Goals:**

- Real navigation library (React Navigation / Expo Router) — that's for the real API wiring phase
- Auth flow or onboarding screens — those require real auth
- Write operations (create post, create event) — mock mode is read-only for now
- Persistent state — refreshing resets everything

## Decisions

### 1. Simple State-Based Navigation (No Library)

**Decision:** Use React state (`useState`) for navigation instead of React Navigation or Expo Router.

**Rationale:** The app already has `activeTab` state. Adding a navigation library for mock mode is unnecessary complexity — it requires stack configuration, type definitions, and provider setup that will be replaced when we wire real API + auth. A simple `activeScreen` state per tab gives us intra-tab navigation without any new dependencies.

```
App.tsx
 ├── activeTab: "feed" | "calendar" | "tree" | "chores" | "more"
 └── screenStack: { feed: ["list"], calendar: ["agenda"], ... }
     │
     ├── feed: "list" → FeedScreen
     │         "comments" → CommentsScreen
     │         "create" → CreatePostScreen
     │
     ├── calendar: "agenda" → AgendaScreen
     │             "month" → CalendarMonthScreen
     │             "detail" → EventDetailScreen
     │
     ├── tree: "tree" → FamilyTreeScreen
     │         "person" → PersonRelationshipsScreen
     │
     ├── chores: "list" → ChoreListScreen
     │
     └── more: "menu" → MoreMenu (new)
               "members" → MembersListScreen
               "settings" → FamilySettingsScreen
               "notifications" → NotificationPreferencesScreen
```

**Alternatives considered:**

- _React Navigation_: Full stack/tab navigator. Rejected — adds dependency and configuration overhead for throwaway mock-mode routing.
- _Expo Router file-based routing_: Already an indirect dependency but requires `app/` directory restructure. Rejected — same reason.

### 2. Container Components for Data Binding

**Decision:** Create one container component per tab that reads from `useMockData()` and transforms data into the props each screen expects.

```
FeedContainer.tsx
 └── useMockData() → { posts, comments, reactions }
     │
     ├── transforms to FeedItem[] for FeedScreen
     ├── tracks selectedPostId for CommentsScreen
     └── provides navigation callbacks (onPostPress, onBack)
```

**Rationale:** Screens are pure presentational components taking typed props. Containers handle mock data → prop transformation and intra-tab navigation state. This keeps screens reusable for real API wiring later — only the containers change.

### 3. MoreMenu as a Simple List Screen

**Decision:** The "More" tab renders a new `MoreMenu` component — a simple list of links to MembersListScreen, FamilySettingsScreen, NotificationPreferencesScreen, and FamilySwitcherScreen.

**Rationale:** These are secondary screens that don't need their own tab. A menu list is the standard pattern for "More" tabs.

## Risks / Trade-offs

**[State reset on tab switch]** → Switching tabs resets intra-tab navigation to the root screen. Acceptable for mock mode — real navigation library will handle stack persistence.

**[Container duplication]** → Each container has similar navigation state logic. Acceptable — these are temporary scaffolding that gets replaced by React Navigation when real API is wired.

**[Mock data shape mismatch]** → Screen props may not exactly match the mock data types. Containers handle the transformation, keeping screens unchanged.
