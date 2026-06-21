'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/components/ui/motion';
import { loginSchema, type LoginFormData } from '@/lib/validators';
import { useLoginMutation } from '@/store/api/userApi';
import { setCredentials } from '@/store/slices/authSlice';
import { getDashboardPath, ADMIN_DEMO_CREDENTIALS } from '@/lib/constants';
import { SocialAuth } from './SocialAuth';
import { AdminAccessCard } from './AdminAccessCard';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const fillAdminCredentials = () => {
    setValue('email', ADMIN_DEMO_CREDENTIALS.email, { shouldValidate: true });
    setValue('password', ADMIN_DEMO_CREDENTIALS.password, { shouldValidate: true });
    toast.success('Admin credentials filled — click Sign In');
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login({
        email: data.email.toLowerCase().trim(),
        password: data.password,
      }).unwrap();
      dispatch(setCredentials(result));
      toast.success('Welcome back!');
      const destination =
        searchParams.get('callbackUrl') ?? getDashboardPath(result.user.role);
      router.push(destination);
    } catch (err: unknown) {
      const apiErr = err as { status?: string | number; data?: { message?: string } };
      if (apiErr.status === 'FETCH_ERROR') {
        toast.error('Cannot reach API server. Start backend: cd backend && npm run dev');
        return;
      }
      if (apiErr.status === 503) {
        toast.error(apiErr.data?.message ?? 'Database not connected. Check MongoDB Atlas IP whitelist.');
        return;
      }
      toast.error(apiErr.data?.message ?? 'Invalid email or password');
    }
  };

  return (
    <AuthCard>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input id="email" type="email" className="pl-10" placeholder="you@example.com" {...register('email')} />
          </div>
          {errors.email && <p className="animate-fade-in text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-300"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input id="password" type="password" className="pl-10" placeholder="••••••••" {...register('password')} />
          </div>
          {errors.password && <p className="animate-fade-in text-sm text-red-500">{errors.password.message}</p>}
        </div>
        <Button type="submit" className="h-11 w-full gap-2 transition-transform active:scale-[0.98]" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">or continue with</span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      </div>

      <SocialAuth />

      {/* <AdminAccessCard onUseCredentials={fillAdminCredentials} /> */}

      <p className="mt-8 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-zinc-900 underline-offset-4 transition hover:underline dark:text-zinc-50">
          Create one
        </Link>
      </p>
    </AuthCard>
  );
}
