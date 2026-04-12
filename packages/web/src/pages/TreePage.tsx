import { useMemo } from "react";
import { Link } from "react-router";

import { useMockData } from "../providers/MockDataProvider";

export function TreePage() {
  const { familyTree } = useMockData();

  const generationGroups = useMemo(() => {
    const groups = new Map<number, typeof familyTree.nodes>();
    for (const node of familyTree.nodes) {
      const existing = groups.get(node.generation);
      if (existing) {
        existing.push(node);
      } else {
        groups.set(node.generation, [node]);
      }
    }
    return [...groups.entries()].sort(([a], [b]) => a - b);
  }, [familyTree.nodes]);

  const spouseSet = useMemo(() => {
    const set = new Set<string>();
    for (const node of familyTree.nodes) {
      for (const spouseId of node.spouseIds) {
        const key = [node.personId, spouseId].sort().join("-");
        set.add(key);
      }
    }
    return set;
  }, [familyTree.nodes]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">Family Tree</h1>

      <div className="flex flex-col gap-8">
        {generationGroups.map(([gen, nodes]) => (
          <div key={gen}>
            <h2 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">
              Generation {gen + 1}
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {nodes.map((node) => {
                const isSpouseConnected = node.spouseIds.length > 0;
                const spouseNode = isSpouseConnected
                  ? familyTree.nodes.find((n) => n.personId === node.spouseIds[0])
                  : null;
                const pairKey =
                  spouseNode !== undefined && spouseNode !== null
                    ? [node.personId, spouseNode.personId].sort().join("-")
                    : null;
                const isFirstInPair =
                  pairKey !== null
                    ? node.personId === [node.personId, spouseNode?.personId ?? ""].sort()[0]
                    : true;

                if (pairKey !== null && spouseSet.has(pairKey) && !isFirstInPair) {
                  return null;
                }

                return (
                  <div key={node.personId} className="flex items-center gap-2">
                    <Link
                      to={`/tree/${node.personId}`}
                      className="flex flex-col items-center p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)] hover:border-[var(--color-accent-primary)] transition-colors min-w-[100px]"
                    >
                      <div className="w-12 h-12 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center text-lg font-semibold text-[var(--color-accent-primary)] mb-2">
                        {node.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-[var(--color-text-primary)] text-center">
                        {node.name}
                      </span>
                      {node.hasAppAccount && (
                        <span className="mt-1 text-xs px-1.5 py-0.5 rounded bg-[var(--color-accent-light)] text-[var(--color-accent-primary)]">
                          App User
                        </span>
                      )}
                    </Link>

                    {spouseNode && (
                      <>
                        <span className="text-[var(--color-text-tertiary)] text-lg">&mdash;</span>
                        <Link
                          to={`/tree/${spouseNode.personId}`}
                          className="flex flex-col items-center p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-secondary)] hover:border-[var(--color-accent-primary)] transition-colors min-w-[100px]"
                        >
                          <div className="w-12 h-12 rounded-full bg-[var(--color-accent-light)] flex items-center justify-center text-lg font-semibold text-[var(--color-accent-primary)] mb-2">
                            {spouseNode.name.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-[var(--color-text-primary)] text-center">
                            {spouseNode.name}
                          </span>
                          {spouseNode.hasAppAccount && (
                            <span className="mt-1 text-xs px-1.5 py-0.5 rounded bg-[var(--color-accent-light)] text-[var(--color-accent-primary)]">
                              App User
                            </span>
                          )}
                        </Link>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
