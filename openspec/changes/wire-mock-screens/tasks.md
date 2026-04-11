## 1. Navigation State Infrastructure

- [x] 1.1 Create `ScreenRouter` component with tab-to-screen mapping and `screenStack` state (one active screen name per tab)
- [x] 1.2 Add `navigate(screen, params?)` and `goBack()` helpers that update screenStack state
- [x] 1.3 Wire ScreenRouter into App.tsx between AppHeader and TabNavigator — renders the active screen for the current tab

## 2. Tab Container Components

- [x] 2.1 Create `FeedContainer` — reads useMockData(), transforms to FeedItem[], tracks selectedPostId, renders FeedScreen or CommentsScreen
- [x] 2.2 Create `CalendarContainer` — reads useMockData(), transforms to AgendaEvent[], tracks view mode (agenda/month) and selectedEventId, renders AgendaScreen, CalendarMonthScreen, or EventDetailScreen
- [x] 2.3 Create `TreeContainer` — reads useMockData(), transforms to TreeNodeData[], tracks selectedPersonId, renders FamilyTreeScreen or PersonRelationshipsScreen
- [x] 2.4 Create `ChoresContainer` — reads useMockData(), transforms to ChoreItem[], renders ChoreListScreen
- [x] 2.5 Create `MoreMenu` component — list of links to Members, Settings, Notifications, Family Switcher
- [x] 2.6 Create `MoreContainer` — tracks active sub-screen, renders MoreMenu or MembersListScreen, FamilySettingsScreen, NotificationPreferencesScreen, FamilySwitcherScreen

## 3. Data Transformation

- [x] 3.1 Write mock data → FeedItem[] transformation (merge posts + events into time-ordered feed, compute reactionCount/commentCount from mock data)
- [x] 3.2 Write mock data → AgendaSection[] transformation (group events by date, format date labels)
- [x] 3.3 Write mock data → TreeNodeData[] transformation (map MOCK_FAMILY_TREE to screen props)
- [x] 3.4 Write mock data → ChoreItem[] transformation (map MOCK_CHORES to screen props with assignee names)
- [x] 3.5 Write mock data → member list, settings, notification prefs transformations for More sub-screens

## 4. Family Switching

- [x] 4.1 Filter mock data by active family in each container (posts, events, chores, members belong to specific families)
- [x] 4.2 Verify theme updates when family switches (header color, accent color changes visible)

## 5. Verification

- [x] 5.1 Tap each tab — confirm screen renders with data (Feed, Calendar, Tree, Chores, More)
- [x] 5.2 Tap into detail screens — confirm comments, event detail, person relationships, member management all render
- [x] 5.3 Switch families — confirm data and theme change across all tabs
- [x] 5.4 Lint, typecheck, and tests pass
