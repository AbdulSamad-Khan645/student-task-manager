# Release Notes: Student Task Manager

**Live deployment:** _recorded after the first production deployment_

---

## v1.0.1 (24 November 2026): hotfix

### Bug fixes
- **Log in / Create account button did nothing on phones.** On screens 600px wide or narrower, a decorative layer at the bottom of the login card covered the button and swallowed taps. The layer now sits behind the form and ignores taps. ([details](docs/HOTFIX_AND_ROLLBACK.md))

### Known issues
- Same as v1.0.0, except that login now works on phones.

### Quality
- New regression test TC-16 for the mobile login button; 16 of 16 automated tests passed.
- Re-tested in a 375x812 phone viewport: tapping **Log in** with valid credentials opens the task list.

### Rollback
If v1.0.1 causes problems, production can be returned to v1.0.0 with Vercel Instant Rollback. No data migration is needed. Procedure: [`docs/HOTFIX_AND_ROLLBACK.md`](docs/HOTFIX_AND_ROLLBACK.md#6-rollback-procedure-reverting-to-v100-if-v101-fails).

---

## v1.0.0 (24 November 2026)

First public release of Student Task Manager, a simple web app that helps college students keep track of coursework and errands.

### New features
- **Sign up** with your name, email and a password (at least 6 characters).
- **Log in / log out.** Your session is remembered until you log out.
- **Add tasks** with a title of up to 120 characters.
- **Delete tasks** you no longer need.
- **Mark tasks as complete** (and untick to reopen them), with a "completed" counter.
- **Private task lists:** each student only sees their own tasks, and tasks are kept after a page reload.
- Responsive layout with automatic light and dark themes.

### Bug fixes (found during pre-release testing)
- **BUG-01:** Task titles made only of spaces are now rejected instead of creating blank tasks.
- **BUG-02:** Logging in no longer fails when the email is typed with different capital letters.
- **BUG-03:** Deleting a task no longer deletes other tasks that were created at the same moment (each task now has a unique id).

### Known issues
- Accounts and tasks are saved in your browser (localStorage). They do not sync between devices or browsers, and clearing your browser data deletes them.
- Sign-in runs entirely in the browser; it is suitable for coursework, not for sensitive data. There is no password reset.
- Deleting a task is immediate; there is no undo.
- Not yet tested on mobile phones or tablets.

### Quality
- 15 automated test cases, 15 passed (8 of 8 critical). See `docs/TEST_REPORT.md`.
- Manual UI smoke test on desktop: 7 of 7 passed.
