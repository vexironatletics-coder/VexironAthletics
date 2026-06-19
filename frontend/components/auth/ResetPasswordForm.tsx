'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/components/ui/motion';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validators';
import { useResetPasswordMutation } from '@/store/api/userApi';
import { Suspense, useState } from 'react';

function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword(data).unwrap();
      setSuccess(true);
      toast.success('Password updated successfully!');
      setTimeout(() => router.push('/login'), 2500);
    } catch {
      toast.error('Invalid or expired reset link. Please request a new one.');
    }
  };

  if (!token) {
    return (
      <AuthCard>
        <div className="text-center">
          <p className="text-sm text-zinc-500">Invalid reset link.</p>
          <Button asChild className="mt-4">
            <Link href="/forgot-password">Request new link</Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <AuthCard>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Password updated</h2>
          <p className="mt-2 text-sm text-zinc-500">Redirecting you to sign in...</p>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('token')} />
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="password"
              type="password"
              className="pl-10 transition-all duration-200"
              placeholder="••••••••"
              {...register('password')}
            />
          </div>
          {errors.password && (
            <p className="animate-fade-in text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="confirmPassword"
              type="password"
              className="pl-10 transition-all duration-200"
              placeholder="••••••••"
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <p className="animate-fade-in text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" className="h-11 w-full gap-2 transition-transform active:scale-[0.98]" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Reset Password'}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>
    </AuthCard>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
