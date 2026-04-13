import { BrowserRouter, Routes, Route, Navigate } from "react-router";

import { AppLayout } from "./layout/AppLayout";
import { CalendarMonthPage } from "./pages/CalendarMonthPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ChoresPage } from "./pages/ChoresPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { FeedPage } from "./pages/FeedPage";
import { MembersPage } from "./pages/MembersPage";
import { PersonPage } from "./pages/PersonPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TreePage } from "./pages/TreePage";
import { FamilyProvider } from "./providers/FamilyProvider";
import { MockDataProvider } from "./providers/MockDataProvider";
import { ThemeProvider } from "./providers/ThemeProvider";

export function App() {
  return (
    <MockDataProvider>
      <FamilyProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
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
  );
}
