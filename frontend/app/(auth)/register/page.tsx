import { Suspense } from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthRedirect } from '@/components/auth/AuthRedirect';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Join VexironAthletics"
      subtitle="Create an account to save favorites, track orders, and enjoy a personalized experience."
      imageSeed="auth-register"
    >
      <ErrorBoundary>
        <Suspense fallback={null}>
          <AuthRedirect />
        </Suspense>
        <RegisterForm />
      </ErrorBoundary>
    </AuthLayout>
  );
}
