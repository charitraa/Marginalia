import { axiosInstance } from "@/lib/api/client";

/**
 * Newsletter subscription (double opt-in).
 *
 * Subscribing never confirms whether an address is already on the list — the
 * API answers identically either way — so the UI shows the same message for
 * every outcome rather than leaking that detail.
 */

export async function subscribe(email: string, captcha?: string | null): Promise<string> {
  const { data } = await axiosInstance.post("/api/newsletter/subscribe/", {
    email,
    ...(captcha ? { captcha } : {}),
  });
  return data?.message ?? "Check your inbox to confirm your subscription.";
}

export async function confirmSubscription(token: string): Promise<string> {
  const { data } = await axiosInstance.post("/api/newsletter/confirm/", { token });
  return data?.message ?? "Subscription confirmed.";
}

export async function unsubscribe(token: string): Promise<string> {
  const { data } = await axiosInstance.post("/api/newsletter/unsubscribe/", { token });
  return data?.message ?? "You have been unsubscribed.";
}
