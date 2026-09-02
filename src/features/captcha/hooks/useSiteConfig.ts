import { useQuery } from "@tanstack/react-query";
import { getSiteConfig } from "../api/configService";

/** Site configuration changes only on a deploy, so it is cached hard. */
export function useSiteConfig() {
  return useQuery({
    queryKey: ["site-config"],
    queryFn: getSiteConfig,
    staleTime: 30 * 60_000,
    retry: false,
  });
}
