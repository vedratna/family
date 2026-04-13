import type { RelationshipType, Relationship, Person } from "@family-app/shared";
import { useMemo, useState, type SyntheticEvent } from "react";
import { useParams, Link } from "react-router";
import { useQuery } from "urql";

import { Loading } from "../components/Loading";
import { QueryError } from "../components/QueryError";
import { formatErrorMessage } from "../lib/error-utils";
import { FAMILY_RELATIONSHIPS_QUERY, FAMILY_MEMBERS_QUERY } from "../lib/graphql-operations";
import { useCreateRelationship } from "../lib/hooks";
import { isApiMode } from "../lib/mode";
import type { PersonRelationship } from "../lib/transforms";
import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";

const STATUS_BADGE: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
};

const RELATIONSHIP_TYPES: RelationshipType[] = [
  "parent-child",
  "spouse",
  "sibling",
  "in-law",
  "grandparent-grandchild",
  "uncle-aunt",
  "cousin",
  "custom",
];

export function PersonPage() {
  const { personId } = useParams<{ personId: string }>();
  const mockData = useMockData();
  const { activeFamilyId } = useFamily();
  const { createRelationship, loading: relLoading } = useCreateRelationship();

  const [showForm, setShowForm] = useState(false);
  const [otherPersonId, setOtherPersonId] = useState("");
  const [relType, setRelType] = useState<RelationshipType>("parent-child");
  const [aToBLabel, setAToBLabel] = useState("");
  const [bToALabel, setBToALabel] = useState("");
  const [relError, setRelError] = useState<string | null>(null);

  const [relsResult, reexecuteRels] = useQuery({
    query: FAMILY_RELATIONSHIPS_QUERY,
    variables: { familyId: activeFamilyId },
    pause: !isApiMode() || !activeFamilyId,
  });

  const [membersResult, reexecuteMembers] = useQuery({
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

  const relationships = useMemo((): Relationship[] => {
    if (isApiMode()) {
      const raw = relsResult.data as { familyRelationships: Relationship[] } | undefined;
      return raw?.familyRelationships ?? [];
    }
    return mockData.relationships;
  }, [relsResult.data, mockData.relationships]);

  const person = persons.find((p) => p.id === personId);

  const familyPersons = useMemo(
    () => persons.filter((p) => p.familyId === activeFamilyId && p.id !== personId),
    [persons, activeFamilyId, personId],
  );

  const personRelationships = useMemo<PersonRelationship[]>(() => {
    const familyRels = relationships.filter((r) => r.familyId === activeFamilyId);
    return familyRels
      .filter((r) => r.personAId === personId || r.personBId === personId)
      .map((r) => {
        const isA = r.personAId === personId;
        const otherPId = isA ? r.personBId : r.personAId;
        const label = isA ? r.aToBLabel : r.bToALabel;
        const other = persons.find((p) => p.id === otherPId);
        return {
          label,
          otherPersonName: other?.name ?? otherPId,
          type: r.type,
          status: r.status,
        };
      });
  }, [relationships, activeFamilyId, personId, persons]);

  const loading = isApiMode() && (relsResult.fetching || membersResult.fetching);

  function handleAddRelationship(e: SyntheticEvent) {
    e.preventDefault();
    if (!otherPersonId || !aToBLabel.trim() || !bToALabel.trim()) return;
    setRelError(null);

    const input = {
      familyId: activeFamilyId,
      personAId: personId,
      personBId: otherPersonId,
      aToBLabel: aToBLabel.trim(),
      bToALabel: bToALabel.trim(),
      type: relType,
    };

    if (isApiMode()) {
      void createRelationship({ input }).then((result) => {
        if (result.error) {
          setRelError(formatErrorMessage(result.error));
          return;
        }
        reexecuteRels({ requestPolicy: "network-only" });
        setOtherPersonId("");
        setRelType("parent-child");
        setAToBLabel("");
        setBToALabel("");
        setShowForm(false);
      });
    } else {
      console.log("[mock] createRelationship:", input);
      setOtherPersonId("");
      setRelType("parent-child");
      setAToBLabel("");
      setBToALabel("");
      setShowForm(false);
    }
  }

  if (relsResult.error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/tree" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Tree
        </Link>
        <QueryError
          error={relsResult.error}
          onRetry={() => {
            reexecuteRels({ requestPolicy: "network-only" });
          }}
        />
      </div>
    );
  }

  if (membersResult.error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/tree" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Tree
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Link to="/tree" className="text-sm text-[var(--color-accent-primary)] hover:underline">
          &larr; Back to Tree
        </Link>
        <Loading />
      </div>
    );
  }

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

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          Relationships ({personRelationships.length})
        </h2>
        <button
          onClick={() => {
            setShowForm((v) => !v);
          }}
          className="px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity"
        >
          {showForm ? "Cancel" : "Add Relationship"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddRelationship}
          className="mb-4 p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)] flex flex-col gap-3"
        >
          <select
            value={otherPersonId}
            onChange={(e) => {
              setOtherPersonId(e.target.value);
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
          >
            <option value="">Select person</option>
            {familyPersons.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            value={relType}
            onChange={(e) => {
              setRelType(e.target.value as RelationshipType);
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
          >
            {RELATIONSHIP_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={aToBLabel}
            onChange={(e) => {
              setAToBLabel(e.target.value);
            }}
            placeholder="Label A to B (e.g. Father)"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
          <input
            type="text"
            value={bToALabel}
            onChange={(e) => {
              setBToALabel(e.target.value);
            }}
            placeholder="Label B to A (e.g. Son)"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border-secondary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
          />
          {relError !== null && <p className="text-sm text-red-600 mt-2">{relError}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={relLoading || !otherPersonId || !aToBLabel.trim() || !bToALabel.trim()}
              className="px-4 py-1.5 text-sm font-medium rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-accent-on)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {relLoading ? "Adding..." : "Add Relationship"}
            </button>
          </div>
        </form>
      )}

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
