import { axiosInstance } from "@/lib/api/client";
import { normalizePage } from "@/lib/api/normalize";
import type { Paginated } from "@/types/common";
import type { Campaign, CampaignInput, CampaignStats } from "../types";

type Raw = Record<string, any>;

function num(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function normalizeStats(raw: Raw | null | undefined): CampaignStats | null {
  if (!raw || Object.keys(raw).length === 0) return null;
  return {
    sent: num(raw.sent),
    delivered: num(raw.delivered),
    opens: num(raw.opens),
    clicks: num(raw.clicks),
    hardBounces: num(raw.hard_bounces),
    softBounces: num(raw.soft_bounces),
    unsubscribed: num(raw.unsubscribed),
    openRate: num(raw.open_rate),
    clickRate: num(raw.click_rate),
  };
}

export function normalizeCampaign(raw: Raw): Campaign {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    subject: String(raw.subject ?? ""),
    status: raw.status ?? "draft",
    createdBy: raw.created_by ?? null,
    createdAt: raw.created_at ?? null,
    sentAt: raw.sent_at ?? null,
    statsUpdatedAt: raw.stats_updated_at ?? null,
    stats: normalizeStats(raw.stats),
    openRate: num(raw.open_rate),
    clickRate: num(raw.click_rate),
  };
}

export async function listCampaigns(page = 1): Promise<Paginated<Campaign>> {
  const { data } = await axiosInstance.get("/api/newsletter/campaigns/", { params: { page } });
  return normalizePage(data, normalizeCampaign, page, 10);
}

export async function createCampaign(input: CampaignInput): Promise<Campaign> {
  const { data } = await axiosInstance.post("/api/newsletter/campaigns/", input);
  return normalizeCampaign(data);
}

export async function updateCampaign(id: string, input: CampaignInput): Promise<Campaign> {
  const { data } = await axiosInstance.patch(`/api/newsletter/campaigns/${id}/`, input);
  return normalizeCampaign(data);
}

export async function deleteCampaign(id: string): Promise<void> {
  await axiosInstance.delete(`/api/newsletter/campaigns/${id}/`);
}

/** Irreversible: it goes to every confirmed subscriber. */
export async function sendCampaign(id: string): Promise<Campaign> {
  const { data } = await axiosInstance.post(`/api/newsletter/campaigns/${id}/send/`);
  return normalizeCampaign(data);
}

/** Figures keep moving for days after a send, so this is fetched on demand. */
export async function refreshStats(id: string): Promise<Campaign> {
  const { data } = await axiosInstance.get(`/api/newsletter/campaigns/${id}/stats/`);
  return normalizeCampaign(data);
}
