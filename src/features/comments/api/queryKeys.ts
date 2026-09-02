export const commentKeys = {
  all: ["comments"] as const,
  forPost: (postId: string) => ["comments", postId] as const,
};
