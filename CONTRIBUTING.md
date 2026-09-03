# Contributing to reShapr Documentation

Follow the organization-wide [contribution guide](https://github.com/reshaprio/.github/blob/main/CONTRIBUTING.md) for the Git and pull-request workflow. This document adds the authoring and validation rules specific to `reshapr.io`.

## Prerequisites

- Node.js 20 or later
- npm

Install dependencies with `npm install`.

## Documentation Contract

Write documentation in English and give each page one primary [Diátaxis](https://diataxis.fr/) purpose:

- **Tutorials** help a learner complete a reproducible journey.
- **How-to guides** help a practitioner achieve a specific goal.
- **Explanations** build understanding and remain conceptual.
- **References** describe interfaces and behavior precisely.

Keep introductions, decisions, and the first useful example on `reshapr.io`. Keep exhaustive or volatile implementation details in the repository that owns them.

### Content ownership

| Content | Canonical owner |
|---|---|
| Product architecture, runtime behavior, CLI, Web UI, and REST contracts | [`reshapr`](https://github.com/reshaprio/reshapr) |
| Kubernetes controllers, CRDs, samples, and controller architecture | [`reshapr-controllers`](https://github.com/reshaprio/reshapr-controllers) |
| Helm charts, values, and chart deployment details | [`reshapr-helm-charts`](https://github.com/reshaprio/reshapr-helm-charts) |
| User journeys, concepts, orientation, and bounded examples | [`reshapr.io`](https://github.com/reshaprio/reshapr.io) |

Do not copy complete CLI help, OpenAPI schemas, CRD schemas, Helm values tables, or deployment manifests into this site. Summarize the decision a reader must make, show the first useful example, and link to the canonical owner.

## Evidence and Links

Every technical capability or limitation must be supported by a public, tracked source such as code, a contract, a test, a release artifact, or owner documentation.

Before adding a GitHub link:

1. Confirm that the target is tracked in its repository and available on GitHub.
2. Link to the repository that owns the detail.
3. Use a release tag for executable procedures and examples that depend on a specific version.
4. Use the default branch for evolving concepts or implementation orientation.
5. Keep all links within one executable guide consistent with the guide's stated release.

Never use an untracked local file as canonical evidence. In particular, files that exist only in a neighboring checkout, private working tree, generated output, or ignored directory are not publishable references.

Prefer relative links between pages in this repository. Preserve published URLs when moving content by adding a Docusaurus redirect or alias.

## Executable Documentation

The current documentation baseline is reShapr `0.2.3`. Tutorials and how-to guides that contain commands must:

- state `Last verified with reShapr 0.2.3 on <date>` near the top;
- use commands, options, images, outputs, and release links compatible with `0.2.3`;
- label generated identifiers, timestamps, hostnames, and other changing output as examples;
- include an observable success check;
- state relevant limitations rather than implying unsupported guarantees.

When the baseline changes, update the marker and examples only after replaying the documented procedure.

## Page Structure

Use only the sections that support the page's Diátaxis purpose.

### Tutorials

- `Prerequisites`: what the learner needs before starting.
- `Result`: the observable outcome produced by the journey.
- `Next step`: the next useful journey or concept.
- `Limits`: relevant boundaries that could change the learner's expectations.

The final tutorial step must verify the promised result.

### How-to guides

- `Prerequisites`: required access, tools, and state.
- `Result`: how to verify that the goal was achieved.
- `Limits`: operational or product boundaries relevant to the task.
- `Next step`: a related task when one naturally follows.

### Explanations

Do not force procedural sections into an explanation. Link to tutorials or how-to guides for execution and to references for exhaustive details.

### References

Identify the canonical owner and version sensitivity of volatile interfaces. Prefer precise tables and examples, but link rather than duplicate exhaustive owner contracts.

## Generated Content

Do not edit `build/**`, `llms.txt`, `llms-full.txt`, generated route Markdown, or `.docusaurus/**` manually. The build creates and validates machine-readable content from the authored sources.

## Validation

Before opening a pull request:

1. Recheck technical claims against their canonical owner.
2. Verify local, GitHub, and external links.
3. Replay changed executable steps against their stated release.
4. Run `npm run build`.
5. Review generated human-facing and machine-readable content for contradictory claims.

The build must complete successfully before the documentation change is ready for review.