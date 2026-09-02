import { useState } from "react";
import {
  Check, Languages, Loader2, ListTree, Share2, Sparkles, SpellCheck2, Type, Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  useAIStatus, useOutline, useProofread, useRewrite, useSocialPost,
  useSuggestSeo, useSuggestTitles, useSummarize, useTranslate,
} from "@/features/ai/hooks/useAI";
import { toPlainText } from "@/lib/format";
import type { RewriteTone } from "@/features/ai/types";

/**
 * The writing assistant.
 *
 * Two rules shape the whole panel:
 *
 *  - **Nothing is applied automatically.** Every result appears as a suggestion
 *    with an explicit Apply button, because silently rewriting somebody's
 *    article is not assistance.
 *  - **Nothing runs on its own.** Each call costs money and takes seconds, so
 *    they only ever fire on a click.
 *
 * The panel renders nothing at all when the server reports no API key, rather
 * than showing buttons that would fail.
 */

const TONES: Array<{ value: RewriteTone; label: string }> = [
  { value: "clearer", label: "Clearer" },
  { value: "shorter", label: "Shorter" },
  { value: "friendlier", label: "Friendlier" },
  { value: "formal", label: "More formal" },
];

const LANGUAGES = ["Spanish", "French", "German", "Hindi", "Chinese", "Japanese", "Arabic"];

/** Shared shell for one suggestion: a button, a spinner, then a result. */
function Suggestion({
  children,
  onApply,
  applyLabel = "Apply",
}: {
  children: React.ReactNode;
  onApply?: () => void;
  applyLabel?: string;
}) {
  return (
    <div className="mt-3 rounded-md border border-border bg-muted/40 p-3">
      <div className="text-sm">{children}</div>
      {onApply && (
        <Button size="sm" variant="outline" className="mt-3 gap-2" onClick={onApply}>
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          {applyLabel}
        </Button>
      )}
    </div>
  );
}

