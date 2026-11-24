import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const css = await readFile(new URL('../css/styles.css', import.meta.url), 'utf8');

// Regression test for the v1.0.1 hotfix (hotfix/login-bug).
// On screens up to 600px wide a decorative ::after layer covers the bottom of
// the auth card. In v1.0.0 it sat on top of the "Log in" / "Create account"
// button and swallowed every tap, so students could not log in on phones.
test('TC-16 [Critical] Decorative auth-card overlay never blocks taps on the Log in button (mobile)', () => {
  const overlayRules = [...css.matchAll(/\.auth-card::after\s*\{([^}]*)\}/g)].map((m) => m[1]);
  assert.ok(overlayRules.length > 0, 'expected a .auth-card::after rule in css/styles.css');

  for (const rule of overlayRules) {
    assert.match(rule, /pointer-events:\s*none/, 'overlay must not receive pointer events');
    assert.match(rule, /z-index:\s*-1/, 'overlay must paint behind the form controls');
  }
  assert.match(
    css,
    /\.auth-card\s*\{[^}]*isolation:\s*isolate/,
    '.auth-card must create its own stacking context so the overlay stays inside the card',
  );
});
