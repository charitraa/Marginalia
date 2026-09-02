import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as adminService from "../api/adminService";
import { adminKeys } from "../api/queryKeys";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { errorMessage } from "@/lib/errors";
import type { Role } from "@/features/users/types";
import type { ModerationAction, ReportStatus } from "../types";

/**
 * Query hooks for the admin area.
 *
 * Each is disabled unless the signed-in account actually holds the capability,
 * so a reader who types /admin into the address bar never fires a request that
 * is guaranteed to 403.
 */

export function useAdminStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: adminService.getStats,
    enabled: Boolean(user?.canModerate),
    staleTime: 60_000,
  });
}

export function useAdminUsers(query: adminService.AdminUserQuery) {
  const { user } = useAuth();
  return useQuery({
    queryKey: adminKeys.users(query),
    queryFn: () => adminService.listUsers(query),
    enabled: Boolean(user?.canManageUsers),
    placeholderData: (previous) => previous,
  });
}

export function useSetRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ username, role }: { username: string; role: Role }) =>
      adminService.setRole(username, role),
    onSuccess: (updated) => {
      toast.success(`${updated.username} is now ${updated.role.replace("_", " ")}.`);
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (error) => toast.error(errorMessage(error, "Could not change that role.")),
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      username,
      reason,
      until,
    }: {
      username: string;
      reason: string;
      until?: string | null;
    }) => adminService.suspendUser(username, reason, until),
    onSuccess: (updated) => {
      toast.success(`${updated.username} has been suspended.`);
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (error) => toast.error(errorMessage(error, "Could not suspend that account.")),
  });
}

export function useLiftSuspension() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (username: string) => adminService.liftSuspension(username),
    onSuccess: (updated) => {
      toast.success(`${updated.username} can sign in again.`);
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (error) => toast.error(errorMessage(error, "Could not lift that suspension.")),
  });
}

export function useModerationReports(status: ReportStatus | "all", page: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: adminKeys.reports(status, page),
    queryFn: () => adminService.listReports(status, page),
    enabled: Boolean(user?.canModerate),
    placeholderData: (previous) => previous,
  });
}

export function useModerationAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, action }: { reportId: string; action: ModerationAction }) =>
      adminService.actOnReport(reportId, action),
    onSuccess: (_report, { action }) => {
      const said = {
        hide: "Comment hidden from public threads.",
        unhide: "Comment restored.",
        dismiss: "Report dismissed; the comment stays visible.",
      }[action];
      toast.success(said);
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (error) => toast.error(errorMessage(error, "Could not apply that decision.")),
  });
}
