import type { ThemeName, NotificationCategory, Role } from "@family-app/shared";
import { useCallback, useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";
import { useNavigation } from "../shared/navigation/ScreenRouter";

interface MemberItem {
  personId: string;
  name: string;
  role: Role;
  hasAppAccount: boolean;
}

interface MembersListScreenProps {
  familyName: string;
  members: MemberItem[];
  canManage: boolean;
  onMemberPress: (personId: string) => void;
  onInvitePress: () => void;
}

interface FamilySettingsScreenProps {
  familyName: string;
  currentTheme: ThemeName;
  canManage: boolean;
  onThemeChange: (themeName: ThemeName) => void;
}

interface PreferenceItem {
  category: NotificationCategory;
  label: string;
  description: string;
  enabled: boolean;
}

interface PreferenceGroup {
  title: string;
  items: PreferenceItem[];
}

interface NotificationPreferencesScreenProps {
  groups: PreferenceGroup[];
  onToggle: (category: string, enabled: boolean) => void;
}

interface FamilyItem {
  id: string;
  name: string;
  themeName: ThemeName;
  role: Role;
  isActive: boolean;
}

interface FamilySwitcherScreenProps {
  families: FamilyItem[];
  onSelectFamily: (familyId: string) => void;
  onCreateFamily: () => void;
}

const CATEGORY_LABELS: Record<
  NotificationCategory,
  { label: string; description: string; group: string }
> = {
  "events-reminders": {
    label: "Event Reminders",
    description: "Get notified about upcoming events",
    group: "Events",
  },
  "social-feed": {
    label: "New Posts",
    description: "Notifications when family members post",
    group: "Social",
  },
  "social-comments-on-own": {
    label: "Comments on Your Posts",
    description: "Notifications when someone comments on your posts",
    group: "Social",
  },
  "family-updates": {
    label: "Family Updates",
    description: "Changes to family settings and membership",
    group: "Family",
  },
};

// Placeholder screen components
function MembersListScreen(_props: MembersListScreenProps) {
  return null;
}

function FamilySettingsScreen(_props: FamilySettingsScreenProps) {
  return null;
}

function NotificationPreferencesScreen(_props: NotificationPreferencesScreenProps) {
  return null;
}

function FamilySwitcherScreen(_props: FamilySwitcherScreenProps) {
  return null;
}

function MoreMenu({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const items = [
    { screen: "members", label: "Members" },
    { screen: "settings", label: "Family Settings" },
    { screen: "notifications", label: "Notifications" },
    { screen: "switcher", label: "Switch Family" },
  ];

  return (
    <View>
      {items.map((item) => (
        <Pressable
          key={item.screen}
          onPress={() => {
            onNavigate(item.screen);
          }}
        >
          <Text>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function MoreContainer() {
  const { persons, memberships, families, notificationPrefs } = useMockData();
  const { activeFamilyId, activeFamily, activeThemeName, switchFamily } = useFamily();
  const { screenState, navigate, goBack } = useNavigation();

  const members = useMemo<MemberItem[]>(() => {
    const familyMemberships = memberships.filter((m) => m.familyId === activeFamilyId);
    return familyMemberships.map((m) => {
      const person = persons.find((p) => p.id === m.personId);
      return {
        personId: m.personId,
        name: person?.name ?? m.personId,
        role: m.role,
        hasAppAccount: person?.userId !== undefined,
      };
    });
  }, [memberships, activeFamilyId, persons]);

  const prefGroups = useMemo<PreferenceGroup[]>(() => {
    const grouped = new Map<string, PreferenceItem[]>();
    for (const pref of notificationPrefs.filter((p) => p.familyId === activeFamilyId)) {
      const meta = CATEGORY_LABELS[pref.category];
      const item: PreferenceItem = {
        category: pref.category,
        label: meta.label,
        description: meta.description,
        enabled: pref.enabled,
      };
      const existing = grouped.get(meta.group);
      if (existing) {
        existing.push(item);
      } else {
        grouped.set(meta.group, [item]);
      }
    }
    return [...grouped.entries()].map(([title, items]) => ({ title, items }));
  }, [notificationPrefs, activeFamilyId]);

  const familyItems = useMemo<FamilyItem[]>(() => {
    return families.map((f) => {
      const membership = memberships.find((m) => m.familyId === f.id);
      return {
        id: f.id,
        name: f.name,
        themeName: f.themeName,
        role: membership?.role ?? "viewer",
        isActive: f.id === activeFamilyId,
      };
    });
  }, [families, memberships, activeFamilyId]);

  const onNavigate = useCallback(
    (screen: string) => {
      navigate(screen);
    },
    [navigate],
  );

  const onSelectFamily = useCallback(
    (familyId: string) => {
      switchFamily(familyId);
      goBack();
    },
    [switchFamily, goBack],
  );

  if (screenState.screen === "members") {
    return (
      <>
        <Pressable onPress={goBack}>
          <Text>{"← Back"}</Text>
        </Pressable>
        <MembersListScreen
          familyName={activeFamily?.name ?? ""}
          members={members}
          canManage={true}
          onMemberPress={() => {}}
          onInvitePress={() => {}}
        />
      </>
    );
  }

  if (screenState.screen === "settings") {
    return (
      <>
        <Pressable onPress={goBack}>
          <Text>{"← Back"}</Text>
        </Pressable>
        <FamilySettingsScreen
          familyName={activeFamily?.name ?? ""}
          currentTheme={activeThemeName}
          canManage={true}
          onThemeChange={() => {}}
        />
      </>
    );
  }

  if (screenState.screen === "notifications") {
    return (
      <>
        <Pressable onPress={goBack}>
          <Text>{"← Back"}</Text>
        </Pressable>
        <NotificationPreferencesScreen groups={prefGroups} onToggle={() => {}} />
      </>
    );
  }

  if (screenState.screen === "switcher") {
    return (
      <>
        <Pressable onPress={goBack}>
          <Text>{"← Back"}</Text>
        </Pressable>
        <FamilySwitcherScreen
          families={familyItems}
          onSelectFamily={onSelectFamily}
          onCreateFamily={() => {}}
        />
      </>
    );
  }

  return <MoreMenu onNavigate={onNavigate} />;
}
