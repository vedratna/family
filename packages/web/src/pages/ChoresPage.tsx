import type { Chore, Person } from "@family-app/shared";
import { useMemo, useState, type SyntheticEvent } from "react";
import { useQuery } from "urql";

import { ConfirmModal } from "../components/ConfirmModal";
import { Loading } from "../components/Loading";
import { QueryError } from "../components/QueryError";
import { formatErrorMessage } from "../lib/error-utils";
import { FAMILY_CHORES_QUERY, FAMILY_MEMBERS_QUERY } from "../lib/graphql-operations";
import { useCreateChore, useCompleteChore, useDeleteChore } from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import { toChoreItems, type ChoreItem } from "../lib/transforms";
import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";

type FilterTab = "all" | "pending" | "completed" | "overdue";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Overdue", value: "overdue" },
];

export function ChoresPage() {
  const mockData = useMockData();
  const { activeFamilyId } = useFamily();
  const { createChore, loading: choreLoading } = useCreateChore();
  const { completeChore } = useCompleteChore();
  const { deleteChore, loading: deleteChoreLoading } = useDeleteChore();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [assigneePersonId, setAssigneePersonId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [choreError, setChoreError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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

  const filteredChoreItems = useMemo((): ChoreItem[] | null => {
    if (choreItems === null) return null;
    if (filterTab === "all") return choreItems;
    return choreItems.filter((c) => c.status === filterTab);
  }, [choreItems, filterTab]);

  const familyPersons = useMemo(
    () => persons.filter((p) => p.familyId === activeFamilyId),
    [persons, activeFamilyId],
  );

  function handleCreateChore(e: SyntheticEvent) {
    e.preventDefault();
    if (!title.trim() || !assigneePersonId) return;
    setChoreError(null);

    const input: Record<string, string> = {
      familyId: activeFamilyId,
      title: title.trim(),
      assigneePersonId,
    };
    if (dueDate) input.dueDate = dueDate;

    if (isApiMode()) {
      void createChore({ input }).then((result) => {
        if (result.error) {
          setChoreError(formatErrorMessage(result.error));
          return;
        }
        reexecuteChores({ requestPolicy: "network-only" });
        setTitle("");
        setAssigneePersonId("");
        setDueDate("");
        setShowForm(false);
      });
    } else {
      console.log("[mock] createChore:", input);
      setTitle("");
      setAssigneePersonId("");
      setDueDate("");
      setShowForm(false);
    }
  }

  function handleComplete(choreId: string) {
    setCompleteError(null);
    if (isApiMode()) {
      void completeChore({ familyId: activeFamilyId, choreId }).then((result) => {
        if (result.error) {
          setCompleteError(formatErrorMessage(result.error));
          return;
        }
        reexecuteChores({ requestPolicy: "network-only" });
      });
    } else {
      console.log("[mock] completeChore:", { familyId: activeFamilyId, choreId });
    }
  }

  function handleDeleteChore() {
    if (deleteTarget === null) return;
    setDeleteError(null);
    if (isApiMode()) {
      void deleteChore({ familyId: activeFamilyId, choreId: deleteTarget }).then((result) => {
        if (result.error) {
          setDeleteError(formatErrorMessage(result.error));
          setDeleteTarget(null);
          return;
        }
        setDeleteTarget(null);
        reexecuteChores({ requestPolicy: "network-only" });
      });
    } else {
      console.log("[mock] deleteChore:", { familyId: activeFamilyId, choreId: deleteTarget });
      setDeleteTarget(null);
    }
  }

  if (choresResult.error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <QueryError
          error={choresResult.error}
          onRetry={() => {
            reexecuteChores({ requestPolicy: "network-only" });
          }}
        />
      </div>
    );
  }

  if (filteredChoreItems === null) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Loading label="Loading chores..." />
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

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setFilterTab(tab.value);
            }}
            className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
              filterTab === tab.value
                ? "bg-[var(--color-accent-primary)] text-[var(--color-accent-on)]"
                : "bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
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
          {choreError !== null && <p className="text-sm text-red-600 mt-2">{choreError}</p>}
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

      {completeError !== null && <p className="text-sm text-red-600 mb-3">{completeError}</p>}
      {deleteError !== null && <p className="text-sm text-red-600 mb-3">{deleteError}</p>}
      <div className="flex flex-col gap-3">
        {filteredChoreItems.map((chore) => (
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
                <button
                  onClick={() => {
                    setDeleteTarget(chore.id);
                  }}
                  className="px-2 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[chore.status] ?? ""}`}
                >
                  {chore.status}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filteredChoreItems.length === 0 && (
          <p className="text-sm text-[var(--color-text-tertiary)]">No chores assigned.</p>
        )}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete Chore"
        message="Delete this chore? This cannot be undone."
        confirmLabel="Delete"
        loading={deleteChoreLoading}
        onConfirm={handleDeleteChore}
        onCancel={() => {
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
