/**
 * types/express.d.ts
 * ─────────────────────────────────────────────────────────────
 * File: backend/src/types/express.d.ts
 * ─────────────────────────────────────────────────────────────
 *
 * Purpose:
 *   Extends the Express Request interface to include `user`
 *   after JWT authentication middleware runs.
 *
 *   Without this, TypeScript would complain that `req.user`
 *   does not exist on the base Express Request type.
 * ─────────────────────────────────────────────────────────────
 */

import { UserRole } from './models';

declare global {
  namespace Express {
    interface Request {
      /**
       * Set by authMiddleware after JWT verification.
       * Contains the decoded token payload.
       */
      user?: {
        id: string;
        role: UserRole;
      };
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
    }
    interface Process {
      env: ProcessEnv;
    }
  }

  const process: NodeJS.Process;
}

export {};

