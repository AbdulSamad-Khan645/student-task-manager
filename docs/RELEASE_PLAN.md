# Release Plan: Student Task Manager v1.0.0

| Item | Detail |
|---|---|
| Product | Student Task Manager (web app for college students) |
| Version number | **v1.0.0** (first public release) |
| Release date | **Tuesday, 24 November 2026** |
| Release type | Major (first production release) |
| Release branch | `release/v1.0.0` (cut from `develop`) |
| Production branch / tag | `main` / `v1.0.0` |
| Hosting | Vercel (static site, production URL recorded in `RELEASE_NOTES.md`) |
| Prepared with | AI assistant (Claude) for the first draft, then reviewed and edited by the team |

## 1. Scope: features in this release

| # | Feature | Description |
|---|---|---|
| F-01 | User signup | Create an account with name, email and password (min. 6 characters). Duplicate emails are rejected. |
| F-02 | User login / logout | Log in with email and password; log out clears the session. Passwords are stored only as salted SHA-256 hashes. |
| F-03 | Add task | Add a task with a title of up to 120 characters. |
| F-04 | Delete task | Remove a single task from the list. |
| F-05 | Mark task as complete | Tick a task to mark it complete (and untick to reopen it); a counter shows progress. |
| F-06 | Per-user task lists | Each student only sees their own tasks; tasks persist across page reloads. |

Out of scope for v1.0.0: task due dates, editing task titles, password reset, cloud sync across devices.

## 2. Bug fixes

Only bug fixes (no new features) may be committed to the release branch. These were found during pre-release testing and fixed on `release/v1.0.0`:

| Bug ID | Severity | Bug | Found by | Fix |
|---|---|---|---|---|
| BUG-01 | Medium | Whitespace-only task titles created blank tasks | TC-11 | Trim the title before validating it |
| BUG-02 | High | Login failed when the email's letter case differed from signup | TC-07 | Trim and lower-case emails at signup and login |
| BUG-03 | Critical | Tasks created in the same millisecond shared an id, so deleting one deleted all of them (data loss) | TC-13 | Unique ids from `crypto.randomUUID()` |

## 3. Timeline

| Step | Owner | Target |
|---|---|---|
| Feature freeze, all features merged to `develop` | Developer | 24 Nov 2026, 10:00 |
| Cut `release/v1.0.0` from `develop` | Release manager | 24 Nov 2026, 11:00 |
| Pre-release testing (automated + manual UI) | QA | 24 Nov 2026, 11:00 to 13:00 |
| Fix release-blocking bugs on the release branch | Developer | Same day |
| Go / No-Go decision | Release manager | 24 Nov 2026, 14:00 |
| Merge to `main`, tag `v1.0.0`, deploy to Vercel | Release manager | 24 Nov 2026, 14:30 |
| Post-release smoke test and monitoring | QA | First 24 hours |

## 4. Release checklist

**Before the release**
- [x] All planned features (F-01 to F-06) merged into `develop`
- [x] `release/v1.0.0` branch created from `develop`
- [x] Version bumped to `1.0.0` in `package.json` and `src/version.js`
- [x] Test cases written for Login, Add Task, Delete Task and Mark Complete
- [x] Automated test suite run (`npm test`) and results recorded in `docs/TEST_REPORT.md`
- [x] Manual UI smoke test in a browser
- [x] **All critical test cases pass** (release gate)
- [x] Release-blocking bugs fixed on the release branch and re-tested
- [x] `RELEASE_NOTES.md` written (features, bug fixes, known issues)

**Release**
- [ ] `release/v1.0.0` merged into `main` with `--no-ff`
- [ ] Tag `v1.0.0` created and pushed (`git tag v1.0.0`, `git push origin v1.0.0`)
- [ ] `release/v1.0.0` merged back into `develop`
- [ ] Deployed to Vercel production
- [ ] Live URL recorded in `RELEASE_NOTES.md`

**After the release**
- [ ] Smoke test on the live URL (signup, login, add, complete, delete)
- [ ] Previous production deployment kept available for instant rollback
- [ ] Monitor user reports for 24 hours; critical issues go through a `hotfix/*` branch

## 5. Go / No-Go criteria

- **Go:** every test case marked *Critical* passes, no open release-blocking bug, release notes complete.
- **No-Go:** any critical test case fails, or login / data persistence is broken in any supported browser.

## 6. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Login failures | Students cannot reach their tasks | Critical login test cases; hotfix process ready |
| Data loss (tasks deleted or overwritten) | Loss of trust | Tests that delete only the selected task; per-user storage keys |
| Untested devices or browsers | Feature broken for some users | Manual smoke test; quick hotfix and rollback path |
| Bad deployment | Site broken for everyone | Vercel keeps previous deployments; instant rollback to the last good version |

## 7. Rollback plan (summary)

v1.0.0 is the first production release, so there is no earlier version to roll back to. If it is badly broken, fix forward through a `hotfix/*` branch, or pause the Vercel project until the fix is live. From v1.0.1 onward, rollback means re-promoting the previous good deployment in Vercel (Instant Rollback) and reverting the release merge on `main`. Full procedure: `docs/HOTFIX_AND_ROLLBACK.md` (added with the first hotfix).
