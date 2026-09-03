import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, FileText, Github, Globe, Heart, Linkedin, Twitter, Users } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import BlogCard from "@/features/posts/components/BlogCard";
import UserAvatar from "@/features/users/components/UserAvatar";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import { PostGridSkeleton, ProfileSkeleton } from "@/components/common/Skeletons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useAuthor, useToggleFollow } from "@/features/users/hooks/useUsers";
import { useAuthorPosts } from "@/features/posts/hooks/usePosts";
import { formatCount, formatDate } from "@/lib/format";
import { pageCount } from "@/lib/api/normalize";

const SOCIALS = [
  { key: "website", label: "Website", icon: Globe },
  { key: "twitter", label: "Twitter", icon: Twitter },
  { key: "github", label: "GitHub", icon: Github },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
] as const;

export default function AuthorProfile() {
  const { username } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);

  const author = useAuthor(username);
  const posts = useAuthorPosts(username, { page, pageSize: 9 });
  const follow = useToggleFollow(username);

  const isSelf = Boolean(user && author.data && user.id === author.data.id);

  if (author.isLoading) {
    return (
      <Layout>
        <div className="container-page py-12">
          <ProfileSkeleton />
        </div>
      </Layout>
    );
  }

  if (author.error || !author.data) {
    return (
      <Layout>
        <div className="container-page py-20">
          <ErrorState
            error={author.error}
            title="We couldn't find this author."
            fallback="This profile may have been removed."
          />
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link to="/explore">Browse all stories</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const profile = author.data;
  const items = posts.data?.items ?? [];

  return (
    <Layout>
      <Seo
        title={profile.name}
        description={profile.bio || `Stories by ${profile.name} on Marginalia.`}
        image={profile.avatar}
        canonicalPath={`/author/${profile.username}`}
      />

      <header className="border-b border-foreground/15">
        <div className="container-page pb-20 pt-12 sm:pt-16">
          <p className="eyebrow mb-8">Marginalia / Writer</p>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
            <UserAvatar user={profile} size="xl" className="shrink-0" />

            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-4xl font-semibold sm:text-5xl">{profile.name}</h1>
              <p className="mt-2 font-sans text-sm text-muted-foreground">@{profile.username}</p>
              {profile.headline && (
                <p className="mt-4 max-w-measure font-serif text-xl leading-snug text-foreground/85">
                  {profile.headline}
                </p>
              )}
              {profile.bio && (
                <p className="mt-4 max-w-measure font-sans leading-relaxed text-muted-foreground">
                  {profile.bio}
                </p>
              )}

              <dl className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 font-sans text-sm tabular-nums">
                {profile.postCount != null && (
                  <div className="inline-flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <dt className="sr-only">Posts</dt>
                    <dd>
                      <strong className="font-semibold">{formatCount(profile.postCount)}</strong>{" "}
                      <span className="text-muted-foreground">posts</span>
                    </dd>
                  </div>
                )}
                {profile.followerCount != null && (
                  <div className="inline-flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <dt className="sr-only">Followers</dt>
                    <dd>
                      {/* A count nobody can check is a number people stop believing. */}
                      <Link
                        to={`/author/${profile.username}/followers`}
                        className="hover:underline"
                      >
                        <strong className="font-semibold">
                          {formatCount(profile.followerCount)}
                        </strong>{" "}
                        <span className="text-muted-foreground">followers</span>
                      </Link>
                    </dd>
                  </div>
                )}
                {profile.followingCount != null && profile.followingCount > 0 && (
                  <div className="inline-flex items-center gap-1.5">
                    <dt className="sr-only">Following</dt>
                    <dd>
                      <Link
                        to={`/author/${profile.username}/following`}
                        className="hover:underline"
                      >
                        <strong className="font-semibold">
                          {formatCount(profile.followingCount)}
                        </strong>{" "}
                        <span className="text-muted-foreground">following</span>
                      </Link>
                    </dd>
                  </div>
                )}
                {profile.totalLikes != null && (
                  <div className="inline-flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <dt className="sr-only">Likes received</dt>
                    <dd>
                      <strong className="font-semibold">{formatCount(profile.totalLikes)}</strong>{" "}
                      <span className="text-muted-foreground">likes</span>
                    </dd>
                  </div>
                )}
                {profile.joinedAt && (
                  <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    <dt className="sr-only">Joined</dt>
                    <dd>Joined {formatDate(profile.joinedAt)}</dd>
                  </div>
                )}
              </dl>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {isSelf ? (
                  <Button variant="outline" asChild>
                    <Link to="/settings">Edit profile</Link>
                  </Button>
                ) : (
                  <Button
                    variant={profile.isFollowing ? "outline" : "default"}
                    disabled={follow.isPending}
                    onClick={() => {
                      if (!isAuthenticated) return;
                      follow.mutate(!profile.isFollowing);
                    }}
                    asChild={!isAuthenticated}
                  >
                    {isAuthenticated ? (
                      <span>{profile.isFollowing ? "Following" : "Follow"}</span>
                    ) : (
                      <Link to="/login">Sign in to follow</Link>
                    )}
                  </Button>
                )}

                <ul className="flex gap-1">
                  {SOCIALS.map(({ key, label, icon: Icon }) => {
                    const href = profile[key];
                    if (!href) return null;
                    return (
                      <li key={key}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${profile.name} on ${label}`}
                          className="inline-flex rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="container-page pb-20 pt-12 sm:pt-16">
        <div className="section-head mb-10">
          <h2 className="section-title">
            {isSelf ? "Your stories" : `Stories by ${profile.name}`}
          </h2>
          {profile.postCount != null && (
            <span className="font-sans text-sm tabular-nums text-muted-foreground">
              {formatCount(profile.postCount)}{" "}
              {profile.postCount === 1 ? "story" : "stories"}
            </span>
          )}
        </div>

        {posts.isLoading ? (
          <PostGridSkeleton count={3} />
        ) : posts.error ? (
          <ErrorState
            error={posts.error}
            title="We couldn't load these stories."
            onRetry={() => posts.refetch()}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title={isSelf ? "You haven't published anything yet." : "Nothing published yet."}
            description={
              isSelf
                ? "Your drafts live in your dashboard until you publish them."
                : "This author hasn't published a story yet."
            }
            action={isSelf ? { label: "Write a story", to: "/write" } : undefined}
          />
        ) : (
          <>
            <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            <Pagination
              page={page}
              pageCount={posts.data ? pageCount(posts.data) : 1}
              onPageChange={setPage}
            />
          </>
        )}
      </section>
    </Layout>
  );
}
