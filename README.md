# Website
This website is built using [Docusaurus](https://docusaurus.io/), a modern static website generator.

## Contributing

Please read our [Contributing Guide](https://github.com/reshaprio/.github/blob/main/CONTRIBUTING.md) before submitting any changes.

### Prerequisites
- Node.js (v18+)
- npm

### Setup
1. Fork the repository on GitHub
2. Clone your fork:
```bash
   git clone https://github.com/<your-username>/reshapr.io.git
   cd reshapr.io
```
3. Install dependencies:
```bash
   npm install
```
   > Note: this project uses `patch-package` (via `postinstall`) to apply a small
   > compatibility patch for `react-loadable-ssr-addon-v5-slorber` and avoid
   > Node.js `DEP0169` deprecation warnings during build.

4. Start the local development server:
```bash
   npm run start
```
   This opens a browser window at `http://localhost:3000`. Most changes are
   reflected live without restarting the server.

### Submitting Changes
- Create a new branch: `git checkout -b your-branch-name`
- Make your changes
- Commit with signoff using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/#summary):
```bash
  git commit -s -m "docs: your message"
```
- Push and open a Pull Request against the default branch

## Cache Cleanup
To remove all previous run and build artifacts:
```bash
rm -rf build .docusaurus
npm run start
```