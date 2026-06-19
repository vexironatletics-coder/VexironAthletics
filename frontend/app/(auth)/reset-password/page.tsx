'use client';

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a strong password you haven't used before."
      imageSeed="auth-reset"
    >
      <ErrorBoundary>
        <ResetPasswordForm />
      </ErrorBoundary>
    </AuthLayout>
  );
}
