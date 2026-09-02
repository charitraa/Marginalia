import { axiosInstance } from "@/lib/api/client";

/**
 * Public site configuration.
 *
 * Fetched from the API rather than baked in at build time, so the frontend and
 * backend cannot drift apart about whether the CAPTCHA is switched on. The
 * site key is public by design — it ships in the HTML of every site that uses
 * reCAPTCHA. The secret never leaves the server.
 */
export interface SiteConfig {
  siteName: string;
  recaptchaEnabled: boolean;
  recaptchaSiteKey: string;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const { data } = await axiosInstance.get("/api/config/");
  return {
    siteName: String(data?.site_name ?? ""),
    recaptchaEnabled: Boolean(data?.recaptcha_enabled),
    recaptchaSiteKey: String(data?.recaptcha_site_key ?? ""),
  };
}
