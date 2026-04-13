import type { ThemeName } from "@family-app/shared";
import { useState, type SyntheticEvent } from "react";
import { useNavigate } from "react-router";

import { formatErrorMessage } from "../lib/error-utils";
import {
  useCreateFamily,
  useMyInvitations,
  useAcceptInvitation,
  type InvitationWithContext,
} from "../lib/hooks";
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

const THEME_COLORS: Record<string, string> = {
  teal: "#2B8A7E",
  indigo: "#5B5FC7",
  coral: "#C96B5B",
  sage: "#6B8F71",
  amber: "#B8860B",
  ocean: "#3A7CA5",
  plum: "#8B5E83",
  slate: "#64748B",
};

function InvitationCard({
  invitation,
  displayName,
  onAccepted,
}: {
  invitation: InvitationWithContext;
  displayName: string;
  onAccepted: () => void;
}) {
  const { acceptInvitation, loading } = useAcceptInvitation();
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    setError(null);
    const result = await acceptInvitation({
      familyId: invitation.familyId,
      phone: invitation.phone,
      displayName,
    });
    if (result.error) {
      setError(formatErrorMessage(result.error));
      return;
    }
    onAccepted();
  }

  const themeColor = THEME_COLORS[invitation.familyThemeName] ?? "#2B8A7E";

  return (
    <div className="p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)]">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex-shrink-0"
          style={{ backgroundColor: themeColor }}
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {invitation.familyName}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {invitation.inviterName} invited you as {invitation.relationshipToInviter} (
            {invitation.role})
          </p>
        </div>
      </div>
      {error !== null && <p className="text-sm text-red-600 mb-2">{error}</p>}
      <button
        type="button"
        onClick={() => {
          void handleAccept();
        }}
        disabled={loading}
        className="w-full py-2 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? "Joining..." : `Join ${invitation.familyName}`}
      </button>
    </div>
  );
}

export function CreateFirstFamilyPage() {
  const { createFamily, loading: creating } = useCreateFamily();
  const { refetchFamilies } = useFamily();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch invitations (API mode only)
  const { data: invData, reexecute: refetchInvitations } = useMyInvitations(!isApiMode());
  const invitations = invData?.myInvitations ?? [];

  const [mode, setMode] = useState<"invitations" | "create">(
    invitations.length > 0 ? "invitations" : "create",
  );
  const [familyName, setFamilyName] = useState("");
  const [themeName, setThemeName] = useState<ThemeName>("teal");
  const [error, setError] = useState<string | null>(null);

  function handleSignOut() {
    logout();
    void navigate("/login");
  }

  async function handleCreate(e: SyntheticEvent) {
    e.preventDefault();
    if (!familyName.trim()) return;
    setError(null);
    const result = await createFamily({ name: familyName.trim(), themeName });
    if (result.error) {
      setError(formatErrorMessage(result.error));
      return;
    }
    refetchFamilies();
    void navigate("/feed");
  }

  function handleAccepted() {
    refetchFamilies();
    refetchInvitations({ requestPolicy: "network-only" });
    void navigate("/feed");
  }

  // Default to invitations tab if they exist, create tab otherwise
  const activeMode = invitations.length > 0 ? mode : "create";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-primary)] p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            Welcome to Family App!
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {currentUser !== null ? `Signed in as ${currentUser.displayName}` : "Get started below"}
          </p>
          {currentUser !== null && (
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-2 text-xs text-[var(--color-text-tertiary)] underline hover:text-[var(--color-text-secondary)]"
            >
              Not you? Sign out
            </button>
          )}
        </div>

        {invitations.length > 0 && (
          <div className="mb-4 flex rounded-lg bg-[var(--color-bg-secondary)] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("invitations");
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                activeMode === "invitations"
                  ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              Invitations ({invitations.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("create");
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                activeMode === "create"
                  ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-sm"
                  : "text-[var(--color-text-secondary)]"
              }`}
            >
              Create New
            </button>
          </div>
        )}

        {activeMode === "invitations" && invitations.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-[var(--color-text-secondary)]">
              You have {invitations.length} pending invitation
              {invitations.length === 1 ? "" : "s"}.
            </p>
            {invitations.map((inv) => (
              <InvitationCard
                key={inv.familyId}
                invitation={inv}
                displayName={currentUser?.displayName ?? "Member"}
                onAccepted={handleAccepted}
              />
            ))}
          </div>
        )}

        {activeMode === "create" && (
          <form
            onSubmit={(e) => {
              void handleCreate(e);
            }}
            className="p-6 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)] flex flex-col gap-5"
          >
            <div>
              <label
                htmlFor="family-name"
                className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
              >
                Family Name
              </label>
              <input
                id="family-name"
                type="text"
                value={familyName}
                onChange={(e) => {
                  setFamilyName(e.target.value);
                }}
                placeholder="e.g. The Johnson Family"
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">Theme</p>
              <div className="flex flex-wrap gap-3">
                {THEME_OPTIONS.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => {
                      setThemeName(theme.name);
                    }}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      theme.name === themeName
                        ? "border-[var(--color-text-primary)] scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: theme.color }}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

            {error !== null && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={creating || !familyName.trim()}
              className="w-full py-2.5 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Family"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
