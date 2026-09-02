import type { Role } from "@/features/users/types";
import type { ReportStatus } from "../types";

export const adminKeys = {
  all: ["admin"] as const,
  stats: ["admin", "stats"] as const,
  users: (query: { search?: string; role?: Role | ""; state?: string; page?: number }) =>
    ["admin", "users", query] as const,
  reports: (status: ReportStatus | "all", page: number) =>
    ["admin", "reports", status, page] as const,
};
