import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import BlogCard from "@/features/posts/components/BlogCard";
import AuthorCard from "@/features/users/components/AuthorCard";
import CategoryBadge from "@/features/posts/components/CategoryBadge";
import TopicFollowButton from "@/features/users/components/TopicFollowButton";
import AskAboutPost from "@/features/ai/components/AskAboutPost";
import TableOfContents from "@/features/reading/components/TableOfContents";
import ReadingControls from "@/features/reading/components/ReadingControls";
import BackToTop from "@/components/common/BackToTop";
import Breadcrumbs from "@/components/common/Breadcrumbs";
import StructuredData, {
  articleSchema,
  breadcrumbSchema,
} from "@/components/common/StructuredData";
import { useHeadings } from "@/features/reading/hooks/useHeadings";
import { useReadingPrefs } from "@/features/reading/hooks/useReadingPrefs";
import { useCopyCodeButtons } from "@/features/reading/hooks/useCopyCodeButtons";
import CommentSection from "@/features/comments/components/CommentSection";
import LikeButton from "@/features/posts/components/LikeButton";
import ShareButton from "@/features/posts/components/ShareButton";
import BookmarkButton from "@/features/bookmarks/components/BookmarkButton";
import UserAvatar from "@/features/users/components/UserAvatar";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ErrorState from "@/components/common/ErrorState";
import { ArticleSkeleton } from "@/components/common/Skeletons";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePostMutations, usePostOrPreview, useRelatedPosts } from "@/features/posts/hooks/usePosts";
import { formatDate } from "@/lib/format";
import { sanitizeHtml } from "@/lib/sanitize";
import { authorPath, tagPath } from "@/lib/routes";
import { SITE_NAME } from "@/config/constants";

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
  const articleRef = useRef<HTMLDivElement>(null);
  const { prefs, update: updatePrefs } = useReadingPrefs();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: post, isLoading, error, refetch } = usePostOrPreview(slug, previewToken);
  const { data: related } = useRelatedPosts(post?.slug);
  const { remove } = usePostMutations();

  const isOwner = Boolean(post && user && (post.author.id === user.id || user.isStaff));

  // The body is sanitised on write by the API and again here before it reaches
  // the DOM, so nothing renders that has not passed both checks.
  const safeContent = useMemo(() => sanitizeHtml(post?.content ?? ""), [post?.content]);
  const { headings, activeId } = useHeadings(articleRef, safeContent);

  // Absolute URLs: a search engine needs to resolve these without a base.
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const trail = post
    ? [
        { name: "Home", to: "/" },
        ...(post.category
          ? [{ name: post.category.name, to: `/category/${post.category.slug}` }]
          : [{ name: "Explore", to: "/explore" }]),
        { name: post.title },
      ]
    : [];
  useCopyCodeButtons(articleRef, safeContent);

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

      <article className="pb-20">
        <div className="container-prose pt-10 sm:pt-14">
          <header>
            {!prefs.focusMode && <Breadcrumbs trail={trail} />}

            <div className="mt-7 flex flex-wrap items-center gap-4">
              {post.category && <CategoryBadge category={post.category} />}
              {post.status === "draft" && (
                <span className="font-sans text-2xs font-medium uppercase tracking-[0.14em] text-destructive">
                  Draft — only you can see this
                </span>
              )}
            </div>

            <h1 className="mt-5 font-serif text-display-sm font-semibold">{post.title}</h1>

            {post.excerpt && (
              <p className="mt-6 font-sans text-xl leading-relaxed text-muted-foreground">
                {post.excerpt}
              </p>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-border py-5">
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
          <figure className="container-page my-12 sm:my-16">
            <img
              src={post.coverImage}
              alt=""
              loading="eager"
              decoding="async"
              className="mx-auto aspect-[16/9] w-full max-w-5xl rounded-md object-cover"
            />
          </figure>
        )}

        {/**
         * The reading column, with the contents list hanging in the left margin
         * on wide screens — the publication's own idiom applied to navigation.
         * Below xl there is no margin to hang it in, so it collapses inline.
         */}
        <div className="mx-auto w-full max-w-[76rem]">
          <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(0,43rem)_minmax(0,1fr)] xl:gap-6">
            <aside className="hidden xl:block xl:pl-10">
              {headings.length >= 3 && !prefs.focusMode && (
                <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pr-4">
                  <TableOfContents headings={headings} activeId={activeId} />
                </div>
              )}
            </aside>

            {/* Same measure and padding as the header above, so the two align. */}
            <div className="container-prose">
          <div className="mb-8 flex flex-wrap items-center justify-end gap-3 border-b border-border pb-4">
            <ReadingControls prefs={prefs} onChange={updatePrefs} />
          </div>

          {headings.length >= 3 && !prefs.focusMode && (
            <details className="mb-10 border-y border-border py-4 xl:hidden">
              <summary className="cursor-pointer font-sans text-sm font-medium">On this page</summary>
              <div className="mt-4">
                <TableOfContents headings={headings} activeId={activeId} />
              </div>
            </details>
          )}

          <div
            className="article-content"
            ref={articleRef}
            style={{ fontSize: `${prefs.fontScale}em` }}
            /* Sanitised above with DOMPurify; the API sanitises on write too. */
            dangerouslySetInnerHTML={{ __html: safeContent }}
          />

          {(post.tags.length > 0 || post.category) && (
            <div className="mt-14 space-y-4 border-t border-border pt-6">
              {post.category && (
                <div className="flex flex-wrap items-center gap-3">
                  <span className="eyebrow">Filed under</span>
                  <CategoryBadge category={post.category} />
                  <TopicFollowButton
                    kind="category"
                    slug={post.category.slug}
                    name={post.category.name}
                  />
                </div>
              )}

              {post.tags.length > 0 && (
                <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  {post.tags.map((tag) => (
                    <li key={tag.id} className="flex items-center gap-1.5">
                      <Link
                        to={tagPath(tag.slug)}
                        className="font-sans text-sm text-muted-foreground transition-colors duration-200 hover:text-primary"
                      >
                        #{tag.name}
                      </Link>
                      <TopicFollowButton kind="tag" slug={tag.slug} name={tag.name} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="mt-12 flex items-center justify-between border-y border-border py-4">
            <LikeButton post={post} />
            <div className="flex items-center gap-1">
              <BookmarkButton post={post} showLabel />
              <ShareButton title={post.title} />
            </div>
          </div>

          {!prefs.focusMode && <AskAboutPost slug={post.slug} />}

          <div className="mt-12">
            <AuthorCard author={post.author} />
          </div>

          <div className="mt-16">
            <CommentSection postId={post.slug} />
          </div>
            </div>

            <div className="hidden xl:block" aria-hidden="true" />
          </div>
        </div>

        {related && related.length > 0 && (
          <section className="container-page mt-24">
            <div className="section-head mb-10">
              <h2 className="section-title">Continue reading</h2>
            </div>
            <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {related.slice(0, 3).map((item) => (
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
      <StructuredData
        data={
          post
            ? articleSchema({
                title: post.title,
                description: post.excerpt,
                url: `${origin}/post/${post.slug}`,
                image: post.coverImage,
                authorName: post.author.name,
                authorUrl: `${origin}${authorPath(post.author)}`,
                publishedAt: post.publishedAt,
                updatedAt: post.updatedAt,
                siteName: SITE_NAME,
              })
            : null
        }
      />
      <StructuredData
        data={
          trail.length
            ? breadcrumbSchema(
                trail.map((crumb) => ({
                  name: crumb.name,
                  url: crumb.to ? `${origin}${crumb.to}` : `${origin}/post/${post?.slug ?? ""}`,
                })),
              )
            : null
        }
      />

      <BackToTop />
    </Layout>
  );
}
