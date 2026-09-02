import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useSiteConfig } from "../hooks/useSiteConfig";

/**
 * Google reCAPTCHA v2 checkbox.
 *
 * Renders nothing at all when the server says the guard is off, so a
 * development checkout with no keys shows no empty box and no console noise.
 *
 * The script is loaded once and shared: mounting this on two forms in the same
 * session must not fetch it twice, and reCAPTCHA misbehaves if it is.
 */

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => number;
      reset: (widgetId?: number) => void;
    };
  }
}

const SCRIPT_ID = "recaptcha-script";
let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha?.render) return Promise.resolve();

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.getElementById(SCRIPT_ID);
      if (existing) {
        existing.addEventListener("load", () => resolve());
        return;
      }
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("reCAPTCHA failed to load"));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export interface CaptchaHandle {
  reset: () => void;
}

export default function Captcha({
  onChange,
  error,
}: {
  /** Receives the token, or null when it expires or is reset. */
  onChange: (token: string | null) => void;
  error?: string;
}) {
  const { data: config } = useSiteConfig();
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const [failed, setFailed] = useState(false);
  const describedBy = useId();

  const siteKey = config?.recaptchaEnabled ? config.recaptchaSiteKey : "";

  const handleChange = useCallback(onChange, [onChange]);

  useEffect(() => {
    if (!siteKey || !container.current) return;
    // Already rendered: React 18 mounts effects twice in development, and
    // rendering the widget twice into one node breaks it.
    if (widgetId.current !== null) return;

    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !container.current || widgetId.current !== null) return;
        if (!window.grecaptcha?.render) return;

        widgetId.current = window.grecaptcha.render(container.current, {
          sitekey: siteKey,
          callback: (token: string) => handleChange(token),
          // A token is only good for two minutes; clearing it stops the form
          // submitting something the server will reject.
          "expired-callback": () => handleChange(null),
          "error-callback": () => handleChange(null),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [siteKey, handleChange]);

  // Nothing to show when the server has the guard switched off.
  if (!siteKey) return null;

  if (failed) {
    return (
      <p role="alert" className="text-sm text-muted-foreground">
        The verification widget could not load. Check your connection, or disable
        any extension blocking Google, then reload.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={container} aria-describedby={error ? describedBy : undefined} />
      {error && (
        <p id={describedBy} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

/** Clears the widget so a failed submit can be retried. */
export function resetCaptcha() {
  window.grecaptcha?.reset();
}
