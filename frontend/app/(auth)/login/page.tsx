'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthRedirect } from '@/components/auth/AuthRedirect';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to track orders, manage your wishlist, and checkout faster."
    >
      <ErrorBoundary>
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-2xl" />}>
          <AuthRedirect />
          <LoginForm />
        </Suspense>
      </ErrorBoundary>
    </AuthLayout>
  );
}
