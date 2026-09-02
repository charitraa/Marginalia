export const seriesKeys = {
  all: ["series"] as const,
  list: (query: { search?: string; page?: number }) => ["series", "list", query] as const,
  detail: (slug: string) => ["series", "detail", slug] as const,
};
