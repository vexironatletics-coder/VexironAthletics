import { Badge } from '@/components/ui/badge';
import { statusConfig, type OrderStatus } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.color as 'amber' | 'blue' | 'purple' | 'green' | 'red'}>
      {config.label}
    </Badge>
  );
}
