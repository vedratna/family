import { useState, useMemo } from "react";
import { SafeAreaView, StyleSheet } from "react-native";

import { ConfigProvider } from "./providers/ConfigProvider";
import { FamilyProvider, useFamily } from "./providers/FamilyProvider";
import { MockDataProvider } from "./providers/MockDataProvider";
import { QueryProvider } from "./providers/QueryProvider";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { AppHeader } from "./shared/navigation/AppHeader";
import { TabNavigator, type TabKey } from "./shared/navigation/TabNavigator";
import { buildTheme, ThemeProvider } from "./shared/theme";

function AppContent() {
  const { activeFamily, activeThemeName, families, memberCount, switchFamily } = useFamily();
  const [activeTab, setActiveTab] = useState<TabKey>("feed");
  const [isDark] = useState(false);

  const theme = useMemo(() => buildTheme(activeThemeName, isDark), [activeThemeName, isDark]);

  return (
    <ThemeProvider value={theme}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <AppHeader
          familyName={activeFamily?.name ?? "FamilyApp"}
          showInviteButton={memberCount < 2}
          onFamilySwitcher={() => {
            // Cycle through families for demo
            const currentIndex = families.findIndex((f) => f.id === activeFamily?.id);
            const nextIndex = (currentIndex + 1) % families.length;
            const nextFamily = families[nextIndex];
            if (nextFamily !== undefined) {
              switchFamily(nextFamily.id);
            }
          }}
          onNotifications={() => { setActiveTab("more"); }}
          onInvite={() => {}}
        />

        {/* Screen content would render here based on activeTab */}
        {/* For now, the tab navigator provides the navigation shell */}

        <TabNavigator activeTab={activeTab} onTabPress={setActiveTab} />
      </SafeAreaView>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider>
        <QueryProvider>
          <MockDataProvider>
            <FamilyProvider>
              <AppContent />
            </FamilyProvider>
          </MockDataProvider>
        </QueryProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
