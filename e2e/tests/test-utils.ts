import { APIRequestContext } from '@playwright/test';

const BACKEND_API = 'http://localhost:5000/api';

export interface TestUser {
  fullName: string;
  email: string;
  password: string;
}

/**
 * Builds a unique test user so repeated runs never collide on "email already
 * registered" — the backend's in-memory store is shared across the whole
 * test run (and persists for the life of the dev server outside CI).
 */
export function makeTestUser(prefix = 'user'): TestUser {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  return {
    fullName: 'Test User',
    email: `${prefix}-${unique}@example.com`,
    password: 'secret123'
  };
}

/**
 * Registers a user directly via the API (bypassing the UI). Useful in tests
 * that only care about the login flow, so they don't depend on the register
 * form also working correctly.
 */
export async function registerUserViaApi(request: APIRequestContext, user: TestUser) {
  const response = await request.post(`${BACKEND_API}/auth/register`, { data: user });
  if (!response.ok()) {
    throw new Error(`Failed to seed test user via API: ${response.status()} ${await response.text()}`);
  }
}
