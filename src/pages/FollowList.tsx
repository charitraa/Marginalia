import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import UserAvatar from "@/features/users/components/UserAvatar";
import * as userService from "@/features/users/api/userService";
import { pageCount } from "@/lib/api/normalize";
import { authorPath } from "@/lib/routes";

/**
 * Who follows an author, or who they follow.
 *
 * Public on purpose: follower counts appear on every profile, and a count
 * nobody can check is a number people stop believing.
 */
export default function FollowList({ mode }: { mode: "followers" | "following" }) {
  const { username = "" } = useParams();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["follows", mode, username, page],
    queryFn: () =>
      mode === "followers"
        ? userService.listFollowers(username, page)
        : userService.listFollowing(username, page),
    enabled: Boolean(username),
    placeholderData: (previous) => previous,
  });

  const people = data?.items ?? [];
  const heading = mode === "followers" ? "Followers" : "Following";

  return (
    <Layout>
      <Seo title={`${heading} · @${username}`} noIndex />

      <div className="container-page max-w-2xl pb-20">
        <PageHeader
          className="mb-10"
          eyebrow={
            <Link to={`/author/${username}`} className="transition-colors hover:text-foreground">
              @{username}
            </Link>
          }
          title={heading}
          description={data ? `${data.count} ${data.count === 1 ? "person" : "people"}.` : undefined}
        />

        {isError ? (
          <ErrorState error={error} title={`We couldn't load ${heading.toLowerCase()}.`}
                      onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : people.length === 0 ? (
          <EmptyState
            icon={<Users className="h-10 w-10" />}
            title={mode === "followers" ? "No followers yet" : "Not following anyone yet"}
            description={
              mode === "followers"
                ? "When someone follows this writer, they appear here."
                : "Authors they follow will appear here."
            }
          />
        ) : (
          <>
            <ul className="divide-y divide-border rounded-md border border-border">
              {people.map((person) => (
                <li key={person.id} className="flex items-center gap-3 p-4">
                  <UserAvatar user={person} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link to={authorPath(person)} className="font-medium hover:underline">
                      {person.name}
                    </Link>
                    {person.headline && (
                      <p className="line-clamp-1 text-sm text-muted-foreground">
                        {person.headline}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {data && pageCount(data) > 1 && (
              <Pagination page={page} pageCount={pageCount(data)} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
