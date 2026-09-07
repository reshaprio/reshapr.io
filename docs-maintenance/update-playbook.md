# Documentation update playbook

Use this playbook for a product release, a documentation review, or a change that affects a tracked capability or limitation. The result should be a small evidence-backed diff, not a rewrite of the documentation corpus.

## 1. Choose the review mode

Record the mode in the pull request or review notes:

| Mode | Comparison | Expected baseline status |
|---|---|---|
| Release update | Previous released refs to proposed released refs | `released`, `partial`, `deprecated`, `removed`, or `unsupported` |
| Main-branch watch | Current released refs to owner-repository default branches | `main-only` until a release artifact exists |
| Documentation-only review | Current baseline and current authored corpus | No product status change without new owner evidence |

Do not move a capability from `main-only` to `released` because a pull request merged. Require a published release artifact or immutable release tag.

## 2. Freeze reviewed references

Before interpreting changes, record exact refs and commits for all affected owner repositories:

```sh
git -C ../reshapr rev-parse HEAD
git -C ../reshapr-controllers rev-parse HEAD
git -C ../reshapr-helm-charts rev-parse HEAD
git rev-parse HEAD

git -C ../reshapr rev-list -n 1 0.2.3
git -C ../reshapr-controllers rev-list -n 1 0.0.1
git -C ../reshapr-helm-charts ls-remote --tags origin refs/tags/0.0.11
```

Replace the versions with the refs under review. Use `git ls-remote` when an immutable published tag is absent from a local clone; do not fetch or change another working tree merely to record its commit.

Update the `Reviewed sources` table in [`product-baseline.md`](product-baseline.md) only after these values are known. Record a dirty documentation working tree as such rather than implying that HEAD contains uncommitted content.

## 3. Discover candidate changes

Use several discovery channels because no one channel is complete:

```sh
git -C ../reshapr diff --stat <old-ref>..<new-ref>
git -C ../reshapr-controllers diff --stat <old-ref>..<new-ref>
git -C ../reshapr-helm-charts diff --stat <old-ref>..<new-ref>

git -C ../reshapr log --oneline <old-ref>..<new-ref>
git -C ../reshapr-controllers log --oneline <old-ref>..<new-ref>
git -C ../reshapr-helm-charts log --oneline <old-ref>..<new-ref>
```

Then inspect:

- release notes and release artifacts;
- merged pull requests and their linked issues;
- closed issues with release milestones;
- API, CLI, schema, CRD, chart-values, and configuration diffs;
- tests added or changed with the implementation;
- removed, deprecated, or renamed interfaces;
- changed defaults, prerequisites, limits, and failure behavior.

Issues, pull requests, commit messages, and release notes identify where to look. They do not prove the final runtime path. A closed issue can be incomplete, reverted, unreleased, or narrower than its title.

## 4. Verify behavior at the owning surface

For each candidate, follow the code path that actually computes, mutates, validates, dispatches, or deploys the behavior. Prefer this evidence order:

1. release-tagged implementation and directly associated tests;
2. published OpenAPI, protobuf, CRD, chart, image, or CLI artifact;
3. default-branch implementation for a `main-only` record;
4. owner documentation as clarification.

Check the whole contract, not only the happy path:

- availability and default state;
- supported protocols, versions, and resource types;
- authentication and authorization boundary;
- error and fallback behavior;
- persistence, cleanup, and upgrade behavior;
- component, topology, and deployment scope;
- prerequisites and externally owned responsibilities.

If no active path reaches the behavior, classify it `unsupported`. A DTO, constant, configuration property, issue, plan, or documentation statement alone is insufficient.

## 5. Update the product baseline

Reuse an existing `CAP-*` ID when the user-visible purpose is continuous. Create a new ID only for a distinct capability that cannot be represented by extending an existing row.

Apply statuses consistently:

| Status | Use when |
|---|---|
| `released` | The reviewed released artifacts provide the capability at its stated scope. |
| `main-only` | The behavior is verified on the default branch but absent from the current release baseline. |
| `partial` | A meaningful path exists, but a material part of the named capability is absent or narrower. |
| `deprecated` | The released capability remains usable but has an announced replacement or removal path. |
| `removed` | A formerly released capability is absent from the new release. |
| `unsupported` | The proposed behavior is not implemented in the baseline. |

