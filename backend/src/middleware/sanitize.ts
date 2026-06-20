import { Request, Response, NextFunction } from 'express';

/**
 * Strip keys that start with '$' or contain '.' from any plain object.
 * Prevents MongoDB operator injection (e.g. { "$gt": "" } in request body).
 */
function stripOperators(value: unknown, depth = 0): unknown {
  if (depth > 10 || value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((v) => stripOperators(v, depth + 1));

  const cleaned: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.')) continue;
    cleaned[key] = stripOperators((value as Record<string, unknown>)[key], depth + 1);
  }
  return cleaned;
}

/** Sanitize req.body, req.query, and req.params against NoSQL operator injection. */
export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = stripOperators(req.body) as Record<string, unknown>;
  }
  if (req.query && typeof req.query === 'object') {
    req.query = stripOperators(req.query) as Record<string, string>;
  }
  if (req.params && typeof req.params === 'object') {
    req.params = stripOperators(req.params) as Record<string, string>;
  }
  next();
};
