# Documentation maintenance system

This directory is the private maintenance control plane for the public reShapr documentation. It records what the released product does, where that behavior is documented, and how to reassess both when the product changes.

It is not product documentation. Do not link readers here, add it to a Docusaurus content plugin, or include it in generated route or LLM content.

## Files

- [`product-baseline.md`](product-baseline.md) records reviewed repositories, personas, functional domains, capabilities, and limitations for the current release baseline.
- [`coverage-matrix.md`](coverage-matrix.md) maps baseline IDs to the current public documentation and identifies missing or intentionally excluded coverage.
- [`update-playbook.md`](update-playbook.md) defines the repeatable discovery, evidence, editing, and validation workflow.

The public authoring contract remains [`CONTRIBUTING.md`](../CONTRIBUTING.md). This directory adds traceability; it does not restate Diataxis, terminology, page structure, or executable-documentation rules.

## Authority and evidence

Use this precedence order when sources disagree:

1. A published release artifact, release-tagged code, contract, or directly associated test establishes released behavior.
2. Tracked code, contracts, and tests on a default branch establish `main-only` behavior.
3. Owner-repository documentation can clarify a verified implementation but cannot establish one by itself.
4. Issues, pull requests, plans, and this directory are discovery and traceability inputs, never proof of product behavior.

The `reshapr`, `reshapr-controllers`, and `reshapr-helm-charts` repositories own product behavior. This repository owns user journeys, explanations, bounded examples, and navigation.

## Stable identifiers

- `CAP-*` identifies a product capability. Keep the ID when wording, implementation, or coverage changes.
- `LIM-*` identifies a product limitation or important scope boundary. Do not delete resolved limitations; mark them `resolved` and record the first baseline where the resolution is verified.

Allowed capability statuses are `released`, `main-only`, `partial`, `deprecated`, `removed`, and `unsupported`.

Allowed coverage statuses are `covered`, `partial`, `missing`, `not-documentable`, and `historical-only`.

## Maintenance rule

Every released or partial capability must have a row in both the baseline and coverage matrix. Every active limitation must identify affected capabilities and its required public mentions. Unsupported behavior is normally `not-documentable`: document the boundary where it prevents a likely misunderstanding, but do not create feature-oriented content for it.

Blog posts are dated editorial snapshots. They can be corrected when a factual statement was already false on publication, but they never provide normative capability coverage and are always classified `historical-only` here.

Run `npm run docs:audit` after changing this directory or the authored docs. Run `npm run build` before merging documentation changes.

## Publication boundary

The maintenance system remains outside `docs/`, `blog/`, `static/`, and the configured LLM `includeOrder`. The audit command fails if a maintenance source appears in Docusaurus routes, the sitemap, generated route Markdown, or `llms*.txt`.