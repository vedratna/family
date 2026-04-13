import type { ThemeName } from "@family-app/shared";
import { Link, useNavigate } from "react-router";

import { useUpdateFamilyTheme } from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import { useAuth } from "../providers/AuthProvider";
import { useFamily } from "../providers/FamilyProvider";

const THEME_OPTIONS: { name: ThemeName; color: string }[] = [
  { name: "teal", color: "#2B8A7E" },
  { name: "indigo", color: "#5B5FC7" },
  { name: "coral", color: "#C96B5B" },
  { name: "sage", color: "#6B8F71" },
  { name: "amber", color: "#B8860B" },
  { name: "ocean", color: "#3A7CA5" },
  { name: "plum", color: "#8B5E83" },
  { name: "slate", color: "#64748B" },
];

export function SettingsPage() {
  const { families, activeFamilyId, activeThemeName, switchFamily, refetchFamilies } = useFamily();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { updateFamilyTheme } = useUpdateFamilyTheme();

  function handleLogout() {
    logout();
    void navigate("/login");
  }

  function handleThemeChange(themeName: ThemeName) {
    if (isApiMode()) {
      void updateFamilyTheme({ input: { familyId: activeFamilyId, themeName } }).then(() => {
        refetchFamilies();
      });
    } else {
      console.log("[mock] updateFamilyTheme:", { familyId: activeFamilyId, themeName });
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">Settings</h1>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)] hover:border-red-400 transition-colors mb-6 text-left"
      >
        <span className="text-sm font-medium text-red-600">Log out</span>
      </button>

      {/* Members link */}
      <Link
        to="/settings/members"
        className="block p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)] hover:border-[var(--color-border-primary)] transition-colors mb-6"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Members</span>
          <span className="text-[var(--color-text-tertiary)]">&rarr;</span>
        </div>
      </Link>

      {/* Theme picker */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">Theme</h2>
        <div className="flex flex-wrap gap-3">
          {THEME_OPTIONS.map((theme) => (
            <button
              key={theme.name}
              onClick={() => {
                handleThemeChange(theme.name);
              }}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                theme.name === activeThemeName
                  ? "border-[var(--color-text-primary)] scale-110"
                  : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: theme.color }}
              title={theme.name}
            />
          ))}
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
          Current: {activeThemeName} (theme is set per family)
        </p>
      </div>

      {/* Family switcher */}
      <div>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">Families</h2>
        <div className="flex flex-col gap-2">
          {families.map((family) => (
            <button
              key={family.id}
              onClick={() => {
                switchFamily(family.id);
              }}
              className={`p-3 rounded-lg border text-left transition-colors ${
                family.id === activeFamilyId
                  ? "bg-[var(--color-accent-light)] border-[var(--color-accent-primary)]"
                  : "bg-[var(--color-bg-card)] border-[var(--color-border-secondary)] hover:border-[var(--color-border-primary)]"
              }`}
            >
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{family.name}</p>
              {family.id === activeFamilyId && (
                <p className="text-xs text-[var(--color-accent-primary)] mt-0.5">Active</p>
              )}
            </button>
          ))}
          {families.length === 0 && (
            <p className="text-sm text-[var(--color-text-tertiary)]">No families yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
