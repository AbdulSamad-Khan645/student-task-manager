import { readJSON, writeJSON } from './storage.js';

export const USERS_KEY = 'stm.users';
export const SESSION_KEY = 'stm.session';
export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class AuthError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

function toHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function randomSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return toHex(new Uint8Array(digest));
}

function publicProfile(user) {
  return { name: user.name, email: user.email };
}

// Accounts live in storage under USERS_KEY, keyed by email. Passwords are
// never stored: only a per-user random salt and SHA-256(salt:password).
export function createAuth(storage) {
  const loadUsers = () => readJSON(storage, USERS_KEY, {});
  const startSession = (email) => writeJSON(storage, SESSION_KEY, { email });

  return {
    async signup({ name, email, password } = {}) {
      const cleanName = String(name ?? '').trim();
      const cleanEmail = normalizeEmail(email);
      const rawPassword = String(password ?? '');

      if (!cleanName) {
        throw new AuthError('NAME_REQUIRED', 'Please enter your name.');
      }
      if (!EMAIL_PATTERN.test(cleanEmail)) {
        throw new AuthError('INVALID_EMAIL', 'Please enter a valid email address.');
      }
      if (rawPassword.length < MIN_PASSWORD_LENGTH) {
        throw new AuthError(
          'WEAK_PASSWORD',
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
        );
      }

      const users = loadUsers();
      if (users[cleanEmail]) {
        throw new AuthError('EMAIL_TAKEN', 'An account with this email already exists.');
      }

      const salt = randomSalt();
      users[cleanEmail] = {
        name: cleanName,
        email: cleanEmail,
        salt,
        passwordHash: await hashPassword(rawPassword, salt),
        createdAt: new Date().toISOString(),
      };
      writeJSON(storage, USERS_KEY, users);
      startSession(cleanEmail);
      return publicProfile(users[cleanEmail]);
    },

    async login({ email, password } = {}) {
      const cleanEmail = normalizeEmail(email);
      const user = loadUsers()[cleanEmail];
      const valid =
        user && (await hashPassword(String(password ?? ''), user.salt)) === user.passwordHash;
      if (!valid) {
        throw new AuthError('INVALID_CREDENTIALS', 'Incorrect email or password.');
      }
      startSession(cleanEmail);
      return publicProfile(user);
    },

    logout() {
      storage.removeItem(SESSION_KEY);
    },

    currentUser() {
      const session = readJSON(storage, SESSION_KEY, null);
      const user = session && loadUsers()[session.email];
      return user ? publicProfile(user) : null;
    },
  };
}
