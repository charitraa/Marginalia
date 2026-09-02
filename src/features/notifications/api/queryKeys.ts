export const notificationKeys = {
  all: ["notifications"] as const,
  list: (unreadOnly: boolean, page: number) => ["notifications", "list", unreadOnly, page] as const,
  unread: ["notifications", "unread"] as const,
};
