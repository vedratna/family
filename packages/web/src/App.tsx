import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./layout/AppLayout";
import { isApiMode } from "./lib/mode";
import { CalendarMonthPage } from "./pages/CalendarMonthPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ChoresPage } from "./pages/ChoresPage";
import { CreateFirstFamilyPage } from "./pages/CreateFirstFamilyPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { FeedPage } from "./pages/FeedPage";
import { LoginPage } from "./pages/LoginPage";
import { MembersPage } from "./pages/MembersPage";
import { PersonPage } from "./pages/PersonPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TreePage } from "./pages/TreePage";
import { AuthProvider } from "./providers/AuthProvider";
import { FamilyProvider, useFamily } from "./providers/FamilyProvider";
import { GraphQLProvider } from "./providers/GraphQLProvider";
import { MockDataProvider } from "./providers/MockDataProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

function FamilyGate({ children }: { children: React.ReactNode }) {
  const { families, loading } = useFamily();

  if (isApiMode()) {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)]">
          <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>
        </div>
      );
    }
    if (families.length === 0) {
      return <CreateFirstFamilyPage />;
    }
  }

  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <GraphQLProvider>
        <MockDataProvider>
          <FamilyProvider>
            <ThemeProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="login" element={<LoginPage />} />
                  <Route
                    element={
                      <ProtectedRoute>
                        <FamilyGate>
                          <AppLayout />
                        </FamilyGate>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/feed" replace />} />
                    <Route path="feed" element={<FeedPage />} />
                    <Route path="feed/:postId" element={<PostDetailPage />} />
                    <Route path="calendar" element={<CalendarPage />} />
                    <Route path="calendar/month" element={<CalendarMonthPage />} />
                    <Route path="calendar/:eventId" element={<EventDetailPage />} />
                    <Route path="tree" element={<TreePage />} />
                    <Route path="tree/:personId" element={<PersonPage />} />
                    <Route path="chores" element={<ChoresPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="settings/members" element={<MembersPage />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </ThemeProvider>
          </FamilyProvider>
        </MockDataProvider>
      </GraphQLProvider>
    </AuthProvider>
  );
}
