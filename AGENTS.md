# AGENTS.md - reshapr.io

## Project Overview

This repository contains the public reShapr documentation and website built with Docusaurus. Documentation is written in English and organized using the four Diátaxis types: Tutorials, How-to guides, Explanations, and References.

Read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before changing authored content. It is the canonical documentation contract; this file contains only agent-critical instructions.

## Build and Validation

Requires Node.js 20 or later and npm.

```bash
npm install
npm run build
```

`npm run build` builds Docusaurus, generates route and blog Markdown, injects machine directives, and validates machine-readable content. Run it after documentation changes.

## Authoring Rules

- Give every page one primary Diátaxis purpose and preserve its existing published URL unless a redirect or alias is added.
- Validate product claims against a tracked canonical source before writing them.
- Use reShapr `0.2.3` as the current baseline for executable documentation. Add `Last verified with reShapr 0.2.3 on <date>` and replay changed commands against that release.
- Clearly label generated IDs, timestamps, URLs, names, and command output as examples.
- Keep exhaustive CLI help, OpenAPI contracts, internal architecture, CRD schemas, Helm values, and manifests in their owner repositories. Summarize and link from this site.
- Use release-tagged links for executable procedures and default-branch links for evolving concepts.
- Confirm every GitHub target is tracked and publicly available. Never link to private working-tree files, ignored files, generated output, or neighboring local-only notes.
- Show relevant limitations and avoid guarantees that are not demonstrated by code, contracts, tests, or release artifacts.

## Canonical Owners

- Core runtime, CLI, Web UI, and OpenAPI contracts: [`reshapr`](https://github.com/reshaprio/reshapr)
- Kubernetes controllers, CRDs, and samples: [`reshapr-controllers`](https://github.com/reshaprio/reshapr-controllers)
- Helm charts and values: [`reshapr-helm-charts`](https://github.com/reshaprio/reshapr-helm-charts)
- User journeys, concepts, and bounded examples: this repository

## Generated Files

Do not manually edit `build/**`, `llms.txt`, `llms-full.txt`, generated route Markdown, or `.docusaurus/**`. Edit the authored source and regenerate with `npm run build`.

## Change Discipline

- Preserve unrelated user changes in a dirty worktree.
- Keep documentation changes focused on the requested behavior or page.
- Update `CONTRIBUTING.md` when the documentation contract changes; do not duplicate the full contract here.
- Run the narrowest useful check after the first edit, then finish with `npm run build` when the environment permits.