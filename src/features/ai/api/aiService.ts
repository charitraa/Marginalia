import { axiosInstance } from "@/lib/api/client";
import type { AIStatus, OutlineSection, RewriteTone, SeoSuggestion } from "../types";

/**
 * AI assistant endpoints.
 *
 * Each returns a *suggestion*. Nothing here writes to a post — the author
 * applies the result themselves, because a tool that silently rewrites
 * somebody's work is not an assistant.
 *
 * Calls take several seconds: the models reason before answering. Callers show
 * a pending state rather than assuming these are quick.
 */

export async function getStatus(): Promise<AIStatus> {
  const { data } = await axiosInstance.get("/api/ai/status/");
  return {
    enabled: Boolean(data?.enabled),
    provider: String(data?.provider ?? ""),
    features: Array.isArray(data?.features) ? data.features.map(String) : [],
  };
}

export async function suggestTitles(content: string): Promise<string[]> {
  const { data } = await axiosInstance.post("/api/ai/titles/", { content });
  return Array.isArray(data?.titles) ? data.titles.map(String) : [];
}

export async function suggestSeo(content: string, title = ""): Promise<SeoSuggestion> {
  const { data } = await axiosInstance.post("/api/ai/seo/", { content, title });
  return {
    seoTitle: String(data?.seo_title ?? ""),
    seoDescription: String(data?.seo_description ?? ""),
    tags: Array.isArray(data?.tags) ? data.tags.map(String) : [],
  };
}

export async function summarize(content: string): Promise<string> {
  const { data } = await axiosInstance.post("/api/ai/summary/", { content });
  return String(data?.summary ?? "");
}

export async function outline(topic: string, audience = ""): Promise<OutlineSection[]> {
  const { data } = await axiosInstance.post("/api/ai/outline/", { topic, audience });
  return Array.isArray(data?.sections)
    ? data.sections.map((s: any) => ({
        heading: String(s?.heading ?? ""),
        points: Array.isArray(s?.points) ? s.points.map(String) : [],
      }))
    : [];
}

export async function rewrite(text: string, tone: RewriteTone): Promise<string> {
  const { data } = await axiosInstance.post("/api/ai/rewrite/", { text, tone });
  return String(data?.text ?? "");
}

export async function proofread(text: string): Promise<string> {
  const { data } = await axiosInstance.post("/api/ai/proofread/", { text });
  return String(data?.text ?? "");
}

export async function socialPost(
  content: string,
  title = "",
  network: "general" | "twitter" | "linkedin" = "general",
): Promise<string> {
  const { data } = await axiosInstance.post("/api/ai/social/", { content, title, network });
  return String(data?.text ?? "");
}

export async function translate(text: string, targetLanguage: string): Promise<string> {
  const { data } = await axiosInstance.post("/api/ai/translate/", {
    text,
    target_language: targetLanguage,
  });
  return String(data?.text ?? "");
}

export async function askAboutPost(slug: string, question: string): Promise<string> {
  const { data } = await axiosInstance.post(`/api/posts/${slug}/ask/`, { question });
  return String(data?.answer ?? "");
}
