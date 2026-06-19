'use client';

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a link to reset your password."
      imageSeed="auth-forgot"
    >
      <ErrorBoundary>
        <ForgotPasswordForm />
      </ErrorBoundary>
    </AuthLayout>
  );
}
