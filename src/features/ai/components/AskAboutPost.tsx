import { useState } from "react";
import { Loader2, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIStatus, useAskAboutPost } from "@/features/ai/hooks/useAI";
import { useAuth } from "@/features/auth/hooks/useAuth";

/**
 * "Ask a question about this article."
 *
 * Answered from the article alone — the model is told to say when the text
 * does not cover something rather than guess, because confidently inventing
 * detail about someone else's writing is worse than admitting a gap.
 *
 * Hidden entirely when the assistant is off or the reader is signed out, since
 * each answer costs an API call.
 */
export default function AskAboutPost({ slug }: { slug: string }) {
  const { data: status } = useAIStatus();
  const { isAuthenticated } = useAuth();
  const ask = useAskAboutPost(slug);
  const [question, setQuestion] = useState("");

  if (!status?.enabled || !isAuthenticated) return null;

  return (
    <section
      className="mt-12 rounded-lg border border-border p-5"
      aria-labelledby="ask-about-post"
    >
      <h2 id="ask-about-post" className="flex items-center gap-2 text-sm font-semibold">
        <MessageCircleQuestion className="h-4 w-4" aria-hidden="true" />
        Ask about this article
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Answered from this article only. If it doesn&apos;t cover your question,
        you&apos;ll be told so rather than guessed at.
      </p>

      <form
        className="mt-4 flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (question.trim().length >= 3) ask.mutate(question.trim());
        }}
      >
        <Input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="What does this mean in practice?"
          className="min-w-56 flex-1"
          aria-label="Your question about this article"
        />
        <Button type="submit" disabled={ask.isPending || question.trim().length < 3}
                className="gap-2">
          {ask.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Ask
        </Button>
      </form>

      {ask.data && (
        <div className="mt-4 rounded-md border border-border bg-muted/40 p-3">
          <p className="whitespace-pre-wrap text-sm">{ask.data}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Generated from the article above. Check anything important against the text.
          </p>
        </div>
      )}
    </section>
  );
}
