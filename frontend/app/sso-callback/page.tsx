import { Suspense } from 'react';
import SSOCallbackPage from './SSOCallbackContent';
import { Loader2 } from 'lucide-react';

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      }
    >
      <SSOCallbackPage />
    </Suspense>
  );
}
