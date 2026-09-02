/**
 * Service worker registration.
 *
 * Only in a production build: a worker caching a dev bundle would serve stale
 * modules after every edit. Registration waits for `load` so it never competes
 * with the first paint for bandwidth.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD) return;
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // A failed registration costs offline support, nothing else — the app
      // works exactly as it did before, so there is nothing to tell the user.
    });
  });
}