For a new capability:

1. Add one semantic `CAP-*` row under the owning functional domain.
2. Name the owner repository and direct evidence surface.
3. Add every material scope boundary as a `LIM-*` entry.

For changed or removed behavior, preserve the capability row and update its status, statement, evidence, and limitations. Add a dated entry to the baseline change log.

## 6. Maintain limitations as history

Create a limitation when a reasonable reader could otherwise infer a broader guarantee, especially for security, authorization, data handling, compatibility, cleanup, availability, and operations.

When a limitation is fixed:

1. Verify the complete released path and regression coverage.
2. Keep the `LIM-*` row.
3. Change `active` to `resolved`.
4. Record the last affected release in `Applies through` and add `Resolved in <version>` to the statement.
5. Remove obsolete warnings from current docs, but retain accurate statements in historical blog posts.
6. Update every affected capability and coverage row.

If only part of a limitation is fixed, keep it active and narrow its statement. Do not mark it resolved merely because an issue closed.

## 7. Reassess documentation coverage

For every changed `CAP-*` and `LIM-*` ID, update [`coverage-matrix.md`](coverage-matrix.md):

- choose one primary Diataxis purpose for each new page;
- link existing pages when they already answer the user need;
- use `partial` and name the exact gap instead of creating placeholder prose;
- use `missing` when a released capability has no meaningful page;
- use `not-documentable` for unsupported behavior, while retaining boundary mentions that prevent overclaiming;
- update the 48-page corpus inventory when pages are added, moved, or removed;
- preserve published URLs with redirects or aliases when content moves;
- reassess persona entry points when a journey changes.

Do not require a tutorial, how-to, explanation, and reference for every capability. Coverage is complete when the relevant personas can perform their task, understand the model, or inspect the contract without contradictory claims.

## 8. Handle blogs as historical snapshots

Classify every blog post `historical-only` regardless of current accuracy.

Edit a published post only when:

- a statement was factually false at publication;
- a link is broken and has an equivalent historical target;
- a safety or security correction is necessary;
- a small annotation is needed to prevent a serious present-day misunderstanding.

Do not silently rewrite old release context to match the current product. Put current procedures and capability claims in `docs/`, then link readers there when useful. Draft posts remain historical-only inputs until publication and cannot establish coverage.

## 9. Edit and verify authored content

Follow [`CONTRIBUTING.md`](../CONTRIBUTING.md). In particular:

- use English;
- use release-tagged links and examples for executable procedures;
- update `verification` frontmatter only after replaying changed commands;
- keep volatile exhaustive contracts in their owner repositories;
- state relevant limitations next to the claims they qualify;
- do not edit generated files.

Run the narrowest relevant test immediately after the first content edit. Then run:

```sh
npm run docs:audit
npm run test:mcp-support
npm run test:content-negotiation
npm run build
git diff --check
```

Tests unrelated to the changed area can remain unchanged, but `npm run build` is the final repository-wide documentation check.

## 10. Review the publication boundary

The maintenance directory must remain private source material:

- no `docs-maintenance/` path in `sidebars.js`;
- no Docusaurus plugin with `docs-maintenance/` as a content path;
- no maintenance path in the LLM `includeOrder`;
- no maintenance route, sitemap URL, generated route Markdown, or `llms*.txt` entry.

`npm run docs:audit` checks the static configuration and, when build outputs exist, scans the generated publication surfaces. A clean `npm run build && npm run docs:audit` is the final discriminating check.

## Review checklist

- [ ] Review mode, date, refs, and commits are recorded.
- [ ] Product claims come from code, contracts, tests, or published artifacts.
- [ ] New default-branch behavior remains `main-only` until released.
- [ ] All changed capabilities and limitations have stable IDs.
- [ ] Resolved limitations remain in the historical registry.
- [ ] Coverage and persona journeys match the authored corpus.
- [ ] Blogs remain `historical-only` and non-normative.
- [ ] Executable docs were replayed against their declared release.
- [ ] `npm run docs:audit` and `npm run build` pass.
- [ ] No `docs-maintenance/` content appears in published output.