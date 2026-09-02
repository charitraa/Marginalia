import { text, type Raw } from "@/lib/api/normalize";
import type { SocialProvider } from "../types";

/** Null for a provider this deployment has no credentials for. */
export function normalizeSocialProvider(raw: Raw): SocialProvider | null {
  if (raw?.name !== "github" && raw?.name !== "google") return null;
  return {
    name: raw.name,
    authorizeUrl: text(raw.authorize_url),
    clientId: text(raw.client_id),
    scope: text(raw.scope),
  };
}
