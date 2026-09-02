import { useCallback, useEffect, useState } from "react";

/**
 * Per-reader reading preferences.
 *
 * Kept in localStorage rather than on the account: it is a per-device comfort
 * setting, and a reader on a phone may want larger text than the same person on
 * a desktop. Every access is wrapped because storage throws outright in some
 * privacy modes.
 */

const KEY = "marginalia.reading";

export interface ReadingPrefs {
  /** Multiplier on the article's base size, 0.9–1.4. */
  fontScale: number;
  /** Hides chrome so only the article remains. */
  focusMode: boolean;
}

const DEFAULTS: ReadingPrefs = { fontScale: 1, focusMode: false };

function read(): ReadingPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return {
      // Clamped on read: a hand-edited value must not break the layout.
      fontScale: Math.min(1.4, Math.max(0.9, Number(parsed?.fontScale) || 1)),
      focusMode: Boolean(parsed?.focusMode),
    };
  } catch {
    return DEFAULTS;
  }
}

export function useReadingPrefs() {
  const [prefs, setPrefs] = useState<ReadingPrefs>(DEFAULTS);

  // Read after mount, not during render: the server and the first client render
  // must agree, and localStorage is not available to both.
  useEffect(() => setPrefs(read()), []);

  const update = useCallback((patch: Partial<ReadingPrefs>) => {
    setPrefs((current) => {
      const next = { ...current, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage disabled; the setting still applies for this session */
      }
      return next;
    });
  }, []);

  return { prefs, update };
}
