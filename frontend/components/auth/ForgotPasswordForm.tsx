'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/components/ui/motion';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validators';
import { useForgotPasswordMutation } from '@/store/api/userApi';
import { useState } from 'react';

export function ForgotPasswordForm() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const result = await forgotPassword(data).unwrap();
      setSubmitted(true);
      if (result.resetUrl) {
        setDevResetUrl(result.resetUrl);
      }
      toast.success('Check your email for reset instructions');
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  if (submitted) {
    return (
      <AuthCard>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Check your inbox</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            If an account exists with that email, we&apos;ve sent password reset instructions.
            The link expires in 1 hour.
          </p>
          {devResetUrl && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left dark:border-amber-900/50 dark:bg-amber-950/30">
              <p className="text-xs font-medium text-amber-800 dark:text-amber-200">Dev mode — reset link:</p>
              <Link
                href={`/reset-password?token=${new URL(devResetUrl).searchParams.get('token') ?? ''}`}
                className="mt-1 block break-all text-xs text-amber-700 underline dark:text-amber-300"
              >
                Open reset page
              </Link>
            </div>
          )}
          <Button asChild variant="outline" className="mt-6 gap-2">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-600" />
            <Input
              id="email"
              type="email"
              className="pl-10 transition-all duration-200"
              placeholder="you@example.com"
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="animate-fade-in text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <Button type="submit" className="h-11 w-full gap-2 transition-transform active:scale-[0.98]" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
          {!isLoading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-500">
        Remember your password?{' '}
        <Link
          href="/login"
          className="font-semibold text-zinc-900 underline-offset-4 transition hover:underline dark:text-zinc-50"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
