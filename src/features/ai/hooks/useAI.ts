import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import * as aiService from "../api/aiService";
import { errorMessage } from "@/lib/errors";
import type { RewriteTone } from "../types";

/**
 * Whether the assistant is available at all.
 *
 * Cached hard — it changes only when the server is redeployed with or without
 * an API key — so the editor can decide whether to render the panel without a
 * request on every mount.
 */
export function useAIStatus() {
  return useQuery({
    queryKey: ["ai", "status"],
    queryFn: aiService.getStatus,
    staleTime: 30 * 60_000,
    retry: false,
  });
}

/** A 503 means the provider is down, which is worth different wording. */
function onFailure(fallback: string) {
  return (error: any) => {
    const message =
      error?.response?.status === 503
        ? errorMessage(error, "The AI service is unavailable right now.")
        : errorMessage(error, fallback);
    toast.error(message);
  };
}

export function useSuggestTitles() {
  return useMutation({
    mutationFn: (content: string) => aiService.suggestTitles(content),
    onError: onFailure("Could not suggest titles."),
  });
}

export function useSuggestSeo() {
  return useMutation({
    mutationFn: ({ content, title }: { content: string; title?: string }) =>
      aiService.suggestSeo(content, title),
    onError: onFailure("Could not suggest search details."),
  });
}

export function useSummarize() {
  return useMutation({
    mutationFn: (content: string) => aiService.summarize(content),
    onError: onFailure("Could not summarise that."),
  });
}

export function useOutline() {
  return useMutation({
    mutationFn: ({ topic, audience }: { topic: string; audience?: string }) =>
      aiService.outline(topic, audience),
    onError: onFailure("Could not build an outline."),
  });
}

export function useRewrite() {
  return useMutation({
    mutationFn: ({ text, tone }: { text: string; tone: RewriteTone }) =>
      aiService.rewrite(text, tone),
    onError: onFailure("Could not rewrite that passage."),
  });
}

export function useProofread() {
  return useMutation({
    mutationFn: (text: string) => aiService.proofread(text),
    onError: onFailure("Could not proofread that."),
  });
}

export function useSocialPost() {
  return useMutation({
    mutationFn: ({ content, title, network }: {
      content: string;
      title?: string;
      network?: "general" | "twitter" | "linkedin";
    }) => aiService.socialPost(content, title, network),
    onError: onFailure("Could not write a social post."),
  });
}

export function useTranslate() {
  return useMutation({
    mutationFn: ({ text, targetLanguage }: { text: string; targetLanguage: string }) =>
      aiService.translate(text, targetLanguage),
    onError: onFailure("Could not translate that."),
  });
}

export function useAskAboutPost(slug: string) {
  return useMutation({
    mutationFn: (question: string) => aiService.askAboutPost(slug, question),
    onError: onFailure("Could not answer that question."),
  });
}
