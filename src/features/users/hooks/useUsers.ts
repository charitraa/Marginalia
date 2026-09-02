import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as userService from "../api/userService";
import { userKeys } from "../api/queryKeys";
import { errorMessage } from "@/lib/errors";

/** Author profiles, following, and the signed-in user's dashboard totals. */

export function useAuthor(username: string | undefined) {
  return useQuery({
    queryKey: userKeys.author(username ?? ""),
    queryFn: () => userService.getAuthor(username as string),
    enabled: Boolean(username),
  });
}

export function useDashboardStats(enabled = true) {
  return useQuery({
    queryKey: userKeys.dashboard,
    queryFn: userService.getDashboardStats,
    enabled,
  });
}

/** Follow / unfollow an author, refreshing that author's cached profile. */
export function useToggleFollow(username: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (following: boolean) => userService.setFollow(username as string, following),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.author(username ?? "") });
    },
    onError: (error) => toast.error(errorMessage(error, "Unable to update your follow.")),
  });
}
