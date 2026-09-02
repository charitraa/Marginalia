export const userKeys = {
  author: (username: string) => ["author", username] as const,
  dashboard: ["dashboard"] as const,
};
