/**
 * Service worker.
 *
 * Two caches with different rules, because the two kinds of request fail
 * differently:
 *
 *  - The app shell is cache-first. It changes only on deploy, and serving it
 *    from disk is what makes a repeat visit instant.
 *  - Article pages and media are network-first with a cache fallback, so a
 *    reader on a train sees the last version rather than a browser error.
 *
 * API responses are deliberately NOT cached: a stale like count or a stale
 * signed-in state is worse than no answer, and anything cached here would
 * outlive a sign-out.
 */

const VERSION = "v1";
const SHELL_CACHE = `marginalia-shell-${VERSION}`;
const RUNTIME_CACHE = `marginalia-runtime-${VERSION}`;

const SHELL = ["/", "/offline.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      // A single missing file must not fail the whole install.
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache the API: a stale session or counter is worse than an error.
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: try the network, fall back to the cached page, then to the
  // offline notice. An SPA route that was never visited has no cache entry.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/") || caches.match("/offline.html")),
        ),
    );
    return;
  }

  // Static assets are content-hashed by the build, so a cache hit is always
  // the right answer and never goes stale.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
