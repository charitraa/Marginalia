import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";
import { PostGridSkeleton } from "@/components/common/Skeletons";

/**
 * Shown while a lazily loaded route downloads. It mirrors the page frame — the
 * same masthead rhythm and the same card grid the real page uses — so the
 * layout does not jump when it arrives.
 */
export default function RouteFallback() {
  return (
    <Layout>
      <div className="container-page pb-20">
        <span className="sr-only" role="status">
          Loading page
        </span>
        <div className="border-b border-foreground/15 pb-10 pt-12 sm:pt-16">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="mt-5 h-12 w-2/3 max-w-md" />
          <Skeleton className="mt-5 h-5 w-1/2 max-w-sm" />
        </div>
        <div className="mt-12">
          <PostGridSkeleton count={6} />
        </div>
      </div>
    </Layout>
  );
}
