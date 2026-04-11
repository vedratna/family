## Context

The family-app project has a fully implemented codebase (237 tasks across 17 groups) with clean architecture, 121 tests, 8-theme system, and comprehensive features. The codebase follows patterns (clean architecture, repository pattern, DI, domain errors) that are only documented implicitly in the code structure. As the team grows, this implicit knowledge needs to become explicit.

Three documentation sets target three distinct audiences: developers building the system, the development team maintaining quality, and end users learning the app.

## Goals / Non-Goals

**Goals:**

- Provide a new developer with everything they need to understand the system in under 1 hour
- Codify quality standards so they are enforceable, not just aspirational
- Give end users a self-service guide that reduces support burden
- Use progressive disclosure so readers can stop at the level of detail they need
- Use visual diagrams (ASCII art in markdown) throughout — a good diagram replaces paragraphs

**Non-Goals:**

- API reference docs (auto-generate from GraphQL schema later)
- Inline code comments or JSDoc (code should be self-documenting)
- Deployment runbooks (separate ops concern)
- Marketing materials

## Decisions

### 1. Progressive Disclosure Structure (All Three Documents)

**Decision:** Every document follows a 3-level progressive disclosure pattern: Level 1 (overview, 5-min read) → Level 2 (component/feature deep dives) → Level 3 (detailed flows/walkthroughs).

**Rationale:** Different readers need different depths. A senior dev joining the team needs Level 1 on day one, Level 2 by week one. A dev working on the notification system only needs Level 3 for notifications. An end user may only ever read Level 1 (quick start). This structure lets everyone self-serve.

### 2. Architecture Docs — File Per Component

**Decision:** Split architecture docs into multiple files: `00-overview.md`, `01-backend.md`, `02-frontend.md`, `03-infrastructure.md`, `04-shared-package.md`, `05-data-model.md`, `06-critical-flows.md`.

**Rationale:** A single massive architecture doc is hard to navigate and maintain. File-per-component means a dev working on the backend only reads `01-backend.md`. Numbered prefixes ensure natural reading order. Each file is self-contained with its own diagrams.

### 3. Quality Standards — Single File

**Decision:** Quality standards live in one file (`docs/quality-standards.md`) rather than being split.

**Rationale:** Quality standards are cross-cutting — a single file is searchable and linkable. It serves as the "constitution" developers reference. It can be linked from PR templates and CONTRIBUTING.md.

### 4. User Guide — Feature-Based Split

**Decision:** User guide splits into: `00-quick-start.md`, then one file per feature (`01-home-feed.md`, `02-family-calendar.md`, `03-family-tree.md`, `04-chores.md`, `05-settings.md`, `06-multi-family.md`).

**Rationale:** End users think in features, not architecture. A user wondering "how do I set up birthday reminders?" goes to the calendar doc. Numbered prefixes suggest a natural learning order.

### 5. Diagrams — ASCII Art in Markdown

**Decision:** All diagrams use ASCII art embedded in markdown code blocks. No external diagramming tools or image files.

**Rationale:** ASCII diagrams live in the same git repo as the code, can be diffed in PRs, need no external tools to view, and render everywhere (GitHub, IDE, terminal). They are maintained by the same developers who maintain the code.

**Alternatives considered:**

- _Mermaid_: Renderable in GitHub markdown, but not in all tools (IDEs, terminals). ASCII is more universal.
- _Image files (PNG/SVG)_: Not diffable, need separate tools to edit, go stale quickly.

### 6. Cross-References Between Documents

**Decision:** Architecture docs reference quality standards where relevant (e.g., "See quality-standards.md for the full ESLint rules inventory"). Quality standards reference architecture docs for pattern examples. User guide is fully standalone.

**Rationale:** Developers read both architecture and quality docs. Cross-referencing reduces duplication. The user guide must stand alone because end users never see the other docs.

## Risks / Trade-offs

**[Documentation goes stale]** → Mitigate by keeping docs close to what they describe (architecture docs next to code, not in a wiki), using ASCII art (editable by devs), and adding a "last reviewed" date to each file.

**[Over-documentation]** → Mitigate by focusing on WHY and HOW, not WHAT (code shows what). Architecture docs explain decisions, not line-by-line code. Quality standards explain rationale, not just rules.
