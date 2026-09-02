import { axiosInstance } from "@/lib/api/client";
import { normalizePage } from "@/lib/api/normalize";
import {
  normalizeAdminStats,
  normalizeAdminUser,
  normalizeModerationReport,
} from "./normalizers";
import type { Role } from "@/features/users/types";
import type { Paginated } from "@/types/common";
import type {
  AdminStats,
  AdminUser,
  ModerationAction,
  ModerationReport,
  ReportStatus,
} from "../types";

/**
 * Staff-only endpoints under /api/admin/.
 *
 * A request from an account without the capability comes back 403, so these
 * are only ever called from behind a role guard — but the guard is convenience,
 * and the 403 is the real protection.
 */

export async function getStats(): Promise<AdminStats> {
  const { data } = await axiosInstance.get("/api/admin/stats/");
  return normalizeAdminStats(data);
}

export interface AdminUserQuery {
  search?: string;
  role?: Role | "";
  state?: "suspended" | "unverified" | "";
  page?: number;
}

export async function listUsers(query: AdminUserQuery = {}): Promise<Paginated<AdminUser>> {
  const params: Record<string, string | number> = { page: query.page ?? 1 };
  if (query.search?.trim()) params.search = query.search.trim();
  if (query.role) params.role = query.role;
  if (query.state) params.state = query.state;

  const { data } = await axiosInstance.get("/api/admin/users/", { params });
  return normalizePage(data, normalizeAdminUser, query.page ?? 1, 10);
}

export async function setRole(username: string, role: Role): Promise<AdminUser> {
  const { data } = await axiosInstance.patch(`/api/admin/users/${username}/role/`, { role });
  return normalizeAdminUser(data);
}

/** `until` omitted suspends indefinitely. */
export async function suspendUser(
  username: string,
  reason: string,
  until?: string | null,
): Promise<AdminUser> {
  const body: Record<string, unknown> = { reason };
  if (until) body.until = until;
  const { data } = await axiosInstance.post(`/api/admin/users/${username}/suspend/`, body);
  return normalizeAdminUser(data);
}

export async function liftSuspension(username: string): Promise<AdminUser> {
  const { data } = await axiosInstance.delete(`/api/admin/users/${username}/suspend/`);
  return normalizeAdminUser(data);
}

export async function listReports(
  status: ReportStatus | "all" = "open",
  page = 1,
): Promise<Paginated<ModerationReport>> {
  const { data } = await axiosInstance.get("/api/admin/reports/", {
    params: { status, page },
  });
  return normalizePage(data, normalizeModerationReport, page, 10);
}

export async function actOnReport(
  reportId: string,
  action: ModerationAction,
): Promise<ModerationReport> {
  const { data } = await axiosInstance.post(`/api/admin/reports/${reportId}/action/`, { action });
  return normalizeModerationReport(data);
}
