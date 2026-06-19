'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, Phone, Shield, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useGetMeQuery, useUpdateMeMutation } from '@/store/api/userApi';
import { updateUser } from '@/store/slices/authSlice';
import type { RootState } from '@/store';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: me, isLoading } = useGetMeQuery();
  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();
  const profile = me ?? user;
  const isOAuth = profile?.provider !== 'local';

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile?.name ?? '', phone: '' },
  });

  useEffect(() => {
    if (profile) {
      form.reset({ name: profile.name, phone: '' });
    }
  }, [profile, form]);

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      const updated = await updateMe(data).unwrap();
      dispatch(updateUser(updated));
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const providerLabel =
    profile?.provider === 'google'
      ? 'Google'
      : profile?.provider === 'facebook'
        ? 'Facebook'
        : 'Email & Password';

  return (
    <ErrorBoundary>
      <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="mt-1 text-sm text-zinc-500">Manage your personal information and account details.</p>
          </div>

          {isLoading && !profile ? (
            <p className="text-zinc-500">Loading profile...</p>
          ) : (
            <>
              <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800">
                <div className="h-28 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100" />
                <CardContent className="relative px-6 pb-6">
                  <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex items-end gap-4">
                      <div className="relative h-28 w-28 overflow-hidden rounded-2xl border-4 border-white bg-zinc-100 shadow-lg dark:border-zinc-950 dark:bg-zinc-800">
                        {profile?.avatar ? (
                          <Image
                            src={profile.avatar}
                            alt={profile.name}
                            fill
                            className="object-cover"
                            sizes="112px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <UserIcon className="h-10 w-10 text-zinc-400" />
                          </div>
                        )}
                      </div>
                      <div className="pb-1">
                        <h2 className="text-xl font-bold">{profile?.name}</h2>
                        <p className="text-sm text-zinc-500">{profile?.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary" className="capitalize">
                            {profile?.role}
                          </Badge>
                          <Badge variant="outline">{providerLabel}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold">Edit Profile</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {isOAuth
                      ? 'Your photo and email come from your connected account.'
                      : 'Update your display name and contact details.'}
                  </p>

                  <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="name">Display name</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input id="name" className="pl-10" {...form.register('name')} />
                      </div>
                      {form.formState.errors.name && (
                        <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                          id="email"
                          value={profile?.email ?? ''}
                          disabled
                          readOnly
                          className={cn('pl-10', isOAuth && 'bg-zinc-50 dark:bg-zinc-900')}
                        />
                      </div>
                      {isOAuth && (
                        <p className="text-xs text-zinc-500">Managed by {providerLabel}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input id="phone" className="pl-10" placeholder="+92 300 1234567" {...form.register('phone')} />
                      </div>
                    </div>

                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="rounded-full bg-zinc-100 p-3 dark:bg-zinc-800">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Account security</h3>
                    <p className="mt-1 text-sm text-zinc-500">
                      {isOAuth
                        ? 'Password changes are managed through your OAuth provider.'
                        : 'Change your password anytime from Settings.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
      </div>
    </ErrorBoundary>
  );
}