export default function AIAssistant({
  title,
  content,
  onApplyTitle,
  onApplySeo,
  onApplyExcerpt,
  onApplyContent,
}: {
  title: string;
  content: string;
  onApplyTitle: (value: string) => void;
  onApplySeo: (seo: { seoTitle: string; seoDescription: string; tags: string[] }) => void;
  onApplyExcerpt: (value: string) => void;
  onApplyContent?: (value: string) => void;
}) {
  const { data: status } = useAIStatus();

  const titles = useSuggestTitles();
  const seo = useSuggestSeo();
  const summary = useSummarize();
  const outline = useOutline();
  const rewrite = useRewrite();
  const proofread = useProofread();
  const social = useSocialPost();
  const translate = useTranslate();

  const [tone, setTone] = useState<RewriteTone>("clearer");
  const [passage, setPassage] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);

  // Server-side minimum; checking here saves a round trip and gives a clearer
  // message than a 400 would.
  const plain = toPlainText(content);
  const tooShort = plain.trim().length < 40;

  if (!status?.enabled) return null;

  const needsContent = () => {
    if (tooShort) {
      toast("Write a little more first — the assistant needs something to work with.");
      return true;
    }
    return false;
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied.");
    } catch {
      toast.error("Copying isn't available here — select the text and copy it manually.");
    }
  };

  return (
    <section className="surface-card px-4 sm:px-5" aria-labelledby="ai-assistant">
      <h2 id="ai-assistant" className="flex items-center gap-2 py-4 text-sm font-semibold">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Writing assistant
      </h2>

      <Accordion type="multiple">
        {/* ---------- Titles ---------- */}
        <AccordionItem value="titles" className="border-b-0">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <Type className="h-4 w-4" aria-hidden="true" />
              Suggest titles
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <Button
              size="sm"
              disabled={titles.isPending}
              onClick={() => !needsContent() && titles.mutate(content)}
              className="gap-2"
            >
              {titles.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Suggest titles
            </Button>

            {titles.data?.map((option) => (
              <Suggestion key={option} onApply={() => onApplyTitle(option)} applyLabel="Use this title">
                {option}
              </Suggestion>
            ))}
          </AccordionContent>
        </AccordionItem>

        {/* ---------- SEO ---------- */}
        <AccordionItem value="seo" className="border-b-0">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Search title, description &amp; tags
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <Button
              size="sm"
              disabled={seo.isPending}
              onClick={() => !needsContent() && seo.mutate({ content, title })}
              className="gap-2"
            >
              {seo.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Suggest
            </Button>

            {seo.data && (
              <Suggestion onApply={() => onApplySeo(seo.data)} applyLabel="Apply all three">
                <p className="font-medium">{seo.data.seoTitle}</p>
                <p className="mt-1 text-muted-foreground">{seo.data.seoDescription}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {seo.data.tags.join(" · ")}
                </p>
              </Suggestion>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ---------- Summary ---------- */}
        <AccordionItem value="summary" className="border-b-0">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <ListTree className="h-4 w-4" aria-hidden="true" />
              Summarise
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <Button
              size="sm"
              disabled={summary.isPending}
              onClick={() => !needsContent() && summary.mutate(content)}
              className="gap-2"
            >
              {summary.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Summarise
            </Button>

            {summary.data && (
              <Suggestion onApply={() => onApplyExcerpt(summary.data)} applyLabel="Use as excerpt">
                {summary.data}
              </Suggestion>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ---------- Rewrite / proofread ---------- */}
        <AccordionItem value="rewrite" className="border-b-0">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" aria-hidden="true" />
              Rewrite or proofread a passage
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-5">
            <div className="space-y-2">
              <Label htmlFor="ai-passage">Paste the passage to work on</Label>
              <Textarea
                id="ai-passage"
                rows={4}
                value={passage}
                onChange={(event) => setPassage(event.target.value)}
                placeholder="Paste a paragraph from your draft…"
              />
              <p className="text-xs text-muted-foreground">
                Facts are never changed — only the wording.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select value={tone} onValueChange={(value) => setTone(value as RewriteTone)}>
                <SelectTrigger className="w-40" aria-label="Rewrite tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((entry) => (
                    <SelectItem key={entry.value} value={entry.value}>{entry.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                size="sm"
                disabled={rewrite.isPending || passage.trim().length < 10}
                onClick={() => rewrite.mutate({ text: passage, tone })}
                className="gap-2"
              >
                {rewrite.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Rewrite
              </Button>

              <Button
                size="sm"
                variant="outline"
                disabled={proofread.isPending || passage.trim().length < 10}
                onClick={() => proofread.mutate(passage)}
                className="gap-2"
              >
                {proofread.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  : <SpellCheck2 className="h-4 w-4" aria-hidden="true" />}
                Proofread
              </Button>
            </div>

            {(rewrite.data || proofread.data) && (
              <Suggestion
                onApply={() => {
                  setPassage(rewrite.data || proofread.data || "");
                  toast.success("Copied into the box — paste it back into your draft.");
                }}
                applyLabel="Put it in the box"
              >
                <p className="whitespace-pre-wrap">{rewrite.data || proofread.data}</p>
              </Suggestion>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ---------- Outline ---------- */}
        <AccordionItem value="outline" className="border-b-0">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <ListTree className="h-4 w-4" aria-hidden="true" />
              Outline a new piece
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-5">
            <div className="flex flex-wrap gap-2">
              <Input
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="What is it about?"
                className="min-w-56 flex-1"
                aria-label="Outline topic"
              />
              <Button
                size="sm"
                disabled={outline.isPending || topic.trim().length < 3}
                onClick={() => outline.mutate({ topic })}
                className="gap-2"
              >
                {outline.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Outline
              </Button>
            </div>

            {outline.data && outline.data.length > 0 && (
              <Suggestion
                onApply={onApplyContent && (() => {
                  const html = outline.data
                    .map((section) =>
                      `<h2>${section.heading}</h2><ul>` +
                      section.points.map((point) => `<li>${point}</li>`).join("") +
                      `</ul>`)
                    .join("");
                  onApplyContent(html);
                })}
                applyLabel="Insert as a starting structure"
              >
                <ol className="list-decimal space-y-2 pl-4">
                  {outline.data.map((section) => (
                    <li key={section.heading}>
                      <span className="font-medium">{section.heading}</span>
                      <ul className="mt-1 list-disc pl-4 text-muted-foreground">
                        {section.points.map((point) => <li key={point}>{point}</li>)}
                      </ul>
                    </li>
                  ))}
                </ol>
              </Suggestion>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* ---------- Share & translate ---------- */}
        <AccordionItem value="share" className="border-b-0">
          <AccordionTrigger className="text-sm">
            <span className="flex items-center gap-2">
              <Share2 className="h-4 w-4" aria-hidden="true" />
              Social post &amp; translation
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pb-5">
            <Button
              size="sm"
              disabled={social.isPending}
              onClick={() => !needsContent() && social.mutate({ content, title })}
              className="gap-2"
            >
              {social.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Write a post announcing this
            </Button>

            {social.data && (
              <Suggestion onApply={() => copy(social.data)} applyLabel="Copy">
                <p className="whitespace-pre-wrap">{social.data}</p>
              </Suggestion>
            )}

            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <Languages className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40" aria-label="Target language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((entry) => (
                    <SelectItem key={entry} value={entry}>{entry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                disabled={translate.isPending || passage.trim().length < 1}
                onClick={() => translate.mutate({ text: passage, targetLanguage: language })}
                className="gap-2"
              >
                {translate.isPending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                Translate the passage above
              </Button>
            </div>

            {translate.data && (
              <Suggestion onApply={() => copy(translate.data)} applyLabel="Copy">
                <p className="whitespace-pre-wrap">{translate.data}</p>
              </Suggestion>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
