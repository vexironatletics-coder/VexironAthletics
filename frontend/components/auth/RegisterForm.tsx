'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AuthCard } from '@/components/ui/motion';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import { useRegisterMutation } from '@/store/api/userApi';
import { setCredentials } from '@/store/slices/authSlice';
import { getDashboardPath } from '@/lib/constants';
import { SocialAuth } from './SocialAuth';

export function RegisterForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      }).unwrap();
      dispatch(setCredentials(result));
      toast.success('Account created!');
      router.push(getDashboardPath(result.user.role));
    } catch {
      toast.error('Registration failed. Email may already be in use.');
    }
  };

  return (
    <AuthCard>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input id="name" className="pl-10" placeholder="John Doe" {...register('name')} />
          </div>
          {errors.name && <p className="animate-fade-in text-sm text-red-500">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input id="email" type="email" className="pl-10" placeholder="you@example.com" {...register('email')} />
          </div>
          {errors.email && <p className="animate-fade-in text-sm text-red-500">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input id="password" type="password" className="pl-10" placeholder="••••••••" {...register('password')} />
          </div>
          {errors.password && <p className="animate-fade-in text-sm text-red-500">{errors.password.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input id="confirmPassword" type="password" className="pl-10" placeholder="••••••••" {...register('confirmPassword')} />
          </div>
          {errors.confirmPassword && (
            <p className="animate-fade-in text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" className="h-11 w-full gap-2 transition-transform active:scale-[0.98]" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create Account'}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">or continue with</span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      </div>

      <SocialAuth />

      <p className="mt-8 text-center text-sm text-zinc-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-zinc-900 underline-offset-4 transition hover:underline dark:text-zinc-50">
          Sign in
        </Link>
      </p>
    </AuthCard>
  );
}
