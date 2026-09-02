import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PostEditor, { clearStoredDraft } from "@/features/posts/components/PostEditor";
import { usePostMutations } from "@/features/posts/hooks/usePosts";
import { postPath } from "@/lib/routes";
import type { PostInput } from "@/features/posts/types";

export default function Write() {
  const navigate = useNavigate();
  const { create } = usePostMutations();

  const handleSubmit = async (input: PostInput) => {
    const post = await create.mutateAsync(input);
    // Only drop the local copy once the API has definitely accepted the work.
    clearStoredDraft(undefined);
    navigate(post.status === "published" ? postPath(post) : "/dashboard?tab=drafts");
  };

  return (
    <Layout>
      <Seo title="Write a story" canonicalPath="/write" noIndex />

      <div className="container-page py-12 sm:py-16">
        <header className="mb-10 max-w-2xl">
          <h1 className="text-4xl">Create your story</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Write it now, publish when you're ready. Drafts stay private to you.
          </p>
        </header>

        <PostEditor
          submitting={create.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </div>
    </Layout>
  );
}
