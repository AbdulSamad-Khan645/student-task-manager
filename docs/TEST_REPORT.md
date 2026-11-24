# Pre-Release Test Report: v1.0.0

| Item | Detail |
|---|---|
| Build under test | `release/v1.0.0` |
| Test date | 24 November 2026 |
| Automated tests | `npm test` (Node.js 24 built-in test runner), files in `tests/` |
| Manual UI tests | Desktop browser (Chromium, 1024x768) against `npm start` on `http://localhost:5173` |
| Test case design | First drafted with an AI assistant (Claude), then reviewed and extended by the team |
| Release gate | All test cases marked **[Critical]** must pass |

## 1. Test cases and results (final run)

Critical test cases are marked **[Critical]**. Raw runner output: [`test-results/run-2-after-fixes.txt`](test-results/run-2-after-fixes.txt).

| Test ID | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-01 | **[Critical]** Sign up with valid name, email and password | Account created; user is logged in | Account created; `currentUser()` returns the new user | Pass |
| TC-02 | Sign up with a blank name, invalid email (`not-an-email`) or short password (`123`) | Each attempt rejected with a clear message; no session | Rejected with `NAME_REQUIRED`, `INVALID_EMAIL`, `WEAK_PASSWORD`; no session | Pass |
| TC-03 | Sign up with an email that is already registered | Rejected: "An account with this email already exists." | Rejected with `EMAIL_TAKEN` | Pass |
| TC-04 | **[Critical]** Log in with registered email and correct password | User logged in; session stored | Logged in; session stored | Pass |
| TC-05 | **[Critical]** Log in with a wrong password | Rejected: "Incorrect email or password."; no session | Rejected with `INVALID_CREDENTIALS`; `currentUser()` is `null` | Pass |
| TC-06 | Log in with an email that is not registered | Rejected with the same generic message (does not reveal which emails exist) | Rejected with `INVALID_CREDENTIALS` | Pass |
| TC-07 | Log in with the email in different letter case (`  AYESHA@Uni.edu.pk `) | Logged in as `ayesha@uni.edu.pk` | Logged in (failed in run 1, fixed by BUG-02) | Pass |
| TC-08 | Log out, then reload the page | Session cleared; user stays logged out | Session cleared, still logged out after reload | Pass |
| TC-09 | **[Critical]** Check how passwords are stored | No plain-text password; salted SHA-256 hash; same password gives different hashes for different users | No plain text; 64-char hex hash; unique salt and hash per user | Pass |
| TC-10 | **[Critical]** Add task "  Submit SCD lab report  " | Task added with trimmed title, not completed | Task added as "Submit SCD lab report", `completed: false` | Pass |
| TC-11 | Add task with empty, whitespace-only or 121-character title | Rejected; list unchanged | Rejected with `TITLE_REQUIRED` / `TITLE_TOO_LONG` (failed in run 1, fixed by BUG-01) | Pass |
| TC-12 | **[Critical]** Reload the page; log in as a second student | Tasks still there after reload; second student sees an empty list | Tasks persisted; second student's list empty | Pass |
| TC-13 | **[Critical]** Add 3 tasks, delete the middle one | Only the selected task is removed | Only the selected task removed (failed in run 1, fixed by BUG-03) | Pass |
| TC-14 | Delete a task id that does not exist | Error "That task no longer exists."; list unchanged | Rejected with `NOT_FOUND`; list unchanged | Pass |
| TC-15 | **[Critical]** Mark a task complete, then untick it | Completed with timestamp and counter "1 of 1"; unticking reopens it | Completed with `completedAt`; reopened with `completedAt: null`; stats correct | Pass |

**Summary:** 15 executed, 15 passed, 0 failed. All 8 critical test cases pass.

## 2. Test run history

| Run | Build | Passed | Failed | Failed cases | Decision |
|---|---|---|---|---|---|
| 1 | `release/v1.0.0` before fixes | 12 | 3 | TC-07, TC-11, **TC-13 (Critical)** | **No-Go**: critical test failed |
| 2 | `release/v1.0.0` after BUG-01..03 fixes | 15 | 0 | none | **Go** |

Raw output of run 1: [`test-results/run-1-before-fixes.txt`](test-results/run-1-before-fixes.txt).

### Defects found and fixed on the release branch

| Bug ID | Found by | Severity | Description | Fix |
|---|---|---|---|---|
| BUG-01 | TC-11 | Medium | Whitespace-only titles created blank tasks, because the empty check ran before trimming. | Trim first, then validate. |
| BUG-02 | TC-07 | High | Login failed if the email's letter case differed from signup (`Ali@uni.edu` vs `ali@uni.edu`). | Emails trimmed and lower-cased at signup and login. |
| BUG-03 | TC-13 | **Critical** | Task ids came from `Date.now()`. Tasks created in the same millisecond shared an id, so deleting one deleted all of them (data loss). | Ids generated with `crypto.randomUUID()`. |

## 3. Manual UI smoke test (desktop browser)

| Test ID | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| UI-01 | Open Sign up tab, enter name, email, password, click **Create account** | Task screen opens, name shown in header | Task screen opened, "Ayesha Khan" shown | Pass |
| UI-02 | Add 3 tasks with Enter key | 3 tasks listed, "0 of 3 completed" | 3 tasks listed, counter correct | Pass |
| UI-03 | Try to add a task of only spaces | Error "Task title cannot be empty.", no task added | Error shown, still 3 tasks | Pass |
| UI-04 | Tick "Submit SCD lab report" | Struck through, "1 of 3 completed" | As expected | Pass |
| UI-05 | Click **Delete** on "Prepare for OOP quiz" | Only that task removed, "1 of 2 completed" | As expected | Pass |
| UI-06 | Log out, log in with wrong password | "Incorrect email or password." | Message shown, stayed on login | Pass |
| UI-07 | Log in with email typed in CAPITALS and correct password | Logged in; both remaining tasks and completed state kept | As expected | Pass |

## 4. Not covered in this cycle

- **Mobile phones and tablets were not tested** (no device testing in this cycle). Accepted as a risk for v1.0.0 and listed under known issues.
- Browsers other than Chromium.

## 5. Release decision

All critical test cases pass and no release-blocking defect is open. **Decision: GO for v1.0.0.**

---

## 6. Addendum: v1.0.1 hotfix regression test

| Test ID | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| TC-16 | **[Critical]** On a 375px-wide phone screen, tap **Log in** with valid credentials | The tap reaches the button; user is logged in | v1.0.0: tap hit the card's decorative overlay, nothing happened (**Fail**). v1.0.1: tap reaches `BUTTON#auth-submit`, user logged in | Pass (v1.0.1) |

Full suite on `hotfix/login-bug`: 16 executed, 16 passed. Output: [`test-results/run-3-hotfix-v1.0.1.txt`](test-results/run-3-hotfix-v1.0.1.txt).
