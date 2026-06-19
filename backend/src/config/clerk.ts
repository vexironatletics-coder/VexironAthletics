import { clerkClient } from '@clerk/clerk-sdk-node';

export { clerkClient };

export const isClerkConfigured = (): boolean =>
  Boolean(process.env.CLERK_SECRET_KEY);
