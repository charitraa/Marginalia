import Layout from "@/components/layout/Layout";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown while a lazily loaded route downloads. It mirrors the page frame so the
 * header stays put and the layout does not jump when the real page arrives.
 */
export default function RouteFallback() {
  return (
    <Layout>
      <div className="container-page py-16">
        <span className="sr-only" role="status">
          Loading page
        </span>
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="mt-4 h-5 w-1/2 max-w-sm" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="aspect-[16/10] w-full rounded-xl" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
