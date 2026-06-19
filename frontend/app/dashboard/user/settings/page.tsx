'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useUpdateMeMutation, useChangePasswordMutation } from '@/store/api/userApi';
import { updateUser } from '@/store/slices/authSlice';
import type { RootState } from '@/store';

import { changePasswordSchema } from '@/lib/validators';

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
});

export default function SettingsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [updateMe] = useUpdateMeMutation();
  const [changePassword] = useChangePasswordMutation();
  const isOAuth = user?.provider !== 'local';

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', phone: '' },
  });

  const passwordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      const updated = await updateMe(data).unwrap();
      dispatch(updateUser(updated));
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: z.infer<typeof changePasswordSchema>) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
      toast.success('Password changed');
      passwordForm.reset();
    } catch {
      toast.error('Failed to change password');
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
          <h1 className="text-2xl font-bold">Settings</h1>

          <Card>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input {...profileForm.register('name')} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email ?? ''} disabled readOnly />
                  {isOAuth && <p className="mt-1 text-xs text-zinc-500">Email managed by OAuth provider</p>}
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input {...profileForm.register('phone')} />
                </div>
                <Button type="submit">Save Profile</Button>
              </form>
            </CardContent>
          </Card>

          {!isOAuth && (
            <Card>
              <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <div>
                    <Label>Current Password</Label>
                    <Input type="password" {...passwordForm.register('currentPassword')} />
                  </div>
                  <div>
                    <Label>New Password</Label>
                    <Input type="password" {...passwordForm.register('newPassword')} />
                  </div>
                  <div>
                    <Label>Confirm Password</Label>
                    <Input type="password" {...passwordForm.register('confirmPassword')} />
                  </div>
                  <Button type="submit">Update Password</Button>
                </form>
              </CardContent>
            </Card>
          )}
      </div>
    </ErrorBoundary>
  );
}
