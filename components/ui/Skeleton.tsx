import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function PostCardSkeleton() {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-5 w-14" />
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-raw)]">
        <Skeleton className="h-7 w-7" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4 items-center">
      <Skeleton className="h-20 w-20" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-48" />
    </div>
  );
}
