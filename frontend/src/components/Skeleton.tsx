import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('skeleton', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="glass-card border-0 overflow-hidden p-4 sm:p-5 space-y-3">
      <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
      <Skeleton className="h-8 w-20 rounded" />
      <Skeleton className="h-4 w-24 rounded" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr className="border-b border-border">
      <td className="p-3 sm:p-4">
        <Skeleton className="h-4 w-24 rounded" />
      </td>
      <td className="p-3 sm:p-4 hidden sm:table-cell">
        <Skeleton className="h-4 w-20 rounded" />
      </td>
      <td className="p-3 sm:p-4 hidden sm:table-cell">
        <Skeleton className="h-4 w-20 rounded" />
      </td>
      <td className="p-3 sm:p-4">
        <Skeleton className="h-4 w-16 rounded" />
      </td>
      <td className="p-3 sm:p-4 text-right">
        <Skeleton className="h-4 w-14 rounded ml-auto" />
      </td>
    </tr>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="glass-card border-0 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="p-3 sm:p-4 text-left">
              <Skeleton className="h-4 w-12 rounded" />
            </th>
            <th className="p-3 sm:p-4 text-left hidden sm:table-cell">
              <Skeleton className="h-4 w-20 rounded" />
            </th>
            <th className="p-3 sm:p-4 text-left hidden sm:table-cell">
              <Skeleton className="h-4 w-20 rounded" />
            </th>
            <th className="p-3 sm:p-4 text-left">
              <Skeleton className="h-4 w-16 rounded" />
            </th>
            <th className="p-3 sm:p-4 text-right">
              <Skeleton className="h-4 w-10 rounded ml-auto" />
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
