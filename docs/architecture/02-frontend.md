# Frontend Architecture

> Last reviewed: 2026-04-07

The mobile client is a React Native (Expo) app living in `packages/mobile/`. It follows a feature-based module structure where each domain feature is self-contained, screens are thin UI shells, and custom hooks act as view models holding all logic and state.

---

## Table of Contents

1. [Feature Module Structure](#feature-module-structure)
2. [Screen-Hook-API Data Flow](#screen-hook-api-data-flow)
3. [Server State with TanStack Query](#server-state-with-tanstack-query)
4. [Theming](#theming)
5. [Navigation](#navigation)
6. [Providers and Component Hierarchy](#providers-and-component-hierarchy)
7. [Shared Components](#shared-components)
8. [Conventions](#conventions)

---

## Feature Module Structure

Every domain feature lives under `src/features/` and follows an identical internal layout. Features never import from each other's internals — cross-feature communication goes through shared types, navigation params, or providers.

```
packages/mobile/src/
├── features/
│   ├── auth/
│   │   ├── screens/          ← Pure UI components (LoginScreen, OtpScreen)
│   │   ├── hooks/            ← View model hooks (useLogin, useOtp)
│   │   ├── components/       ← Feature-scoped UI (PhoneInput, SocialButtons)
│   │   └── api/              ← GraphQL queries/mutations + TanStack wrappers
│   │
│   ├── onboarding/
│   │   ├── screens/          ← WelcomeScreen, CreateProfileScreen, JoinFamilyScreen
│   │   ├── hooks/            ← useOnboardingFlow, useCreateProfile
│   │   ├── components/       ← StepIndicator, AvatarPicker
│   │   └── api/
│   │
│   ├── family/
│   │   ├── screens/          ← FamilySettingsScreen, MembersScreen
│   │   ├── hooks/            ← useFamily, useFamilySwitcher, useInvite
│   │   ├── components/       ← MemberCard, InviteSheet, FamilyAvatar
│   │   └── api/              ← familyQueries, familyMutations
│   │
│   ├── relationships/
│   │   ├── screens/          ← AddRelationshipScreen, RelationshipDetailScreen
│   │   ├── hooks/            ← useRelationship, useRelationshipForm
│   │   ├── components/       ← RelationshipPicker, MemberSelector
│   │   └── api/
│   │
│   ├── tree/
│   │   ├── screens/          ← TreeScreen (pan/zoom canvas)
│   │   ├── hooks/            ← useTreeLayout, useTreeData, useTreeGestures
│   │   ├── components/       ← TreeNode, TreeEdge, TreeControls
│   │   └── api/
│   │
│   ├── feed/
│   │   ├── screens/          ← FeedScreen, PostDetailScreen, CreatePostScreen
│   │   ├── hooks/            ← useFeed, useCreatePost, useReactions
│   │   ├── components/       ← PostCard, MediaGallery, ReactionBar
│   │   └── api/
│   │
│   ├── calendar/
│   │   ├── screens/          ← CalendarScreen, EventDetailScreen, CreateEventScreen
│   │   ├── hooks/            ← useCalendar, useCreateEvent, useEventReminder
│   │   ├── components/       ← CalendarGrid, EventCard, DatePicker
│   │   └── api/
│   │
│   ├── chores/
│   │   ├── screens/          ← ChoresScreen, ChoreDetailScreen, CreateChoreScreen
│   │   ├── hooks/            ← useChores, useChoreRotation, useAssignChore
│   │   ├── components/       ← ChoreCard, AssigneeAvatar, StreakBadge
│   │   └── api/
│   │
│   └── notifications/
│       ├── screens/          ← NotificationsScreen
│       ├── hooks/            ← useNotifications, usePushPermission
│       ├── components/       ← NotificationItem, NotificationBadge
│       └── api/
│
├── shared/
│   ├── components/           ← EmptyState, ErrorBoundary, IllustrationPlaceholder
│   ├── theme/                ← ThemeProvider, useTheme, palettes, tokens
│   ├── navigation/           ← Navigator definitions, linking config
│   └── providers/            ← QueryProvider, AuthProvider, FamilyProvider
│
├── app/                      ← Expo Router entry point
└── App.tsx                   ← Root provider composition
```

### Feature isolation rules

| Rule                     | Detail                                                                      |
| ------------------------ | --------------------------------------------------------------------------- |
| No cross-feature imports | Feature A never imports from `features/B/components/` directly              |
| Shared types only        | Cross-feature data goes through `@family/shared` package types              |
| Navigation params        | Features communicate via typed navigation params                            |
| Provider access          | Features read global state through providers (AuthProvider, FamilyProvider) |

---

## Screen-Hook-API Data Flow

Screens contain zero business logic. Each screen calls one primary hook (the "view model") which orchestrates API calls, form state, and derived values. The hook returns a flat props object the screen destructures and renders.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SCREEN (Pure UI)                            │
│                                                                     │
│   FeedScreen.tsx                                                    │
│   ┌───────────────────────────────────────────────────────────────┐ │
│   │  const { posts, isLoading, onRefresh, onReact } = useFeed(); │ │
│   │                                                               │ │
│   │  return (                                                     │ │
│   │    <FlatList                                                  │ │
│   │      data={posts}                                             │ │
│   │      renderItem={...}                                         │ │
│   │      refreshing={isLoading}                                   │ │
│   │      onRefresh={onRefresh}                                    │ │
│   │    />                                                         │ │
│   │  );                                                           │ │
│   └───────────────────────────────────────────────────────────────┘ │
│                              │                                      │
│                    calls     │                                      │
│                              ▼                                      │
│   ┌───────────────────────────────────────────────────────────────┐ │
│   │                 HOOK (View Model)                              │ │
│   │                                                               │ │
│   │   useFeed.ts                                                  │ │
│   │   ├── useQuery(feedKeys.list, fetchFeed)   ← server state    │ │
│   │   ├── useMutation(createReaction)          ← server mutation │ │
│   │   ├── useMemo(() => sortPosts(...))        ← derived state   │ │
│   │   └── useCallback(() => refetch())         ← actions         │ │
│   │                                                               │ │
│   │   Returns: { posts, isLoading, onRefresh, onReact }          │ │
│   └───────────────────────────┬───────────────────────────────────┘ │
│                               │                                     │
│                     calls     │                                     │
│                               ▼                                     │
│   ┌───────────────────────────────────────────────────────────────┐ │
│   │                    API Layer                                   │ │
│   │                                                               │ │
│   │   feedApi.ts                                                  │ │
│   │   ├── fetchFeed(familyId)       → GraphQL query via AppSync  │ │
│   │   ├── createPost(input)         → GraphQL mutation            │ │
│   │   └── createReaction(input)     → GraphQL mutation            │ │
│   │                                                               │ │
│   │   feedKeys.ts  (query key factory)                            │ │
│   │   ├── feedKeys.all              → ['feed']                   │ │
│   │   ├── feedKeys.list(familyId)   → ['feed', 'list', familyId]│ │
│   │   └── feedKeys.detail(postId)   → ['feed', 'detail', postId]│ │
│   └───────────────────────────┬───────────────────────────────────┘ │
│                               │                                     │
└───────────────────────────────┼─────────────────────────────────────┘
                                │  GraphQL over HTTPS
                                ▼
                    ┌───────────────────────┐
                    │   AWS AppSync (API)   │
                    └───────────────────────┘
```

### Why this split matters

| Layer  | Responsibility                                  | Testable via                    |
| ------ | ----------------------------------------------- | ------------------------------- |
| Screen | Layout, styling, user gestures                  | Snapshot tests, component tests |
| Hook   | State orchestration, derived data, side effects | Unit tests (renderHook)         |
| API    | Network calls, request/response mapping         | Mock tests, integration tests   |

Screens import from `hooks/` and `components/` within the same feature. Hooks import from `api/` within the same feature. The API layer uses the GraphQL client configured in the shared providers.

---

## Server State with TanStack Query

All server data flows through TanStack Query (React Query). There is no global state store (no Redux, no Zustand) for server data. Local-only UI state (modal open, form input) stays in React state or hooks.

### Configuration

```
QueryClient config
├── staleTime:       5 minutes   (data considered fresh for 5 min)
├── gcTime:          30 minutes  (unused cache garbage collected after 30 min)
├── retry:           2           (retry failed requests twice)
├── refetchOnMount:  true        (refetch when component mounts if stale)
└── refetchOnReconnect: true     (refetch when network reconnects)
```

### Query key factory pattern

Each feature defines a query key factory to keep keys consistent and enable targeted invalidation.

```
// features/feed/api/feedKeys.ts

export const feedKeys = {
  all:          ['feed'] as const,
  lists:        () => [...feedKeys.all, 'list'] as const,
  list:         (familyId: string) => [...feedKeys.lists(), familyId] as const,
  details:      () => [...feedKeys.all, 'detail'] as const,
  detail:       (postId: string) => [...feedKeys.details(), postId] as const,
};
```

### Caching and deduplication flow

```
  Component A (FeedScreen)         Component B (PostPreview)
       │                                │
       │  useQuery(feedKeys.list(fam))  │  useQuery(feedKeys.list(fam))
       │                                │
       └──────────────┬─────────────────┘
                      │
                      ▼
            ┌──────────────────┐
            │   Query Cache    │    Same key = single request,
            │                  │    both components share the result
            │  ['feed','list', │
            │   'fam_123']     │
            │                  │
            │  status: fresh   │──── No refetch while fresh (5 min)
            │  data: [...]     │
            └────────┬─────────┘
                     │
                     │  When stale (after 5 min):
                     │  1. Return cached data immediately (stale-while-revalidate)
                     │  2. Refetch in background
                     │  3. Swap in new data when response arrives
                     │
                     ▼
            ┌──────────────────┐
            │   AppSync API    │
            └──────────────────┘
```

### Mutation + cache invalidation

After a successful mutation, related queries are invalidated so the UI updates. Optimistic updates are used for high-frequency interactions like reactions.

```
useMutation(createPost, {
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: feedKeys.lists() });
  },
});

useMutation(createReaction, {
  onMutate: async (newReaction) => {
    // Optimistic update: add reaction to cache immediately
    await queryClient.cancelQueries({ queryKey: feedKeys.detail(postId) });
    const previous = queryClient.getQueryData(feedKeys.detail(postId));
    queryClient.setQueryData(feedKeys.detail(postId), addReaction(previous, newReaction));
    return { previous };
  },
  onError: (_err, _vars, context) => {
    // Rollback on error
    queryClient.setQueryData(feedKeys.detail(postId), context.previous);
  },
});
```

---

## Theming

The theme system resolves a complete theme object from two inputs: the active family's chosen accent palette and the device's dark mode setting. Every screen reads theme tokens through the `useTheme()` hook.

### Theme resolution flow

```
  ┌───────────────────────┐     ┌───────────────────────┐
  │   FamilyProvider      │     │   Device Settings     │
  │                       │     │                       │
  │   activeFamily        │     │   colorScheme         │
  │     .accentColor      │     │   ("light" | "dark")  │
  │     = "coral"         │     │                       │
  └───────────┬───────────┘     └───────────┬───────────┘
              │                             │
              └──────────┬──────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   ThemeProvider     │
              │                     │
              │   Resolves:         │
              │   1. Look up accent │
              │      palette by     │
              │      family setting │
              │   2. Select light   │
              │      or dark base   │
              │      colors         │
              │   3. Merge into     │
              │      theme object   │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   Theme Object      │
              │                     │
              │   colors: {         │
              │     primary         │
              │     primaryLight    │
              │     background      │
              │     surface         │
              │     text            │
              │     textSecondary   │
              │     border          │
              │     error           │
              │     success         │
              │   }                 │
              │   typography: {...} │
              │   spacing: {...}    │
              │   radius: {...}     │
              │   shadows: {...}    │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │   useTheme() hook   │
              │                     │
              │   Used in every     │
              │   screen and        │
              │   component         │
              └─────────────────────┘
```

### Accent palettes

Eight palettes are available. Each family picks one during creation; members can change it in family settings.

| Palette | Primary (Light) | Primary (Dark) | Use case                          |
| ------- | --------------- | -------------- | --------------------------------- |
| Teal    | `#0D9488`       | `#2DD4BF`      | Default, fresh and neutral        |
| Indigo  | `#4F46E5`       | `#818CF8`      | Professional, structured families |
| Coral   | `#F43F5E`       | `#FB7185`      | Warm, energetic                   |
| Sage    | `#059669`       | `#34D399`      | Calm, nature-oriented             |
| Amber   | `#D97706`       | `#FBBF24`      | Warm, cheerful                    |
| Ocean   | `#0284C7`       | `#38BDF8`      | Cool, trustworthy                 |
| Plum    | `#9333EA`       | `#C084FC`      | Creative, playful                 |
| Slate   | `#475569`       | `#94A3B8`      | Minimal, understated              |

### Theme tokens

```
Theme tokens
│
├── colors
│   ├── primary            ← From accent palette (light or dark variant)
│   ├── primaryLight       ← Tinted variant for backgrounds
│   ├── background         ← Light: #FFFFFF / Dark: #0F172A
│   ├── surface            ← Light: #F8FAFC / Dark: #1E293B
│   ├── text               ← Light: #0F172A / Dark: #F8FAFC
│   ├── textSecondary      ← Light: #64748B / Dark: #94A3B8
│   ├── border             ← Light: #E2E8F0 / Dark: #334155
│   ├── error              ← #EF4444
│   └── success            ← #22C55E
│
├── typography
│   ├── fontFamily         ← System font (San Francisco / Roboto)
│   ├── sizes
│   │   ├── xs: 12
│   │   ├── sm: 14
│   │   ├── base: 16       ← Minimum body text size (accessibility)
│   │   ├── lg: 18
│   │   ├── xl: 20
│   │   ├── 2xl: 24
│   │   └── 3xl: 30
│   └── weights
│       ├── regular: "400"
│       ├── medium: "500"
│       ├── semibold: "600"
│       └── bold: "700"
│
├── spacing               ← 8px grid system
│   ├── xs: 4
│   ├── sm: 8
│   ├── md: 16
│   ├── lg: 24
│   ├── xl: 32
│   └── 2xl: 48
│
├── radius
│   ├── sm: 4
│   ├── md: 8
│   ├── lg: 12
│   ├── xl: 16
│   └── full: 9999
│
└── shadows
    ├── sm                 ← Cards, subtle elevation
    ├── md                 ← Modals, floating elements
    └── lg                 ← Popovers, dropdowns
```

### Usage in components

```tsx
function PostCard({ post }: Props) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        ...theme.shadows.sm,
      }}
    >
      <Text
        style={{
          color: theme.colors.text,
          fontSize: theme.typography.sizes.base,
        }}
      >
        {post.body}
      </Text>
    </View>
  );
}
```

When the user switches families, `FamilyProvider` updates the active family, `ThemeProvider` reads the new accent palette, and the entire app re-themes without a restart.

---

## Navigation

The app uses a tab-based layout with five main tabs and a stack navigator per tab for drill-down screens. An `AppHeader` sits above the tab content with the family switcher and invite button.

### Navigation structure

```
┌─────────────────────────────────────────────────────────┐
│                      RootNavigator                       │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │              AuthNavigator                       │   │
│   │   (shown when not authenticated)                 │   │
│   │                                                 │   │
│   │   LoginScreen ──► OtpScreen                     │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │           OnboardingNavigator                    │   │
│   │   (shown after auth, before family join/create)  │   │
│   │                                                 │   │
│   │   WelcomeScreen ──► CreateProfileScreen          │   │
│   │        ──► JoinOrCreateFamilyScreen              │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │             MainNavigator                        │   │
│   │   (shown when authenticated + has family)        │   │
│   │                                                 │   │
│   │   ┌─────────────────────────────────────────┐   │   │
│   │   │            AppHeader                     │   │   │
│   │   │  ┌──────────────┐  ┌──────────────────┐ │   │   │
│   │   │  │Family Switcher│  │ + Invite Button  │ │   │   │
│   │   │  │  (dropdown)  │  │                  │ │   │   │
│   │   │  └──────────────┘  └──────────────────┘ │   │   │
│   │   └─────────────────────────────────────────┘   │   │
│   │                                                 │   │
│   │   ┌─────────────────────────────────────────┐   │   │
│   │   │           TabNavigator                   │   │   │
│   │   │                                         │   │   │
│   │   │  Feed  Calendar  Tree  Chores  More     │   │   │
│   │   │   │       │       │      │       │      │   │   │
│   │   │   ▼       ▼       ▼      ▼       ▼      │   │   │
│   │   │  Stack   Stack   Stack  Stack   Stack   │   │   │
│   │   └─────────────────────────────────────────┘   │   │
│   └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Tab detail

```
TabNavigator
├── Feed Tab
│   ├── FeedScreen              (list of posts)
│   ├── PostDetailScreen        (single post + comments)
│   └── CreatePostScreen        (compose new post)
│
├── Calendar Tab
│   ├── CalendarScreen          (month/week view)
│   ├── EventDetailScreen       (single event)
│   └── CreateEventScreen       (create/edit event)
│
├── Tree Tab
│   └── TreeScreen              (interactive family tree canvas)
│
├── Chores Tab
│   ├── ChoresScreen            (chore list with filters)
│   ├── ChoreDetailScreen       (single chore + history)
│   └── CreateChoreScreen       (create/edit chore)
│
└── More Tab
    ├── MoreScreen              (settings menu)
    ├── FamilySettingsScreen    (accent color, members, roles)
    ├── MembersScreen           (member list)
    ├── RelationshipScreen      (manage relationships)
    ├── NotificationsScreen     (notification list + preferences)
    └── ProfileScreen           (edit own profile)
```

### AppHeader behavior

The `AppHeader` is rendered outside the tab navigator so it persists across all tabs. It contains:

- **Family switcher** (left): a dropdown showing all families the user belongs to. Tapping switches the active family, which triggers `FamilyProvider` to update, re-themes the app, and refetches all queries scoped to the new family.
- **Invite button** (right): opens an invite sheet for the currently active family. Only visible to members with admin or owner role.

---

## Providers and Component Hierarchy

The root of the app composes several providers. Order matters: each provider can depend on providers above it.

### Component hierarchy

```
<App>
│
├── <QueryProvider>                     ← TanStack Query client
│   │
│   ├── <AuthProvider>                  ← Cognito session, user object
│   │   │
│   │   ├── <FamilyProvider>            ← Active family, family list
│   │   │   │
│   │   │   ├── <ThemeProvider>         ← Theme from family accent + dark mode
│   │   │   │   │
│   │   │   │   ├── <ErrorBoundary>     ← Top-level crash boundary
│   │   │   │   │   │
│   │   │   │   │   └── <RootNavigator> ← Auth / Onboarding / Main switch
│   │   │   │   │       │
│   │   │   │   │       ├── AuthNavigator
│   │   │   │   │       ├── OnboardingNavigator
│   │   │   │   │       └── MainNavigator
│   │   │   │   │           ├── AppHeader
│   │   │   │   │           └── TabNavigator
│   │   │   │   │               ├── FeedStack
│   │   │   │   │               ├── CalendarStack
│   │   │   │   │               ├── TreeStack
│   │   │   │   │               ├── ChoresStack
│   │   │   │   │               └── MoreStack
│   │   │   │   │
│   │   │   │   │
```

### Provider responsibilities

| Provider         | Context value                                         | Depends on                          |
| ---------------- | ----------------------------------------------------- | ----------------------------------- |
| `QueryProvider`  | QueryClient instance                                  | Nothing                             |
| `AuthProvider`   | `{ user, isAuthenticated, signIn, signOut, session }` | QueryProvider (for auth queries)    |
| `FamilyProvider` | `{ activeFamily, families, switchFamily, isLoading }` | AuthProvider (needs user ID)        |
| `ThemeProvider`  | `{ theme, colorScheme, toggleColorScheme }`           | FamilyProvider (needs accent color) |

### Provider data flow

```
  QueryProvider
       │
       │  Provides: QueryClient
       ▼
  AuthProvider
       │
       │  Reads: Cognito session
       │  Provides: user, isAuthenticated
       ▼
  FamilyProvider
       │
       │  Reads: user.id from AuthProvider
       │  Queries: user's families via TanStack Query
       │  Provides: activeFamily, families, switchFamily()
       ▼
  ThemeProvider
       │
       │  Reads: activeFamily.accentColor from FamilyProvider
       │  Reads: device colorScheme (useColorScheme)
       │  Provides: resolved theme object
       ▼
  Screens + Components
       │
       │  useTheme()   → theme tokens
       │  useAuth()    → user, signOut
       │  useFamily()  → activeFamily, switchFamily
```

---

## Shared Components

Shared components live in `src/shared/components/` and are used across multiple features.

### EmptyState

Displayed when a list query returns zero results. Accepts an illustration, title, description, and optional action button.

```
┌─────────────────────────────────┐
│                                 │
│      ┌───────────────────┐      │
│      │  Illustration     │      │
│      │  (or placeholder) │      │
│      └───────────────────┘      │
│                                 │
│        No posts yet             │
│                                 │
│   Share your first moment       │
│   with the family.              │
│                                 │
│      ┌─────────────────┐        │
│      │  Create Post     │        │
│      └─────────────────┘        │
│                                 │
└─────────────────────────────────┘
```

### ErrorBoundary

Wraps the navigation tree. Catches unhandled JavaScript errors and renders a fallback screen with a retry button. In development, shows the error stack. In production, logs to an error reporting service and shows a friendly message.

### IllustrationPlaceholder

A generic colored rectangle with an icon, used as a stand-in where custom illustrations have not yet been designed. Tints to the active family's accent color using the theme.

---

## Conventions

### File naming

| Type       | Convention                     | Example                         |
| ---------- | ------------------------------ | ------------------------------- |
| Screen     | `PascalCase` + `Screen` suffix | `FeedScreen.tsx`                |
| Hook       | `camelCase` + `use` prefix     | `useFeed.ts`                    |
| Component  | `PascalCase`                   | `PostCard.tsx`                  |
| API file   | `camelCase`                    | `feedApi.ts`                    |
| Query keys | `camelCase` + `Keys` suffix    | `feedKeys.ts`                   |
| Types      | `PascalCase`                   | `Post.ts` (in `@family/shared`) |

### Hook rules

1. One primary hook per screen, named after the screen (e.g., `FeedScreen` uses `useFeed`).
2. Hooks return a flat object: `{ data, isLoading, error, onAction }`.
3. Hooks never return JSX.
4. Complex features may compose multiple smaller hooks inside the primary hook.

### Import rules

1. Screens import from `hooks/` and `components/` within the same feature.
2. Hooks import from `api/` within the same feature.
3. Any file may import from `shared/`.
4. No feature-to-feature direct imports.
5. Shared types come from the `@family/shared` package.

### Accessibility

- Minimum font size: 16px for body text (enforced by typography tokens).
- All interactive elements have `accessibilityLabel` and `accessibilityRole`.
- Color contrast ratios meet WCAG AA (4.5:1 for normal text, 3:1 for large text).
- Touch targets are at minimum 44x44pt.
