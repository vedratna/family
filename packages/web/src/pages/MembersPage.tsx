import { useMemo } from "react";
import { Link } from "react-router";

import { toMemberItems } from "../lib/transforms";
import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";

const ROLE_STYLES: Record<string, string> = {
  owner: "bg-purple-100 text-purple-800",
  admin: "bg-blue-100 text-blue-800",
  editor: "bg-green-100 text-green-800",
  viewer: "bg-gray-100 text-gray-800",
};

export function MembersPage() {
  const { persons, memberships } = useMockData();
  const { activeFamilyId, activeFamily } = useFamily();

  const members = useMemo(
    () => toMemberItems(persons, memberships, activeFamilyId),
    [persons, memberships, activeFamilyId],
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link to="/settings" className="text-sm text-[var(--color-accent-primary)] hover:underline">
        &larr; Back to Settings
      </Link>

      <h1 className="text-xl font-bold text-[var(--color-text-primary)] mt-4 mb-1">Members</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        {activeFamily?.name ?? "Family"} &middot; {members.length} members
      </p>

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
