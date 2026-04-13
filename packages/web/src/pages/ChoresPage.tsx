import type { Chore, Person } from "@family-app/shared";
import { useMemo, useState, type SyntheticEvent } from "react";
import { useQuery } from "urql";

import { FAMILY_CHORES_QUERY, FAMILY_MEMBERS_QUERY } from "../lib/graphql-operations";
import { useCreateChore, useCompleteChore } from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import { toChoreItems, type ChoreItem } from "../lib/transforms";
import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

export function ChoresPage() {
  const mockData = useMockData();
  const { activeFamilyId } = useFamily();
  const { createChore, loading: choreLoading } = useCreateChore();
  const { completeChore } = useCompleteChore();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [assigneePersonId, setAssigneePersonId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [choresResult, reexecuteChores] = useQuery({
    query: FAMILY_CHORES_QUERY,
    variables: { familyId: activeFamilyId },
    pause: !isApiMode() || !activeFamilyId,
  });

  const [membersResult] = useQuery({
    query: FAMILY_MEMBERS_QUERY,
    variables: { familyId: activeFamilyId },
    pause: !isApiMode() || !activeFamilyId,
  });

  const persons = useMemo((): Person[] => {
    if (isApiMode()) {
      const raw = membersResult.data as { familyMembers: { person: Person }[] } | undefined;
      return (raw?.familyMembers ?? []).map((m) => m.person);
    }
    return mockData.persons;
  }, [membersResult.data, mockData.persons]);

  const choreItems = useMemo((): ChoreItem[] | null => {
    if (isApiMode()) {
      if (choresResult.fetching) return null;
      const raw = choresResult.data as { familyChores: Chore[] } | undefined;
      const apiChores = raw?.familyChores ?? [];
      return apiChores.map((c) => ({
        id: c.id,
        title: c.title,
        assigneeName: persons.find((p) => p.id === c.assigneePersonId)?.name ?? c.assigneePersonId,
        ...(c.dueDate !== undefined ? { dueDate: c.dueDate } : {}),
        status: c.status,
      }));
    }
    return toChoreItems(mockData.chores, mockData.persons, activeFamilyId);
  }, [choresResult.fetching, choresResult.data, persons, mockData, activeFamilyId]);

  const familyPersons = useMemo(
    () => persons.filter((p) => p.familyId === activeFamilyId),
    [persons, activeFamilyId],
  );

  function handleCreateChore(e: SyntheticEvent) {
    e.preventDefault();
    if (!title.trim() || !assigneePersonId) return;

    const input: Record<string, string> = {
      familyId: activeFamilyId,
      title: title.trim(),
      assigneePersonId,
    };
    if (dueDate) input.dueDate = dueDate;

    if (isApiMode()) {
      void createChore({ input }).then(() => {
        reexecuteChores({ requestPolicy: "network-only" });
      });
    } else {
      console.log("[mock] createChore:", input);
    }

    setTitle("");
    setAssigneePersonId("");
    setDueDate("");
    setShowForm(false);
  }

  function handleComplete(choreId: string) {
    if (isApiMode()) {
      void completeChore({ familyId: activeFamilyId, choreId }).then(() => {
        reexecuteChores({ requestPolicy: "network-only" });
      });
    } else {
      console.log("[mock] completeChore:", { familyId: activeFamilyId, choreId });
    }
  }

  if (choreItems === null) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <p className="text-sm text-[var(--color-text-secondary)]">Loading chores...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Chores</h1>
        <button
          onClick={() => {
            setShowForm((v) => !v);
          }}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity"
        >
          {showForm ? "Cancel" : "New Chore"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreateChore}
          className="mb-4 p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)] flex flex-col gap-3"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            placeholder="Chore title"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
          <select
            value={assigneePersonId}
            onChange={(e) => {
              setAssigneePersonId(e.target.value);
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
          >
            <option value="">Select assignee</option>
            {familyPersons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={choreLoading || !title.trim() || !assigneePersonId}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {choreLoading ? "Creating..." : "Create Chore"}
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {choreItems.map((chore) => (
          <div
            key={chore.id}
            className="p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)]"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {chore.title}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Assigned to {chore.assigneeName}
                </p>
                {chore.dueDate !== undefined && (
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
                    Due: {chore.dueDate}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {chore.status !== "completed" && (
                  <button
                    onClick={() => {
                      handleComplete(chore.id);
                    }}
                    className="px-2 py-1 text-xs font-medium rounded-lg bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                  >
                    Complete
                  </button>
                )}
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[chore.status] ?? ""}`}
                >
                  {chore.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {choreItems.length === 0 && (
          <p className="text-sm text-[var(--color-text-tertiary)]">No chores assigned.</p>
        )}
      </div>
    </div>
  );
}
