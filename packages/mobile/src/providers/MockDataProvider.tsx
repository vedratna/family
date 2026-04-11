import type { Family, Person, FamilyMembership, Relationship, Post, Comment, Reaction, FamilyEvent, EventRSVP, Chore, NotificationPreference } from "@family-app/shared";
import { createContext, useContext, type ReactNode } from "react";

import {
  MOCK_FAMILIES, MOCK_PERSONS, MOCK_MEMBERSHIPS,
  MOCK_RELATIONSHIPS, MOCK_POSTS, MOCK_COMMENTS, MOCK_REACTIONS,
  MOCK_EVENTS, MOCK_RSVPS, MOCK_CHORES, MOCK_NOTIFICATION_PREFS,
  MOCK_FAMILY_TREE,
} from "../mocks";

interface MockData {
  families: Family[];
  persons: Person[];
  memberships: FamilyMembership[];
  relationships: Relationship[];
  posts: Post[];
  comments: Comment[];
  reactions: Reaction[];
  events: FamilyEvent[];
  rsvps: EventRSVP[];
  chores: Chore[];
  notificationPrefs: NotificationPreference[];
  familyTree: typeof MOCK_FAMILY_TREE;
}

const mockData: MockData = {
  families: MOCK_FAMILIES,
  persons: MOCK_PERSONS,
  memberships: MOCK_MEMBERSHIPS,
  relationships: MOCK_RELATIONSHIPS,
  posts: MOCK_POSTS,
  comments: MOCK_COMMENTS,
  reactions: MOCK_REACTIONS,
  events: MOCK_EVENTS,
  rsvps: MOCK_RSVPS,
  chores: MOCK_CHORES,
  notificationPrefs: MOCK_NOTIFICATION_PREFS,
  familyTree: MOCK_FAMILY_TREE,
};

const MockDataContext = createContext(mockData);

interface MockDataProviderProps {
  children: ReactNode;
}

export function MockDataProvider({ children }: MockDataProviderProps) {
  return <MockDataContext.Provider value={mockData}>{children}</MockDataContext.Provider>;
}

export function useMockData(): MockData {
  return useContext(MockDataContext);
}
