import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
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

      <div className="container-page max-w-2xl py-10">
        <header className="mb-8">
          <p className="text-sm text-muted-foreground">
            <Link to={`/author/${username}`} className="hover:underline">
              @{username}
            </Link>
          </p>
          <h1 className="mt-1 font-serif text-3xl font-bold">{heading}</h1>
          {data && (
            <p className="mt-2 text-muted-foreground">
              {data.count} {data.count === 1 ? "person" : "people"}
            </p>
          )}
        </header>

        {isError ? (
          <ErrorState error={error} title={`We couldn't load ${heading.toLowerCase()}.`}
                      onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-lg bg-muted" />
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
            <ul className="divide-y divide-border rounded-lg border border-border">
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
