import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as campaignService from "../api/campaignService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { errorMessage } from "@/lib/errors";
import type { CampaignInput } from "../types";

const KEY = ["newsletter", "campaigns"] as const;

export function useCampaigns(page = 1) {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...KEY, page],
    queryFn: () => campaignService.listCampaigns(page),
    enabled: Boolean(user?.canManageUsers),
    placeholderData: (previous) => previous,
  });
}

export function useCampaignMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: (input: CampaignInput) => campaignService.createCampaign(input),
    onSuccess: () => {
      toast.success("Draft saved.");
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, "Could not save that draft.")),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CampaignInput }) =>
      campaignService.updateCampaign(id, input),
    onSuccess: () => {
      toast.success("Draft updated.");
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update that draft.")),
  });

  const remove = useMutation({
    mutationFn: (id: string) => campaignService.deleteCampaign(id),
    onSuccess: () => {
      toast.success("Draft deleted.");
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, "Could not delete that draft.")),
  });

  const send = useMutation({
    mutationFn: (id: string) => campaignService.sendCampaign(id),
    onSuccess: (campaign) => {
      toast.success(`“${campaign.subject}” is on its way.`);
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, "Could not send that campaign.")),
  });

  const refresh = useMutation({
    mutationFn: (id: string) => campaignService.refreshStats(id),
    onSuccess: () => invalidate(),
    onError: (error) => toast.error(errorMessage(error, "Could not refresh those figures.")),
  });

  return { create, update, remove, send, refresh };
}
