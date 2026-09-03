import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen,
  ClipboardCheck, Eye, FileText, Flag, Heart, Mail, MessageSquare, Send, Users,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import ErrorState from "@/components/common/ErrorState";
import StatCard from "@/features/admin/components/StatCard";
import { roleLabel } from "@/features/admin/components/RoleBadge";
import { Button } from "@/components/ui/button";
import { useAdminStats } from "@/features/admin/hooks/useAdmin";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Role } from "@/features/users/types";

/** Site-wide totals. Visible to moderators and above. */
export default function AdminDashboard() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useAdminStats();

  return (
    <Layout>
      <Seo title="Admin" noIndex />

      <div className="container-page pb-20 pt-12 sm:pt-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-4xl font-semibold sm:text-5xl">Admin</h1>
            <p className="mt-4 max-w-measure font-sans text-lg leading-relaxed text-muted-foreground">How the site is doing right now.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {user?.canModerate && (
              <Button variant="outline" asChild className="gap-2">
                <Link to="/admin/moderation">
                  <Flag className="h-4 w-4" aria-hidden="true" />
                  Moderation
                  {data && data.openReports > 0 && (
                    <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                      {data.openReports}
                    </span>
                  )}
                </Link>
              </Button>
            )}
            {user?.canEditOthers && (
              <Button variant="outline" asChild className="gap-2">
                <Link to="/admin/review">
                  <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                  Review queue
                </Link>
              </Button>
            )}
            {user?.canManageUsers && (
              <>
                <Button variant="outline" asChild className="gap-2">
                  <Link to="/admin/newsletter">
                    <Send className="h-4 w-4" aria-hidden="true" />
                    Newsletter
                  </Link>
                </Button>
                <Button variant="outline" asChild className="gap-2">
                  <Link to="/admin/users">
                    <Users className="h-4 w-4" aria-hidden="true" />
                    Users
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {isError ? (
          <ErrorState error={error} title="We couldn't load the dashboard." onRetry={() => refetch()} />
        ) : isLoading || !data ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4" aria-busy="true">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <>
            <section aria-labelledby="people" className="mb-10">
              <h2 id="people" className="eyebrow mb-4">
                People
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
                <StatCard
                  label="Total users" value={data.totalUsers}
                  icon={<Users className="h-4 w-4" />}
                  hint={`${data.newUsersThisWeek} joined this week`}
                />
                <StatCard label="Suspended" value={data.suspendedUsers}
                  emphasis={data.suspendedUsers > 0} />
                <StatCard
                  label="Newsletter" value={data.newsletterSubscribers}
                  icon={<Mail className="h-4 w-4" />}
                  hint="confirmed subscribers"
                />
                <StatCard
                  label="Open reports" value={data.openReports}
                  icon={<Flag className="h-4 w-4" />}
                  emphasis={data.openReports > 0}
                  hint={data.openReports > 0 ? "waiting on a decision" : "queue is clear"}
                />
              </div>
            </section>

            <section aria-labelledby="content" className="mb-10">
              <h2 id="content" className="eyebrow mb-4">
                Content
              </h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4">
                <StatCard
                  label="Posts" value={data.totalPosts}
                  icon={<FileText className="h-4 w-4" />}
                  hint={`${data.publishedPosts} published · ${data.draftPosts} drafts`}
                />
                <StatCard label="Views" value={data.totalViews} icon={<Eye className="h-4 w-4" />} />
                <StatCard label="Likes" value={data.totalLikes} icon={<Heart className="h-4 w-4" />} />
                <StatCard
                  label="Comments" value={data.totalComments}
                  icon={<MessageSquare className="h-4 w-4" />}
                  hint={data.hiddenComments > 0 ? `${data.hiddenComments} hidden` : undefined}
                />
              </div>
            </section>

            <section aria-labelledby="roles">
              <h2 id="roles" className="eyebrow mb-4">
                Roles
              </h2>
              <ul className="flex flex-wrap gap-2">
                {Object.entries(data.roles)
                  .sort((a, b) => b[1] - a[1])
                  .map(([role, total]) => (
                    <li
                      key={role}
                      className="rounded-md border border-border px-3 py-1.5 text-sm"
                    >
                      <span className="font-medium">{roleLabel(role as Role)}</span>
                      <span className="ml-2 tabular-nums text-muted-foreground">{total}</span>
                    </li>
                  ))}
              </ul>
            </section>

            <section aria-labelledby="developer" className="mt-10 border-t border-border pt-6">
              <h2 id="developer" className="eyebrow mb-4">
                Developer
              </h2>
              <p className="mb-3 text-sm text-muted-foreground">
                The API documents itself from the code, so these are always in step
                with what the server actually does.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild className="gap-2">
                  <a href="/api/docs/" target="_blank" rel="noopener noreferrer">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    Swagger UI
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/api/redoc/" target="_blank" rel="noopener noreferrer">
                    ReDoc
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/api/schema/" target="_blank" rel="noopener noreferrer">
                    OpenAPI schema
                  </a>
                </Button>
              </div>
            </section>
          </>
        )}
      </div>
    </Layout>
  );
}
