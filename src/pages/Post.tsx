import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import BlogCard from "@/components/blog/BlogCard";
import AuthorCard from "@/components/blog/AuthorCard";
import CategoryBadge from "@/components/blog/CategoryBadge";
import CommentSection from "@/components/blog/CommentSection";
import LikeButton from "@/components/blog/LikeButton";
import ShareButton from "@/components/blog/ShareButton";
import BookmarkButton from "@/components/blog/BookmarkButton";
import UserAvatar from "@/components/blog/UserAvatar";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ErrorState from "@/components/common/ErrorState";
import { ArticleSkeleton } from "@/components/common/Skeletons";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { usePostMutations, usePostOrPreview, useRelatedPosts } from "@/hooks/usePosts";
import { formatDate } from "@/lib/format";
import { sanitizeHtml } from "@/lib/sanitize";
import { authorPath, tagPath } from "@/lib/routes";

/** Progress through the article, shown as a thin bar under the header. */
function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return progress;
}

export default function Post() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  // A draft share link carries its own authorisation, so it reads through the
  // preview endpoint instead of the normal one.
  const previewToken = params.get("preview");
  const navigate = useNavigate();
  const { user } = useAuth();
  const progress = useReadingProgress();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: post, isLoading, error, refetch } = usePostOrPreview(slug, previewToken);
  const { data: related } = useRelatedPosts(post?.slug);
  const { remove } = usePostMutations();

  const isOwner = Boolean(post && user && (post.author.id === user.id || user.isStaff));

  // The body is sanitised on write by the API and again here before it reaches
  // the DOM, so nothing renders that has not passed both checks.
  const safeContent = useMemo(() => sanitizeHtml(post?.content ?? ""), [post?.content]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container-page py-12">
          <ArticleSkeleton />
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    const status = (error as any)?.response?.status;
    return (
      <Layout>
        <div className="container-page py-20">
          <ErrorState
            error={error}
            title={status === 404 ? "This story isn't available." : "We couldn't load this story."}
            fallback="It may have been removed, or it may be a draft you don't have access to."
            onRetry={status === 404 ? undefined : () => refetch()}
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

  return (
    <Layout>
      <Seo
        title={post.title}
        description={post.excerpt}
        image={post.coverImage}
        type="article"
        canonicalPath={`/post/${post.slug}`}
        publishedAt={post.publishedAt}
        author={post.author.name}
      />

      <div className="fixed inset-x-0 top-0 z-40 h-1">
        <Progress value={progress} className="h-full rounded-none bg-transparent" />
        <span className="sr-only">{Math.round(progress)}% read</span>
      </div>

      <article className="pb-16">
        <div className="container-prose pt-10 sm:pt-14">
          <header>
            <div className="flex flex-wrap items-center gap-3">
              {post.category && <CategoryBadge category={post.category} />}
              {post.status === "draft" && (
                <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                  Draft — only you can see this
                </span>
              )}
            </div>

            <h1 className="mt-5 text-4xl leading-[1.15] sm:text-5xl">{post.title}</h1>

            {post.excerpt && (
              <p className="mt-5 text-xl leading-relaxed text-muted-foreground">{post.excerpt}</p>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
              <div className="flex items-center gap-3">
                <Link to={authorPath(post.author)} className="shrink-0">
                  <UserAvatar user={post.author} />
                </Link>
                <div className="text-sm">
                  <Link
                    to={authorPath(post.author)}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {post.author.name}
                  </Link>
                  <p className="text-muted-foreground">
                    {formatDate(post.publishedAt ?? post.createdAt)}
                    <span aria-hidden="true"> · </span>
                    {post.readingTime} min read
                    {post.viewCount != null && (
                      <>
                        <span aria-hidden="true"> · </span>
                        {post.viewCount} {post.viewCount === 1 ? "view" : "views"}
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <LikeButton post={post} />
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" asChild>
                  <a href="#comments">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    <span>{post.commentCount ?? 0}</span>
                    <span className="sr-only">comments</span>
                  </a>
                </Button>
                <BookmarkButton post={post} />
                <ShareButton title={post.title} />
              </div>
            </div>

            {isOwner && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <Link to={`/post/${post.slug}/edit`}>
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-destructive hover:text-destructive"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            )}
          </header>
        </div>

        {post.coverImage && (
          <div className="container-page my-10">
            <img
              src={post.coverImage}
              alt=""
              loading="eager"
              decoding="async"
              className="mx-auto max-h-[32rem] w-full max-w-5xl rounded-xl object-cover"
            />
          </div>
        )}

        <div className="container-prose">
          <div
            className="article-content"
            /* Sanitised above with DOMPurify; the API sanitises on write too. */
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />

          {post.tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag.id}>
                  <Link
                    to={tagPath(tag.slug)}
                    className="inline-block rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    #{tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 flex items-center justify-between border-y border-border py-4">
            <LikeButton post={post} />
            <div className="flex items-center gap-1">
              <BookmarkButton post={post} showLabel />
              <ShareButton title={post.title} />
            </div>
          </div>

          <div className="mt-12">
            <AuthorCard author={post.author} />
          </div>

          <div className="mt-16">
            <CommentSection postId={post.slug} />
          </div>
        </div>

        {related && related.length > 0 && (
          <section className="container-page mt-20">
            <h2 className="mb-8 border-b border-border pb-4 text-2xl">Keep reading</h2>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <BlogCard key={item.id} post={item} />
              ))}
            </div>
          </section>
        )}
      </article>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this post?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={remove.isPending}
        onConfirm={async () => {
          await remove.mutateAsync(post.slug);
          setConfirmOpen(false);
          navigate("/dashboard");
        }}
      />
    </Layout>
  );
}
