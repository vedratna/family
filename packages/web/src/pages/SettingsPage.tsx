import type { ThemeName } from "@family-app/shared";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery } from "urql";

import { FilePicker } from "../components/FilePicker";
import { Toggle } from "../components/Toggle";
import { formatErrorMessage } from "../lib/error-utils";
import { NOTIFICATION_PREFS_QUERY } from "../lib/graphql-operations";
import {
  useUpdateFamilyTheme,
  useUpdateNotificationPref,
  useUpdateProfile,
  useGenerateUploadUrl,
  useConfirmMediaUpload,
} from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import { uploadMedia } from "../lib/upload";
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

interface NotifCategory {
  key: string;
  label: string;
  description: string;
}

const NOTIFICATION_CATEGORIES: NotifCategory[] = [
  {
    key: "events-reminders",
    label: "Events & Reminders",
    description: "Birthday, anniversary, and event reminders",
  },
  {
    key: "social-feed",
    label: "Social Feed",
    description: "New posts in the family feed",
  },
  {
    key: "social-comments-on-own",
    label: "Comments on My Posts",
    description: "When someone comments on a post you wrote",
  },
  {
    key: "family-updates",
    label: "Family Updates",
    description: "New members, role changes, family settings",
  },
];

interface NotifPref {
  userId: string;
  familyId: string;
  category: string;
  enabled: boolean;
}

export function SettingsPage() {
  const { families, activeFamilyId, activeThemeName, switchFamily, refetchFamilies } = useFamily();
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();
  const { updateFamilyTheme } = useUpdateFamilyTheme();
  const { updateNotificationPref } = useUpdateNotificationPref();
  const { updateProfile } = useUpdateProfile();
  const { generateUploadUrl } = useGenerateUploadUrl();
  const { confirmMediaUpload } = useConfirmMediaUpload();
  const [themeError, setThemeError] = useState<string | null>(null);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function handleProfilePhotoSelect(files: File[]) {
    const file = files[0];
    if (!file) return;
    setPhotoError(null);
    setPhotoUploading(true);
    try {
      if (!isApiMode()) {
        console.log("[mock] uploadProfilePhoto:", file.name);
        setProfilePhotoUrl(URL.createObjectURL(file));
        setPhotoUploading(false);
        return;
      }
      const uploaded = await uploadMedia(
        file,
        activeFamilyId,
        generateUploadUrl,
        confirmMediaUpload,
      );
      // Update profile with the new s3Key
      const result = await updateProfile({
        displayName: currentUser?.displayName ?? "",
        profilePhotoKey: uploaded.s3Key,
      });
      if (result.error) {
        setPhotoError(formatErrorMessage(result.error));
      } else {
        const data = result.data as
          | { updateProfile: { profilePhotoUrl: string | null } }
          | undefined;
        setProfilePhotoUrl(data?.updateProfile.profilePhotoUrl ?? null);
      }
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setPhotoUploading(false);
    }
  }

  const [prefsResult, reexecutePrefs] = useQuery({
    query: NOTIFICATION_PREFS_QUERY,
    variables: { familyId: activeFamilyId },
    pause: !isApiMode() || !activeFamilyId,
  });

  const prefMap = useMemo(() => {
    const data = prefsResult.data as { notificationPreferences: NotifPref[] } | undefined;
    const map = new Map<string, boolean>();
    for (const p of data?.notificationPreferences ?? []) {
      map.set(p.category, p.enabled);
    }
    return map;
  }, [prefsResult.data]);

  function handleNotifToggle(category: string, next: boolean) {
    setNotifError(null);
    setPendingCategory(category);
    if (!isApiMode()) {
      console.log("[mock] updateNotificationPref:", { category, enabled: next });
      setPendingCategory(null);
      return;
    }
    void updateNotificationPref({ familyId: activeFamilyId, category, enabled: next }).then(
      (result) => {
        setPendingCategory(null);
        if (result.error) {
          setNotifError(formatErrorMessage(result.error));
          return;
        }
        reexecutePrefs({ requestPolicy: "network-only" });
      },
    );
  }

  function handleLogout() {
    logout();
    void navigate("/login");
  }

  function handleThemeChange(themeName: ThemeName) {
    setThemeError(null);
    if (isApiMode()) {
      void updateFamilyTheme({ familyId: activeFamilyId, themeName }).then((result) => {
        if (result.error) {
          setThemeError(formatErrorMessage(result.error));
          return;
        }
        refetchFamilies();
      });
    } else {
      console.log("[mock] updateFamilyTheme:", { familyId: activeFamilyId, themeName });
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">Settings</h1>

      {/* Profile Photo */}
      <div className="mb-6 p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)]">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">
          Profile Photo
        </h2>
        <div className="flex items-center gap-4">
          {profilePhotoUrl !== null && profilePhotoUrl !== "" ? (
            <img
              src={profilePhotoUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full object-cover border border-[var(--color-border-secondary)]"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center text-xl font-semibold text-[var(--color-accent-primary)]">
              {currentUser?.displayName.charAt(0) ?? "?"}
            </div>
          )}
          <FilePicker
            onSelect={(files) => {
              void handleProfilePhotoSelect(files);
            }}
            accept="image/*"
            multiple={false}
            maxFiles={1}
            disabled={photoUploading}
          />
        </div>
        {photoUploading && (
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Uploading...</p>
        )}
        {photoError !== null && <p className="mt-2 text-sm text-red-600">{photoError}</p>}
      </div>

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
        {themeError !== null && <p className="text-sm text-red-600 mt-2">{themeError}</p>}
        <p className="text-xs text-[var(--color-text-tertiary)] mt-2">
          Current: {activeThemeName} (theme is set per family)
        </p>
      </div>

      {/* Notifications */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">
          Notifications
        </h2>
        <div className="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)] divide-y divide-[var(--color-border-secondary)]">
          {NOTIFICATION_CATEGORIES.map((cat) => {
            // Default to enabled if no record yet
            const enabled = prefMap.get(cat.key) ?? true;
            const isPending = pendingCategory === cat.key;
            return (
              <div key={cat.key} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {cat.label}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {cat.description}
                  </p>
                </div>
                <Toggle
                  checked={enabled}
                  disabled={isPending}
                  label={cat.label}
                  onChange={(next) => {
                    handleNotifToggle(cat.key, next);
                  }}
                />
              </div>
            );
          })}
        </div>
        {notifError !== null && <p className="text-sm text-red-600 mt-2">{notifError}</p>}
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
