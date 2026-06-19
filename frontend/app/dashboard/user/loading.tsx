import { Skeleton } from '@/components/ui/skeleton';

export default function UserDashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
