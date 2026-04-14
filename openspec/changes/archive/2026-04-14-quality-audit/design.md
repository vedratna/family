## Context

The app is now feature-complete per the 4-criteria definition of done (local dev, deployable, E2E automated, quality gates). This change is a dedicated quality pass before shipping — surfacing the debt accumulated during rapid parallel iteration. Scope: tighten coverage thresholds, eliminate manual type assertions, re-run the architecture reviewer, and enforce the quality gates in CI.

## Goals / Non-Goals

**Goals:**

- Enforce 95% coverage floor in CI (currently reports but doesn't fail)
- Close remaining uncovered branches in backend + web
- Replace `as unknown as` / unsafe casts in web with proper types (GraphQL Code Generator where it pays off; manual fixes elsewhere)
- Architecture review against the full codebase with findings addressed
- CI adds: coverage gate, bundle size gate, architecture-boundaries check remains green
- README + docs reflect the final shape

**Non-Goals:**

- New features
- Large refactors ("just because"). Limit changes to what the audit flags
- Rewriting tests that already pass
- Mobile app quality (Expo app is in a separate track; mobile polish is a later change)
- Performance tuning beyond obvious wins — we haven't profiled, so this is a separate initiative

## Decisions

### 1. Coverage enforcement: per-package thresholds in vitest config

Each package's `vitest.config.ts` (or `vitest.integration.config.ts`) gets a `test.coverage.thresholds` block with branches/lines/functions at 95% (statements 90%, since single-statement throws don't benefit from testing). CI runs `npm run test:coverage` and fails if thresholds aren't met. No global threshold — enforcement happens where coverage is measured.

**Rationale:** Per-package keeps ownership clear. Centralizing in CI config would hide the rule from `npm run test:coverage` runs.

### 2. Type safety approach: codegen for GraphQL types, manual fixes elsewhere

Install `@graphql-codegen/cli` + plugins. Generate `packages/web/src/lib/generated/graphql.ts` from the schema. Refactor urql hook usage to use typed document nodes. This eliminates `as unknown as FamilyFeedData` patterns.

For non-GraphQL casts (e.g., test helpers, route params), fix case-by-case.

**Alternative considered:** tRPC-style, schema-first TypeScript types — rejected because we already have a GraphQL schema as the source of truth.

### 3. Architecture review: delegate to the architecture-reviewer subagent

Run the `architecture-reviewer` agent with full codebase scope. Capture findings in a checklist. Triage: fix in this PR, defer to follow-up, or "accepted trade-off." Every deferred item gets a note in the relevant file or a TODO with owner.

### 4. Bundle size gate

Add `size-limit` dev dependency + `.size-limit.json` config targeting `packages/web/dist/`. Budget: initial bundle <300KB gzipped, lazy chunks <100KB each. CI fails if exceeded.

**Rationale:** Hard cap prevents accidental bundle bloat (e.g., pulling in moment.js). 300KB is generous for a React + urql + Tailwind app.

### 5. Documentation refresh scope

- Root `README.md`: setup steps, the `npm run dev` single-command story, test commands, deployment overview
- `docs/architecture.md` if stale (check for drift from the polish work)
- `openspec/specs/quality-standards/spec.md`: verify each rule is still enforced

### 6. CI job additions

Extend existing CI workflow:

- `unit-tests` → also fails on coverage threshold miss
- New `bundle-size` job (post-build, fails on size-limit violation)
- `e2e-web` becomes a required status check on main
- No change to `lint`/`typecheck`/`build`/`security-audit` (already required)

## Risks / Trade-offs

**[Coverage threshold causes PR churn]** → Raising to 95% may make future PRs feel bureaucratic. Mitigation: accept 95% as the floor; target 97%+ in practice so small dips don't block merges.

**[Codegen adds build complexity]** → One more generation step in dev loop. Mitigation: make codegen run as a pre-build hook; commit generated files so devs don't need to regenerate locally unless schema changes.

**[Architecture review finds large issues]** → If the reviewer surfaces a structural problem, fixing it could balloon the scope. Mitigation: triage strictly. Anything architectural goes to a new openspec change, not this PR.

**[Bundle size budget too tight or too loose]** → First measurement may surprise. Calibrate once and commit the budget. Bumping the budget should require explicit PR review (the config file is tracked).

**[Docs drift immediately after audit]** → Docs rot fast. Mitigation: the audit is a point-in-time sweep; ongoing hygiene is a separate "docs freshness" cadence we'll establish later.

## Migration Plan

1. Run architecture-reviewer → capture findings
2. Fix quick wins (coverage gaps, dead code, unsafe casts) in small batches
3. Add codegen → migrate urql hooks
4. Enable coverage thresholds in vitest configs
5. Add bundle-size config + CI job
6. Update CI workflow (threshold fail, bundle gate, e2e required)
7. Refresh README + docs
8. Update branch protection on main to include `e2e-web` + `bundle-size` as required checks
