import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Ban, Search, ShieldCheck, Undo2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import RoleBadge, { roleLabel } from "@/features/admin/components/RoleBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useAdminUsers, useLiftSuspension, useSetRole, useSuspendUser,
} from "@/features/admin/hooks/useAdmin";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import { pageCount } from "@/lib/api/normalize";
import { authorPath } from "@/lib/routes";
import { formatDate } from "@/lib/format";
import type { Role } from "@/features/users/types";
import type { AdminUser } from "@/features/admin/types";

const ASSIGNABLE: Role[] = [
  "user", "member", "contributor", "author", "moderator", "editor", "admin", "super_admin",
];

/** Accounts, their roles and their suspensions. Admin and above. */
export default function AdminUsers() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<Role | "">("");
  const [page, setPage] = useState(1);
  const [suspending, setSuspending] = useState<AdminUser | null>(null);

  const debounced = useDebounce(search, 300);
  const { data, isLoading, isError, error, refetch } = useAdminUsers({
    search: debounced, role, page,
  });

  const setUserRole = useSetRole();
  const suspend = useSuspendUser();
  const lift = useLiftSuspension();

  const rows = data?.items ?? [];

  return (
    <Layout>
      <Seo title="Users · Admin" noIndex />

      <div className="container-page pb-20">
        <PageHeader
          className="mb-10"
          eyebrow="Marginalia / Admin"
          title="Users"
          description={data?.count ? `${data.count} accounts.` : "Manage roles and suspensions."}
        />

        <div className="mb-6 flex flex-wrap gap-3">
          <div className="relative min-w-56 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search name, username or email"
              className="pl-9"
              aria-label="Search users"
            />
          </div>

          <Select
            value={role || "all"}
            onValueChange={(value) => {
              setRole(value === "all" ? "" : (value as Role));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48" aria-label="Filter by role">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ASSIGNABLE.map((entry) => (
                <SelectItem key={entry} value={entry}>{roleLabel(entry)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isError ? (
          <ErrorState error={error} title="We couldn't load the user list." onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-2" aria-busy="true">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState title="No accounts match" description="Try a different search or role." />
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[46rem] text-sm">
              <thead className="border-b border-border bg-muted/40 text-left">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Account</th>
                  <th scope="col" className="px-4 py-3 font-medium">Role</th>
                  <th scope="col" className="px-4 py-3 font-medium">Posts</th>
                  <th scope="col" className="px-4 py-3 font-medium">Joined</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row) => {
                  const isSelf = row.id === user?.id;
                  return (
                    <tr key={row.id} className={row.isSuspended ? "bg-destructive/5" : undefined}>
                      <td className="px-4 py-3">
                        <Link to={authorPath(row)} className="font-medium hover:underline">
                          {row.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">{row.email}</p>
                        {row.isSuspended && (
                          <p className="mt-1 text-xs text-destructive">
                            Suspended{row.suspensionReason ? ` — ${row.suspensionReason}` : ""}
                          </p>
                        )}
                        {!row.isVerified && (
                          <p className="text-xs text-muted-foreground">Email not verified</p>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {isSelf ? (
                          // Nobody edits their own role; the API refuses it too.
                          <RoleBadge role={row.role} />
                        ) : (
                          <Select
                            value={row.role}
                            onValueChange={(value) =>
                              setUserRole.mutate({ username: row.username, role: value as Role })
                            }
                            disabled={setUserRole.isPending}
                          >
                            <SelectTrigger className="w-40" aria-label={`Role for ${row.username}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ASSIGNABLE.map((entry) => (
                                <SelectItem key={entry} value={entry}>{roleLabel(entry)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </td>

                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {row.postCount ?? 0}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(row.joinedAt)}</td>

                      <td className="px-4 py-3 text-right">
                        {isSelf ? (
                          <span className="text-xs text-muted-foreground">You</span>
                        ) : row.isSuspended ? (
                          <Button
                            variant="ghost" size="sm" className="gap-2"
                            onClick={() => lift.mutate(row.username)}
                            disabled={lift.isPending}
                          >
                            <Undo2 className="h-4 w-4" aria-hidden="true" />
                            Reinstate
                          </Button>
                        ) : (
                          <Button
                            variant="ghost" size="sm"
                            className="gap-2 text-destructive hover:text-destructive"
                            onClick={() => setSuspending(row)}
                          >
                            <Ban className="h-4 w-4" aria-hidden="true" />
                            Suspend
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && pageCount(data) > 1 && (
          <Pagination page={page} pageCount={pageCount(data)} onPageChange={setPage} />
        )}

        <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          You can only grant roles up to your own level, and cannot change an account at or above it.
          The API enforces this regardless of what this page shows.
        </p>
      </div>

      <ConfirmDialog
        open={Boolean(suspending)}
        onOpenChange={(open) => !open && setSuspending(null)}
        title={`Suspend ${suspending?.name ?? "this account"}?`}
        description="They will not be able to sign in. Their posts and comments stay published, and you can reinstate them at any time."
        confirmLabel="Suspend"
        destructive
        onConfirm={() => {
          if (suspending) {
            suspend.mutate({ username: suspending.username, reason: "Suspended by staff" });
          }
          setSuspending(null);
        }}
      />
    </Layout>
  );
}
