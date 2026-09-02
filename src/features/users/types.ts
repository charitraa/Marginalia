/**
 * People. `Author` is the public shape every feature embeds; `CurrentUser`
 * extends it with the private fields only the signed-in user sees.
 *
 * Fields typed `| null` are counters the API may omit. The UI hides the matching
 * affordance when the value is null rather than displaying a number that is not real.
 */

export interface Author {
  id: string;
  username: string;
  /** Full name, falling back to the username. Never empty. */
  name: string;
  avatar: string | null;
  headline: string;
  bio: string;
  joinedAt: string | null;
  postCount: number | null;
  followerCount: number | null;
  followingCount: number | null;
  totalLikes: number | null;
  isFollowing: boolean;
  website: string;
  twitter: string;
  github: string;
  linkedin: string;
}

export interface CurrentUser extends Author {
  email: string;
  firstName: string;
  lastName: string;
  city: string;
  district: string;
  isVerified: boolean;
  isStaff: boolean;
}

export interface DashboardStats {
  totalPosts: number | null;
  publishedPosts: number | null;
  draftPosts: number | null;
  totalLikes: number | null;
  totalComments: number | null;
  totalViews: number | null;
  followerCount: number | null;
}
