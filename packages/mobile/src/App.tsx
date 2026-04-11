import { useState, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

import { CalendarContainer } from "./containers/CalendarContainer";
import { ChoresContainer } from "./containers/ChoresContainer";
import { FeedContainer } from "./containers/FeedContainer";
import { MoreContainer } from "./containers/MoreContainer";
import { TreeContainer } from "./containers/TreeContainer";
import { ConfigProvider } from "./providers/ConfigProvider";
import { FamilyProvider, useFamily } from "./providers/FamilyProvider";
import { MockDataProvider } from "./providers/MockDataProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { AppHeader } from "./shared/navigation/AppHeader";
import { ScreenRouter } from "./shared/navigation/ScreenRouter";
import { TabNavigator, type TabKey } from "./shared/navigation/TabNavigator";
import { buildTheme, ThemeProvider } from "./shared/theme";

function TabContent({ tab }: { tab: TabKey }) {
  switch (tab) {
    case "feed":
      return <FeedContainer />;
    case "calendar":
      return <CalendarContainer />;
    case "tree":
      return <TreeContainer />;
    case "chores":
      return <ChoresContainer />;
    case "more":
      return <MoreContainer />;
  }
}

function AppContent() {
  const { activeFamily, activeThemeName, families, memberCount, switchFamily } = useFamily();
  const [activeTab, setActiveTab] = useState<TabKey>("feed");
  const [isDark] = useState(false);

  const theme = useMemo(() => buildTheme(activeThemeName, isDark), [activeThemeName, isDark]);

  return (
    <ThemeProvider value={theme}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      >
        <AppHeader
          familyName={activeFamily?.name ?? "FamilyApp"}
          showInviteButton={memberCount < 2}
          onFamilySwitcher={() => {
            const currentIndex = families.findIndex((f) => f.id === activeFamily?.id);
            const nextIndex = (currentIndex + 1) % families.length;
            const nextFamily = families[nextIndex];
            if (nextFamily !== undefined) {
              switchFamily(nextFamily.id);
            }
          }}
          onNotifications={() => {
            setActiveTab("more");
          }}
          onInvite={() => {}}
        />

        <ScreenRouter activeTab={activeTab} onTabChange={setActiveTab}>
          {() => (
            <View style={styles.content}>
              <TabContent tab={activeTab} />
            </View>
          )}
        </ScreenRouter>

        <TabNavigator activeTab={activeTab} onTabPress={setActiveTab} />
      </SafeAreaView>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ConfigProvider>
          <QueryProvider>
            <MockDataProvider>
              <FamilyProvider>
                <AppContent />
              </FamilyProvider>
            </MockDataProvider>
          </QueryProvider>
        </ConfigProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
