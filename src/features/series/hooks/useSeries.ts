import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as seriesService from "../api/seriesService";
import { seriesKeys } from "../api/queryKeys";
import { errorMessage } from "@/lib/errors";
import type { SeriesInput } from "../types";

export function useSeriesList(query: { search?: string; page?: number } = {}) {
  return useQuery({
    queryKey: seriesKeys.list(query),
    queryFn: () => seriesService.listSeries(query),
    placeholderData: (previous) => previous,
  });
}

export function useSeries(slug: string | undefined) {
  return useQuery({
    queryKey: seriesKeys.detail(slug ?? ""),
    queryFn: () => seriesService.getSeries(slug as string),
    enabled: Boolean(slug),
    retry: (failureCount, error: any) =>
      ![403, 404].includes(error?.response?.status) && failureCount < 2,
  });
}

export function useSeriesMutations(slug?: string) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: seriesKeys.all });
  };

  const create = useMutation({
    mutationFn: (input: SeriesInput) => seriesService.createSeries(input),
    onSuccess: () => {
      toast.success("Series created.");
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, "Could not create that series.")),
  });

  const update = useMutation({
    mutationFn: ({ target, input }: { target: string; input: SeriesInput }) =>
      seriesService.updateSeries(target, input),
    onSuccess: () => {
      toast.success("Series updated.");
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, "Could not update that series.")),
  });

  const remove = useMutation({
    mutationFn: (target: string) => seriesService.deleteSeries(target),
    onSuccess: () => {
      toast.success("Series deleted.");
      invalidate();
    },
    onError: (error) => toast.error(errorMessage(error, "Could not delete that series.")),
  });

  const addPost = useMutation({
    mutationFn: (postSlug: string) => seriesService.addPost(slug as string, postSlug),
    onSuccess: (detail) => {
      queryClient.setQueryData(seriesKeys.detail(detail.slug), detail);
      toast.success("Added to the series.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not add that post.")),
  });

  const removePost = useMutation({
    mutationFn: (postSlug: string) => seriesService.removePost(slug as string, postSlug),
    onSuccess: (detail) => {
      queryClient.setQueryData(seriesKeys.detail(detail.slug), detail);
      toast.success("Removed from the series.");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not remove that post.")),
  });

  const reorder = useMutation({
    mutationFn: (postSlugs: string[]) => seriesService.reorder(slug as string, postSlugs),
    onSuccess: (detail) => queryClient.setQueryData(seriesKeys.detail(detail.slug), detail),
    onError: (error) => toast.error(errorMessage(error, "Could not save that order.")),
  });

  return { create, update, remove, addPost, removePost, reorder };
}

/**
 * Marking a part read.
 *
 * The detail query is refetched rather than patched locally, because finishing
 * a part also moves `nextPostSlug`, which the server works out.
 */
export function useSeriesProgress(slug: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postSlug, done }: { postSlug: string; done: boolean }) =>
      done
        ? seriesService.markPartRead(slug as string, postSlug)
        : seriesService.unmarkPartRead(slug as string, postSlug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seriesKeys.detail(slug ?? "") });
    },
    onError: (error) => toast.error(errorMessage(error, "Could not save your progress.")),
  });
}
