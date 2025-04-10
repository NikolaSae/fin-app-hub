import { cn } from '@/lib/utils';
import { ClaimStatus } from '@/types/claims';

interface StatusBadgeProps {
  status: ClaimStatus;
}

const statusColors: Record<ClaimStatus, string> = {
  DRAFT: 'bg-gray-500',
  NEW: 'bg-blue-500',
  PROCESSING: 'bg-yellow-500',
  WAITING_FOR_INFO: 'bg-orange-500',
  RESOLVED: 'bg-green-500',
  REJECTED: 'bg-red-500',
  CLOSED: 'bg-purple-500',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white',
        statusColors[status]
      )}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}