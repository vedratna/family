import type { Role } from "@family-app/shared";
import { useMemo, useState, type SyntheticEvent } from "react";
import { Link } from "react-router";

import { useInviteMember } from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import { toMemberItems } from "../lib/transforms";
import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";

const ROLE_STYLES: Record<string, string> = {
  owner: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  editor: "bg-green-100 text-green-800",
  viewer: "bg-gray-100 text-gray-800",
};

const ROLE_OPTIONS: Role[] = ["owner", "admin", "editor", "viewer"];

export function MembersPage() {
  const { persons, memberships } = useMockData();
  const { activeFamilyId, activeFamily } = useFamily();
  const { inviteMember, loading: inviteLoading } = useInviteMember();

  const [showForm, setShowForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [role, setRole] = useState<Role>("viewer");

  const members = useMemo(
    () => toMemberItems(persons, memberships, activeFamilyId),
    [persons, memberships, activeFamilyId],
  );

  function handleInvite(e: SyntheticEvent) {
    e.preventDefault();
    if (!phone.trim() || !name.trim()) return;

    const input = {
      familyId: activeFamilyId,
      phone: phone.trim(),
      name: name.trim(),
      relationship: relationship.trim() || undefined,
      role,
    };

    if (isApiMode()) {
      void inviteMember({ input });
    } else {
      console.log("[mock] inviteMember:", input);
    }

    setPhone("");
    setName("");
    setRelationship("");
    setRole("viewer");
    setShowForm(false);
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link to="/settings" className="text-sm text-[var(--color-accent-primary)] hover:underline">
        &larr; Back to Settings
      </Link>

      <div className="flex items-center justify-between mt-4 mb-1">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Members</h1>
        <button
          onClick={() => {
            setShowForm((v) => !v);
          }}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity"
        >
          {showForm ? "Cancel" : "Invite"}
        </button>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        {activeFamily?.name ?? "Family"} &middot; {members.length} members
      </p>

      {showForm && (
        <form
          onSubmit={handleInvite}
          className="mb-4 p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)] flex flex-col gap-3"
        >
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
            }}
            placeholder="Phone number"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            placeholder="Name"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
          <input
            type="text"
            value={relationship}
            onChange={(e) => {
              setRelationship(e.target.value);
            }}
            placeholder="Relationship (e.g. Sister, Uncle)"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value as Role);
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={inviteLoading || !phone.trim() || !name.trim()}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {inviteLoading ? "Inviting..." : "Send Invite"}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-2">
        {members.map((member) => (
          <div
            key={member.personId}
            className="flex items-center justify-between p-3 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border-secondary)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center text-sm font-semibold text-[var(--color-accent-primary)]">
                {member.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {member.name}
                </p>
                {member.hasAppAccount && (
                  <p className="text-xs text-[var(--color-text-tertiary)]">App account linked</p>
                )}
              </div>
            </div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_STYLES[member.role] ?? ""}`}
            >
              {member.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
