import { useMemo } from "react";
import { useParams, Link } from "react-router";

import type { PersonRelationship } from "../lib/transforms";
import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
};

export function PersonPage() {
  const { personId } = useParams<{ personId: string }>();
  const { persons, relationships } = useMockData();
  const { activeFamilyId } = useFamily();

  const person = persons.find((p) => p.id === personId);

  const personRelationships = useMemo<PersonRelationship[]>(() => {
    const familyRels = relationships.filter((r) => r.familyId === activeFamilyId);
    return familyRels
      .filter((r) => r.personAId === personId || r.personBId === personId)
      .map((r) => {
        const isA = r.personAId === personId;
        const otherPersonId = isA ? r.personBId : r.personAId;
        const label = isA ? r.aToBLabel : r.bToALabel;
        const other = persons.find((p) => p.id === otherPersonId);
        return {
          label,
          otherPersonName: other?.name ?? otherPersonId,
          type: r.type,
          status: r.status,
        };
      });
  }, [relationships, activeFamilyId, personId, persons]);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Link to="/tree" className="text-sm text-[var(--color-accent-primary)] hover:underline">
        &larr; Back to Tree
      </Link>

      <div className="mt-4 mb-6">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
          {person?.name ?? "Unknown Person"}
        </h1>
        {person?.userId !== undefined && (
          <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-accent-light)] text-[var(--color-accent-primary)]">
            App User
          </span>
        )}
      </div>

      <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">
        Relationships ({personRelationships.length})
      </h2>

      <div className="flex flex-col gap-2">
        {personRelationships.map((rel, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 bg-[var(--color-bg-card)] rounded-lg border border-[var(--color-border-secondary)]"
          >
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {rel.label} &mdash; {rel.otherPersonName}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{rel.type}</p>
            </div>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[rel.status] ?? ""}`}
            >
              {rel.status}
            </span>
          </div>
        ))}
        {personRelationships.length === 0 && (
          <p className="text-sm text-[var(--color-text-tertiary)]">No relationships found.</p>
        )}
      </div>
    </div>
  );
}
