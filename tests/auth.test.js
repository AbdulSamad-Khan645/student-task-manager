import { describe, test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryStorage } from '../src/storage.js';
import { createAuth, USERS_KEY } from '../src/auth.js';

const student = { name: 'Ayesha Khan', email: 'ayesha@uni.edu.pk', password: 'secret123' };

describe('Signup and Login', () => {
  let storage;
  let auth;

  beforeEach(() => {
    storage = createMemoryStorage();
    auth = createAuth(storage);
  });

  test('TC-01 [Critical] Sign up with valid details creates the account and logs the user in', async () => {
    const user = await auth.signup(student);
    assert.deepEqual(user, { name: student.name, email: student.email });
    assert.deepEqual(auth.currentUser(), { name: student.name, email: student.email });
  });

  test('TC-02 Sign up with a missing name, invalid email or short password is rejected', async () => {
    await assert.rejects(auth.signup({ ...student, name: '   ' }), { code: 'NAME_REQUIRED' });
    await assert.rejects(auth.signup({ ...student, email: 'not-an-email' }), { code: 'INVALID_EMAIL' });
    await assert.rejects(auth.signup({ ...student, password: '123' }), { code: 'WEAK_PASSWORD' });
    assert.equal(auth.currentUser(), null);
  });

  test('TC-03 Sign up with an email that is already registered is rejected', async () => {
    await auth.signup(student);
    auth.logout();
    await assert.rejects(auth.signup({ ...student, name: 'Someone Else' }), { code: 'EMAIL_TAKEN' });
  });

  test('TC-04 [Critical] Log in with a registered email and correct password', async () => {
    await auth.signup(student);
    auth.logout();
    const user = await auth.login({ email: student.email, password: student.password });
    assert.equal(user.name, student.name);
    assert.equal(auth.currentUser()?.email, student.email);
  });

  test('TC-05 [Critical] Log in with a wrong password is rejected and no session is created', async () => {
    await auth.signup(student);
    auth.logout();
    await assert.rejects(
      auth.login({ email: student.email, password: 'wrong-password' }),
      { code: 'INVALID_CREDENTIALS' },
    );
    assert.equal(auth.currentUser(), null);
  });

  test('TC-06 Log in with an email that is not registered is rejected', async () => {
    await assert.rejects(
      auth.login({ email: 'nobody@uni.edu.pk', password: 'secret123' }),
      { code: 'INVALID_CREDENTIALS' },
    );
  });

  test('TC-07 Log in works when the email is typed in a different letter case', async () => {
    await auth.signup(student);
    auth.logout();
    await auth.login({ email: '  AYESHA@Uni.edu.pk ', password: student.password });
    assert.equal(auth.currentUser()?.email, student.email);
  });

  test('TC-08 Log out clears the session', async () => {
    await auth.signup(student);
    auth.logout();
    assert.equal(auth.currentUser(), null);
    assert.equal(createAuth(storage).currentUser(), null, 'still logged out after a page reload');
  });

  test('TC-09 [Critical] Passwords are stored as salted hashes, never as plain text', async () => {
    await auth.signup(student);
    await auth.signup({ ...student, email: 'bilal@uni.edu.pk' });
    const raw = storage.getItem(USERS_KEY);
    assert.ok(!raw.includes(student.password), 'plain-text password found in storage');

    const users = JSON.parse(raw);
    const first = users['ayesha@uni.edu.pk'];
    const second = users['bilal@uni.edu.pk'];
    assert.match(first.passwordHash, /^[0-9a-f]{64}$/);
    assert.notEqual(first.salt, second.salt);
    assert.notEqual(first.passwordHash, second.passwordHash, 'same password must hash differently');
  });
});
