import { env } from '@config/env';

export type UserRole = 'user' | 'approver';

export interface TestUser {
  role: UserRole;
  email: string;
  password: string;
}

/**
 * Credentials are read lazily from `env` so that a suite which only needs the
 * default user never fails because an optional role is unconfigured.
 */
export const users: Record<UserRole, TestUser> = {
  user: {
    role: 'user',
    get email() {
      return env.credentials.email;
    },
    get password() {
      return env.credentials.password;
    },
  },
  approver: {
    role: 'approver',
    get email() {
      return env.approver.email;
    },
    get password() {
      return env.approver.password;
    },
  },
};

/** Invalid credentials for negative-path login checks. */
export const invalidUser: TestUser = {
  role: 'user',
  email: 'not.a.real.user@example.com',
  password: 'WrongPassword123!',
};
