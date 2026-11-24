# Hotfix v1.0.1 and Rollback Procedure

## 1. Incident

| Item | Detail |
|---|---|
| Reported | After the v1.0.0 release: "The Log in button does nothing on my phone." |
| Affected version | v1.0.0 |
| Affected users | Anyone on a screen 600px wide or narrower (phones). Desktop and tablets unaffected. |
| Severity | **Critical**: mobile students cannot log in or sign up, so they cannot reach their tasks. |
| Fixed in | **v1.0.1** (PATCH release: backwards-compatible bug fix) |

## 2. Reproduction (on v1.0.0)

Tested in a 375x812 phone viewport:

1. Open the app and enter a valid email and password.
2. Tap **Log in**.
3. **Result:** nothing happens and no session is created. The element under the centre of the button is `DIV.auth-card`, not the button.

On desktop the same steps log the user in, which is why pre-release testing (desktop only) missed it.

## 3. Root cause

`css/styles.css` adds a decorative accent wave on phones using `.auth-card::after` (`position: absolute`, 6.5rem tall, anchored to the bottom of the card). A positioned pseudo-element is painted on top of normal in-flow content, so the transparent layer sat over the submit button and captured every tap.

## 4. Fix

| File | Change |
|---|---|
| `css/styles.css` | `.auth-card` gets `isolation: isolate`; `.auth-card::after` gets `z-index: -1` and `pointer-events: none`, so the decoration stays visible but sits behind the form and ignores taps. |
| `tests/mobile-layout.test.js` | New regression test **TC-16 [Critical]**: fails if the overlay can receive pointer events or paint above the form. |
| `package.json`, `src/version.js` | Version 1.0.0 to **1.0.1** |
| `RELEASE_NOTES.md` | v1.0.1 section |

## 5. Hotfix workflow (as executed)

```bash
# 1. Branch from the production code (main = v1.0.0)
git switch main
git switch -c hotfix/login-bug

# 2. Write the regression test first and confirm it fails on v1.0.0
node --test tests/mobile-layout.test.js        # TC-16 failed

# 3. Fix, then run the whole suite
npm test                                       # 16/16 passed

# 4. Bump the PATCH version (1.0.0 -> 1.0.1) and update RELEASE_NOTES.md
git commit -am "chore(release): prepare v1.0.1 hotfix"

# 5. Release: merge into main, tag, and bring the fix back to develop
git switch main
git merge --no-ff hotfix/login-bug -m "Hotfix v1.0.1"
git tag -a v1.0.1 -m "v1.0.1: fix Log in button on mobile"
git switch develop
git merge --no-ff hotfix/login-bug

# 6. Publish
git push origin main develop hotfix/login-bug
git push origin v1.0.1
```

### Verification

| Check | v1.0.0 | v1.0.1 |
|---|---|---|
| TC-16 regression test | Fail | **Pass** |
| Full automated suite | 15/15 (TC-16 did not exist) | **16/16** |
| Element under the Log in button centre (375x812) | `DIV.auth-card` (overlay) | **`BUTTON#auth-submit`** |
| Tap **Log in** with valid credentials on phone viewport | Nothing happens | **Logged in, tasks shown** |
| Desktop login | Works | Works |

Raw output: [`test-results/run-3-hotfix-v1.0.1.txt`](test-results/run-3-hotfix-v1.0.1.txt).

## 6. Rollback procedure: reverting to v1.0.0 if v1.0.1 fails

**When to roll back:** the post-deployment smoke test of v1.0.1 fails (login, add, delete or complete broken on any device), or users report a new critical problem caused by v1.0.1. A rollback restores the last known good version **first**; the fix comes afterwards.

**Is it safe to roll back?** Yes. v1.0.1 changes only CSS and the version number. The stored data format (`stm.users`, `stm.session`, `stm.tasks.<email>`) is identical in both versions, so no user accounts or tasks are lost by going back to v1.0.0.

### Step 1: Restore production (takes about a minute)

Vercel keeps every previous deployment, so the v1.0.0 build can be put back without rebuilding:

1. Vercel dashboard → project **student-task-manager** → **Deployments**.
2. Find the production deployment of v1.0.0 (commit message "Release v1.0.0", tag `v1.0.0`).
3. Click **⋯ → Instant Rollback** (or **Promote to Production**) and confirm.

CLI alternative: `vercel rollback <v1.0.0-deployment-url>`.

After an Instant Rollback, Vercel stops automatically promoting new production deployments until one is promoted manually. That stops an accidental redeploy of the broken version.

### Step 2: Verify the rollback

- Open the live URL; the footer must show **v1.0.0**.
- Smoke test: sign up, log in, add, complete and delete a task.

### Step 3: Make `main` match production

Do not delete tags or force-push. Revert the hotfix merge so that history records what happened:

```bash
git switch main
git revert -m 1 <hotfix-merge-commit>    # the "Hotfix v1.0.1" merge on main
npm test                                 # 15/15 v1.0.0 tests must pass
git push origin main
```

The `v1.0.1` tag stays as a record of what was released. The next fix gets a **new** version number (v1.0.2); a published version number is never reused. If the hotfix branch is later merged again, revert the revert commit first, otherwise Git treats those changes as already merged.

### Step 4: Communicate

- Add a "v1.0.1: rolled back" note to `RELEASE_NOTES.md` with the reason.
- Tell users that the mobile login issue is back temporarily. Workaround: fill in the form and press **Go/Enter** on the phone keyboard (this submits the form without tapping the button), or use a wider screen.

### Step 5: Fix forward

Find the cause of the v1.0.1 failure, add a test that reproduces it, fix it on a new `hotfix/*` branch from `main`, and release **v1.0.2** using the same workflow as section 5.
