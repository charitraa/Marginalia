import { Skeleton } from "@/components/ui/skeleton";

/** Placeholders that match the real layout, so nothing jumps when data lands. */

export function PostCardSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-hidden="true">
      <Skeleton className="aspect-[3/2] w-full rounded-md" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
      </div>
    </div>
  );
}

export function PostRowSkeleton() {
  return (
    <div className="flex gap-6 border-b border-border py-8 sm:gap-10" aria-hidden="true">
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="hidden aspect-[4/3] w-36 shrink-0 rounded-md sm:block sm:w-52" />
    </div>
  );
}

export function PostGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading stories"
    >
      {Array.from({ length: count }).map((_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PostListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading stories">
      {Array.from({ length: count }).map((_, index) => (
        <PostRowSkeleton key={index} />
      ))}
    </div>
  );
}

export function RankedListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading stories">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="mb-12 grid gap-8 border-t border-foreground/15 pt-8 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,20rem)] lg:gap-10"
          aria-hidden="true"
        >
          <Skeleton className="h-12 w-12 shrink-0" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="hidden aspect-[4/3] w-full rounded-md lg:block" />
        </div>
      ))}
    </div>
  );
}

export function ArticleSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading story">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-3/4" />
      <div className="flex items-center gap-3 pt-2">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
      <Skeleton className="aspect-[16/9] w-full rounded-md" />
      <div className="space-y-4 pt-4">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className={index % 3 === 2 ? "h-4 w-2/3" : "h-4 w-full"} />
        ))}
      </div>
    </div>
  );
}

export function CommentSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-8" role="status" aria-label="Loading comments">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading profile">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
        <div className="w-full space-y-3">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4"
      role="status"
      aria-label="Loading stats"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3 border-t border-border pt-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-12" />
        </div>
      ))}
    </div>
  );
}
