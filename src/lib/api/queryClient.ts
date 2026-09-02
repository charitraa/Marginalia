import { QueryClient } from "@tanstack/react-query";

/**
 * The app's single react-query client. It lives beside the axios client because
 * its retry policy is a statement about the API, not about the UI.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Refetching on every window focus makes a reading app feel twitchy.
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        // Client errors will not fix themselves on a retry.
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});
