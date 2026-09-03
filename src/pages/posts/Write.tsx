import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import PageHeader from "@/components/common/PageHeader";
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

      <div className="container-page pb-20">
        <PageHeader
          className="mb-12"
          eyebrow="Marginalia / Studio"
          title="Write"
          description="Write it now, publish when you're ready. Drafts stay private to you."
        />

        <PostEditor
          submitting={create.isPending}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      </div>
    </Layout>
  );
}
