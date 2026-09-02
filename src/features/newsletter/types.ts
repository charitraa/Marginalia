/** Newsletter campaigns. Staff-only; a campaign reaches every confirmed subscriber. */

export type CampaignStatus = "draft" | "sent" | "failed";

export interface CampaignStats {
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  hardBounces: number;
  softBounces: number;
  unsubscribed: number;
  /** Against delivered, not sent — a bounce was never a chance to open. */
  openRate: number;
  clickRate: number;
}

export interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: CampaignStatus;
  createdBy: string | null;
  createdAt: string | null;
  sentAt: string | null;
  statsUpdatedAt: string | null;
  stats: CampaignStats | null;
  openRate: number;
  clickRate: number;
}

export interface CampaignInput {
  name: string;
  subject: string;
  html: string;
}
