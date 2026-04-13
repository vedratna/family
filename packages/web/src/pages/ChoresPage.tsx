import { useMemo } from "react";

import { toChoreItems } from "../lib/transforms";
import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

export function ChoresPage() {
  const { chores, persons } = useMockData();
  const { activeFamilyId } = useFamily();

  const choreItems = useMemo(
    () => toChoreItems(chores, persons, activeFamilyId),
    [chores, persons, activeFamilyId],
  );

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Chores</h1>

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
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[chore.status] ?? ""}`}
              >
                {chore.status}
              </span>
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
