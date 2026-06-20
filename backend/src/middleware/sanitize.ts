import { Request, Response, NextFunction } from 'express';

/**
 * Strip keys that start with '$' or contain '.' from a plain object (in-place).
 * Prevents MongoDB operator injection (e.g. { "$gt": "" } in request body).
 *
 * Only req.body is sanitized — req.query and req.params are always strings,
 * so they cannot carry MongoDB operator objects.
 */
function stripOperators(obj: Record<string, unknown>, depth = 0): void {
  if (depth > 10) return;

  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
      continue;
    }
    const val = obj[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      stripOperators(val as Record<string, unknown>, depth + 1);
    }
    if (Array.isArray(val)) {
      for (const item of val) {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          stripOperators(item as Record<string, unknown>, depth + 1);
        }
      }
    }
  }
}

/** Sanitize req.body against NoSQL operator injection (mutates in-place). */
export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    stripOperators(req.body as Record<string, unknown>);
  }
  next();
};
