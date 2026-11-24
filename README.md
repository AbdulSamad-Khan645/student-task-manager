# Student Task Manager

A lightweight web app that helps college students keep track of their tasks.

- Sign up, log in and log out
- Add tasks, delete tasks, mark tasks as complete
- Each student has a private task list that survives page reloads

Plain HTML, CSS and JavaScript (ES modules). No build step and no runtime dependencies.

## Run locally

Requires Node.js 20 or newer.

```bash
npm start      # serves the app at http://localhost:5173
npm test       # runs the automated test suite
```

## Release management

| Document | Purpose |
|---|---|
| [`docs/RELEASE_PLAN.md`](docs/RELEASE_PLAN.md) | Release plan for v1.0.0: scope, dates, checklist, go/no-go criteria |
| [`docs/TEST_REPORT.md`](docs/TEST_REPORT.md) | Pre-release test cases and results |
| [`RELEASE_NOTES.md`](RELEASE_NOTES.md) | What changed in each version, known issues, live URL |

### Branching strategy

| Branch | Purpose |
|---|---|
| `main` | Stable production code. Only release and hotfix branches are merged here; every merge is tagged. |
| `develop` | Ongoing development. Feature branches (`feature/*`) are merged here. |
| `release/vX.Y.Z` | Pre-release testing. Cut from `develop`; only bug fixes allowed. Merged into `main` and back into `develop`. |
| `hotfix/*` | Urgent production fixes. Cut from `main`; merged into `main` and `develop`. |

### Versioning

The project follows [Semantic Versioning](https://semver.org/) `MAJOR.MINOR.PATCH`:

- **MAJOR**: incompatible changes (v1.0.0 is the first stable release)
- **MINOR**: new backwards-compatible features
- **PATCH**: backwards-compatible bug fixes (hotfixes)

The version lives in `package.json` and `src/version.js` (shown in the app footer). Each release on `main` gets an annotated Git tag such as `v1.0.0`.
