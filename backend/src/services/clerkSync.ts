import { clerkClient } from '../config/clerk';
import { UserProvider } from '../models/User';

export interface ClerkSyncData {
  name: string;
  email: string;
  avatar?: string;
  clerkId: string;
  provider: UserProvider;
}

export const syncClerkUser = async (clerkUserId: string): Promise<ClerkSyncData> => {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const externalProvider = clerkUser.externalAccounts[0]?.provider ?? 'local';

  let provider: UserProvider = 'local';
  if (externalProvider.includes('google')) {
    provider = 'google';
  } else if (externalProvider.includes('facebook')) {
    provider = 'facebook';
  }

  const primaryEmail = clerkUser.emailAddresses.find(
    (entry) => entry.id === clerkUser.primaryEmailAddressId
  );

  return {
    name: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || 'User',
    email: primaryEmail?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? '',
    avatar: clerkUser.imageUrl,
    clerkId: clerkUserId,
    provider,
  };
};
