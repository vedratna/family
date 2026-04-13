import type { Role, Person } from "@family-app/shared";
import { useMemo, useState, type SyntheticEvent } from "react";
import { Link } from "react-router";
import { useQuery } from "urql";

import { ConfirmModal } from "../components/ConfirmModal";
import { Loading } from "../components/Loading";
import { QueryError } from "../components/QueryError";
import { formatErrorMessage } from "../lib/error-utils";
import { FAMILY_MEMBERS_QUERY } from "../lib/graphql-operations";
import { useInviteMember, useRemoveMember, useUpdateMemberRole } from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import { canManageMembers } from "../lib/permissions";
import { toMemberItems, type MemberItem } from "../lib/transforms";
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
  const mockData = useMockData();
  const { activeFamilyId, activeFamily, activePersonId, activeRole } = useFamily();
  const { inviteMember, loading: inviteLoading } = useInviteMember();
  const { removeMember, loading: removeLoading } = useRemoveMember();
  const { updateMemberRole } = useUpdateMemberRole();

  const [showForm, setShowForm] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const [membersResult, reexecuteMembers] = useQuery({
    query: FAMILY_MEMBERS_QUERY,
    variables: { familyId: activeFamilyId },
    pause: !isApiMode() || !activeFamilyId,
  });

  const members = useMemo((): MemberItem[] | null => {
    if (isApiMode()) {
      if (membersResult.fetching) return null;
      const raw = membersResult.data as
        | {
            familyMembers: {
              person: Person & { profilePhotoUrl?: string };
              role: string;
              joinedAt: string;
              hasAppAccount: boolean;
            }[];
          }
        | undefined;
      return (raw?.familyMembers ?? []).map((m) => ({
        personId: m.person.id,
        name: m.person.name,
        role: m.role as Role,
        hasAppAccount: m.hasAppAccount,
        profilePhotoUrl: m.person.profilePhotoUrl,
      }));
    }
    return toMemberItems(mockData.persons, mockData.memberships, activeFamilyId);
  }, [membersResult.fetching, membersResult.data, mockData, activeFamilyId]);

  function handleInvite(e: SyntheticEvent) {
    e.preventDefault();
    if (!phone.trim() || !name.trim()) return;
    setInviteError(null);

    const input = {
      familyId: activeFamilyId,
      phone: phone.trim(),
      name: name.trim(),
      relationshipToInviter: relationship.trim() || "relative",
      inverseRelationshipLabel: relationship.trim() || "relative",
      role,
    };

    if (isApiMode()) {
      void inviteMember({ input }).then((result) => {
        if (result.error) {
          setInviteError(formatErrorMessage(result.error));
          return;
        }
        reexecuteMembers({ requestPolicy: "network-only" });
        setPhone("");
        setName("");
        setRelationship("");
        setRole("viewer");
        setShowForm(false);
      });
    } else {
      console.log("[mock] inviteMember:", input);
      setPhone("");
      setName("");
      setRelationship("");
      setRole("viewer");
      setShowForm(false);
    }
  }

  function handleRemoveMember() {
    if (removeTarget === null) return;
    setRemoveError(null);
    if (isApiMode()) {
      void removeMember({ familyId: activeFamilyId, personId: removeTarget }).then((result) => {
        if (result.error) {
          setRemoveError(formatErrorMessage(result.error));
          setRemoveTarget(null);
          return;
        }
        setRemoveTarget(null);
        reexecuteMembers({ requestPolicy: "network-only" });
      });
    } else {
      console.log("[mock] removeMember:", { familyId: activeFamilyId, personId: removeTarget });
      setRemoveTarget(null);
    }
  }

  function handleRoleChange(memberPersonId: string, newRole: Role) {
    setRoleError(null);
    if (isApiMode()) {
      void updateMemberRole({
        familyId: activeFamilyId,
        personId: memberPersonId,
        role: newRole,
      }).then((result) => {
        if (result.error) {
          setRoleError(formatErrorMessage(result.error));
          return;
        }
        reexecuteMembers({ requestPolicy: "network-only" });
      });
    } else {
      console.log("[mock] updateMemberRole:", {
        familyId: activeFamilyId,
        personId: memberPersonId,
        role: newRole,
      });
    }
  }

  if (membersResult.error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/settings" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Settings
        </Link>
        <QueryError
          error={membersResult.error}
          onRetry={() => {
            reexecuteMembers({ requestPolicy: "network-only" });
          }}
        />
      </div>
    );
  }

  if (members === null) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/settings" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Settings
        </Link>
        <Loading label="Loading members..." />
      </div>
    );
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
          {inviteError !== null && <p className="text-sm text-red-600 mt-2">{inviteError}</p>}
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

      {removeError !== null && <p className="text-sm text-red-600 mb-3">{removeError}</p>}
      {roleError !== null && <p className="text-sm text-red-600 mb-3">{roleError}</p>}

      <div className="flex flex-col gap-2">
        {members.map((member) => {
          const isSelf = member.personId === activePersonId;
          return (
            <div
              key={member.personId}
              className="flex items-center justify-between p-3 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border-secondary)]"
            >
              <div className="flex items-center gap-3">
                {member.profilePhotoUrl !== undefined && member.profilePhotoUrl !== "" ? (
                  <img
                    src={member.profilePhotoUrl}
                    alt={member.name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center text-sm font-semibold text-[var(--color-accent-primary)]">
                    {member.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {member.name}
                    {isSelf && (
                      <span className="ml-1 text-xs text-[var(--color-text-tertiary)]">(you)</span>
                    )}
                  </p>
                  {member.hasAppAccount && (
                    <p className="text-xs text-[var(--color-text-tertiary)]">App account linked</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canManageMembers(activeRole) ? (
                  <select
                    value={member.role}
                    disabled={isSelf}
                    onChange={(e) => {
                      handleRoleChange(member.personId, e.target.value as Role);
                    }}
                    className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${ROLE_STYLES[member.role] ?? ""} ${isSelf ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${ROLE_STYLES[member.role] ?? ""}`}
                  >
                    {member.role}
                  </span>
                )}
                {!isSelf && canManageMembers(activeRole) && (
                  <button
                    onClick={() => {
                      setRemoveTarget(member.personId);
                    }}
                    className="px-2 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        open={removeTarget !== null}
        title="Remove Member"
        message="Remove this member from the family? This cannot be undone."
        confirmLabel="Remove"
        loading={removeLoading}
        onConfirm={handleRemoveMember}
        onCancel={() => {
          setRemoveTarget(null);
        }}
      />
    </div>
  );
}
