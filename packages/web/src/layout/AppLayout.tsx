import { NavLink, Outlet } from "react-router";

import { AppHeader } from "./AppHeader";

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/feed", label: "Feed", icon: "\uD83D\uDCF0" },
  { to: "/calendar", label: "Calendar", icon: "\uD83D\uDCC5" },
  { to: "/tree", label: "Tree", icon: "\uD83C\uDF33" },
  { to: "/chores", label: "Chores", icon: "\u2705" },
  { to: "/settings", label: "Settings", icon: "\u2699\uFE0F" },
];

function navLinkClass({ isActive }: { isActive: boolean }): string {
  const base = "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors";
  if (isActive) {
    return `${base} bg-[var(--color-accent-light)] text-[var(--color-accent-primary)]`;
  }
  return `${base} text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]`;
}

function bottomNavLinkClass({ isActive }: { isActive: boolean }): string {
  const base = "flex flex-col items-center gap-0.5 text-xs font-medium transition-colors py-1";
  if (isActive) {
    return `${base} text-[var(--color-accent-primary)]`;
  }
  return `${base} text-[var(--color-text-tertiary)]`;
}

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <AppHeader />
      <div className="flex">
        {/* Desktop sidebar */}
        <nav className="hidden md:flex flex-col w-[200px] min-h-[calc(100vh-52px)] p-3 gap-1 border-r border-[var(--color-border-primary)] bg-[var(--color-bg-card)]">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-52px)] pb-16 md:pb-0">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center h-14 bg-[var(--color-bg-card)] border-t border-[var(--color-border-primary)]">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={bottomNavLinkClass}>
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
