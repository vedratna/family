import { useMemo, useRef, useState, useLayoutEffect, useCallback } from "react";
import { Link } from "react-router";
import { useQuery } from "urql";

import { FAMILY_TREE_QUERY } from "../lib/graphql-operations";
import { isApiMode } from "../lib/mode";
import { useFamily } from "../providers/FamilyProvider";
import { useMockData } from "../providers/MockDataProvider";

interface TreeNode {
  personId: string;
  name: string;
  hasAppAccount: boolean;
  generation: number;
  spouseIds: string[];
  childIds: string[];
  parentIds: string[];
}

interface TreeData {
  nodes: TreeNode[];
  rootIds: string[];
  generations: number;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isSpouse?: boolean;
}

export function TreePage() {
  const mockData = useMockData();
  const { activeFamilyId } = useFamily();
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLElement>());
  const [lines, setLines] = useState<Line[]>([]);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  const [treeResult] = useQuery({
    query: FAMILY_TREE_QUERY,
    variables: { familyId: activeFamilyId },
    pause: !isApiMode() || !activeFamilyId,
  });

  const familyTree = useMemo((): TreeData | null => {
    if (isApiMode()) {
      if (treeResult.fetching) return null;
      const raw = treeResult.data as { familyTree: TreeData } | undefined;
      return raw?.familyTree ?? { nodes: [], rootIds: [], generations: 0 };
    }
    return mockData.familyTree;
  }, [treeResult.fetching, treeResult.data, mockData.familyTree]);

  const generationGroups = useMemo(() => {
    if (familyTree === null) return null;
    const groups = new Map<number, TreeNode[]>();
    for (const node of familyTree.nodes) {
      const existing = groups.get(node.generation);
      if (existing) {
        existing.push(node);
      } else {
        groups.set(node.generation, [node]);
      }
    }
    return [...groups.entries()].sort(([a], [b]) => a - b);
  }, [familyTree]);

  const spouseSet = useMemo(() => {
    if (familyTree === null) return new Set<string>();
    const set = new Set<string>();
    for (const node of familyTree.nodes) {
      for (const spouseId of node.spouseIds) {
        const key = [node.personId, spouseId].sort().join("-");
        set.add(key);
      }
    }
    return set;
  }, [familyTree]);

  const setNodeRef = useCallback((personId: string, el: HTMLElement | null) => {
    if (el) {
      nodeRefs.current.set(personId, el);
    } else {
      nodeRefs.current.delete(personId);
    }
  }, []);

  // Compute SVG lines after layout
  useLayoutEffect(() => {
    if (!familyTree || !containerRef.current) return;

    // Small delay to ensure DOM is laid out
    const frameId = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();

      const newLines: Line[] = [];

      for (const node of familyTree.nodes) {
        const parentEl = nodeRefs.current.get(node.personId);
        if (!parentEl) continue;
        const parentRect = parentEl.getBoundingClientRect();
        const px = parentRect.left + parentRect.width / 2 - containerRect.left;
        const py = parentRect.top + parentRect.height - containerRect.top;

        // Parent-child lines
        for (const childId of node.childIds) {
          const childEl = nodeRefs.current.get(childId);
          if (!childEl) continue;
          const childRect = childEl.getBoundingClientRect();
          const cx = childRect.left + childRect.width / 2 - containerRect.left;
          const cy = childRect.top - containerRect.top;
          newLines.push({ x1: px, y1: py, x2: cx, y2: cy });
        }

        // Spouse lines (only draw once per pair)
        for (const spouseId of node.spouseIds) {
          const pairKey = [node.personId, spouseId].sort().join("-");
          const isFirst = node.personId === [node.personId, spouseId].sort()[0];
          if (!isFirst) continue;
          if (!spouseSet.has(pairKey)) continue;

          const spouseEl = nodeRefs.current.get(spouseId);
          if (!spouseEl) continue;
          const spouseRect = spouseEl.getBoundingClientRect();
          const sx = spouseRect.left + spouseRect.width / 2 - containerRect.left;
          const sy = spouseRect.top + spouseRect.height / 2 - containerRect.top;
          const pmy = parentRect.top + parentRect.height / 2 - containerRect.top;
          newLines.push({ x1: px, y1: pmy, x2: sx, y2: sy, isSpouse: true });
        }
      }

      setSvgSize({ width: containerRect.width, height: containerRect.height });
      setLines(newLines);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [familyTree, generationGroups, spouseSet]);

  if (generationGroups === null) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <p className="text-sm text-[var(--color-text-secondary)]">Loading family tree...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-6">Family Tree</h1>

      <div ref={containerRef} className="relative flex flex-col gap-8">
        {/* SVG overlay for connection lines */}
        {lines.length > 0 && (
          <svg
            className="absolute inset-0 pointer-events-none"
            width={svgSize.width}
            height={svgSize.height}
            style={{ zIndex: 0 }}
          >
            {lines.map((line, i) => {
              if (line.isSpouse === true) {
                // Simple horizontal line for spouses
                return (
                  <line
                    key={i}
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="var(--color-accent-primary)"
                    strokeWidth="2"
                    strokeDasharray="6 3"
                    opacity="0.5"
                  />
                );
              }
              // Curved path for parent-child
              const midY = (line.y1 + line.y2) / 2;
              return (
                <path
                  key={i}
                  d={`M ${String(line.x1)} ${String(line.y1)} C ${String(line.x1)} ${String(midY)}, ${String(line.x2)} ${String(midY)}, ${String(line.x2)} ${String(line.y2)}`}
                  fill="none"
                  stroke="var(--color-border-primary)"
                  strokeWidth="2"
                  opacity="0.5"
                />
              );
            })}
          </svg>
        )}

        {generationGroups.map(([gen, nodes]) => (
          <div key={gen} style={{ position: "relative", zIndex: 1 }}>
            <h2 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">
              Generation {gen + 1}
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {nodes.map((node) => {
                const isSpouseConnected = node.spouseIds.length > 0;
                const spouseNode = isSpouseConnected
                  ? familyTree?.nodes.find((n) => n.personId === node.spouseIds[0])
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
                      ref={(el: HTMLAnchorElement | null) => {
                        setNodeRef(node.personId, el);
                      }}
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
                          ref={(el: HTMLAnchorElement | null) => {
                            setNodeRef(spouseNode.personId, el);
                          }}
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
        {generationGroups.length === 0 && (
          <p className="text-sm text-[var(--color-text-tertiary)]">
            No family tree data yet. Add members and relationships to build your tree.
          </p>
        )}
      </div>
    </div>
  );
}
