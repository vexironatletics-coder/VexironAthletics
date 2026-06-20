import { createClerkClient } from '@clerk/backend';

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const isClerkConfigured = (): boolean =>
  Boolean(process.env.CLERK_SECRET_KEY);
