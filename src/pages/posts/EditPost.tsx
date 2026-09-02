import { Link, useNavigate, useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PostEditor, { clearStoredDraft } from "@/features/posts/components/PostEditor";
import DraftShareLink from "@/features/posts/components/DraftShareLink";
import ErrorState from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePost, usePostMutations } from "@/features/posts/hooks/usePosts";
import { postPath } from "@/lib/routes";
import type { PostInput } from "@/features/posts/types";

export default function EditPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: post, isLoading, error, refetch } = usePost(slug);
  const { update } = usePostMutations();

  // The API is authoritative and rejects a foreign edit regardless; this only
  // saves the author a pointless round trip and a confusing form.
  const canEdit = Boolean(post && user && (post.author.id === user.id || user.isStaff));

  const handleSubmit = async (input: PostInput) => {
    const saved = await update.mutateAsync({ idOrSlug: post!.slug, input });
    clearStoredDraft(post!.id);
    navigate(saved.status === "published" ? postPath(saved) : "/dashboard?tab=drafts");
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container-page space-y-6 py-16">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container-page py-20">
          <ErrorState
            error={error}
            title="We couldn't load this story."
            onRetry={() => refetch()}
          />
        </div>
      </Layout>
    );
  }

  if (!canEdit) {
    return (
      <Layout>
        <div className="container-page py-20 text-center">
          <h1 className="text-3xl">You can't edit this story</h1>
          <p className="mt-3 text-muted-foreground">
            Only its author can make changes to it.
          </p>
          <Button className="mt-8" asChild>
            <Link to={postPath(post)}>Read it instead</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo title={`Editing: ${post.title}`} canonicalPath={`/post/${post.slug}/edit`} noIndex />

      <div className="container-page py-12 sm:py-16">
        <header className="mb-10 max-w-2xl">
          <h1 className="text-4xl">Edit story</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {post.status === "draft"
              ? "This story is still a draft. Publish it when it's ready."
              : "This story is live. Changes appear as soon as you save."}
          </p>
        </header>

        <DraftShareLink post={post} />

        <PostEditor
          post={post}
          submitting={update.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate(postPath(post))}
        />
      </div>
    </Layout>
  );
}
