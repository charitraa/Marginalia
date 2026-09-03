import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, ImagePlus, Loader2, Pencil, X } from "lucide-react";
import RichTextEditor from "@/features/posts/components/RichTextEditor";
import AIAssistant from "@/features/ai/components/AIAssistant";
import PublishOptions, {
  fromLocalInput,
  toLocalInput,
} from "@/features/posts/components/PublishOptions";
import UserAvatar from "@/features/users/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCategories } from "@/features/posts/hooks/usePosts";
import { excerptFrom, readingTimeFor, wordCount } from "@/lib/format";
import { sanitizeHtml } from "@/lib/sanitize";
import { cn } from "@/lib/utils";
import type { Post, PostInput, PostStatus, PostVisibility } from "@/features/posts/types";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_TITLE = 120;
const MAX_EXCERPT = 220;

interface PostEditorProps {
  /** Present when editing; absent when creating. */
  post?: Post;
  submitting: boolean;
  onSubmit: (input: PostInput) => void;
  onCancel?: () => void;
}

/**
 * Work in progress is mirrored to localStorage on every keystroke and only
 * cleared once the API has accepted it. A failed publish, a closed tab or a
 * refresh therefore never costs the writer their draft.
 */
interface StoredDraft {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tagText: string;
  savedAt: number;
}

const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function draftKey(postId?: string) {
  return `marginalia.draft.${postId ?? "new"}`;
}

function readDraft(postId?: string): StoredDraft | null {
  try {
    const raw = localStorage.getItem(draftKey(postId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredDraft;
    if (Date.now() - (parsed.savedAt ?? 0) > DRAFT_TTL_MS) {
      localStorage.removeItem(draftKey(postId));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearStoredDraft(postId?: string) {
  try {
    localStorage.removeItem(draftKey(postId));
  } catch {
    /* storage unavailable */
  }
}

export default function PostEditor({ post, submitting, onSubmit, onCancel }: PostEditorProps) {
  const { user } = useAuth();
  const { data: categories } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [category, setCategory] = useState(post?.category?.slug ?? "");
  const [tagText, setTagText] = useState(post?.tags.map((tag) => tag.name).join(", ") ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(post?.coverImage ?? null);
  const [subtitle, setSubtitle] = useState(post?.subtitle ?? "");
  const [visibility, setVisibility] = useState<PostVisibility>(post?.visibility ?? "public");
  const [scheduledFor, setScheduledFor] = useState(toLocalInput(post?.scheduledFor));
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  /** Whether the local mirror is behind the editor, and when it last caught up. */
  const [mirrorState, setMirrorState] = useState<"idle" | "pending" | "kept">("idle");
  const [mirroredAt, setMirroredAt] = useState<Date | null>(null);

  // Repopulate when the post finishes loading on the edit route.
  useEffect(() => {
    if (!post) return;
    setTitle(post.title);
    setExcerpt(post.excerpt);
    setContent(post.content);
    setCategory(post.category?.slug ?? "");
    setTagText(post.tags.map((tag) => tag.name).join(", "));
    setCoverPreview(post.coverImage);
  }, [post?.id]);

  // Object URLs must be released or the blob stays in memory.
  useEffect(() => {
    if (!coverFile) return;
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  // Offer to restore unsaved work rather than silently overwriting the server copy.
  const [recovered, setRecovered] = useState<StoredDraft | null>(null);
  useEffect(() => {
    const stored = readDraft(post?.id);
    if (stored && (stored.title || stored.content)) setRecovered(stored);
    // Only on first mount for this post.
  }, [post?.id]);

  // Mirror every change locally. Cheap, synchronous, and survives a crash.
  // The writer is told about it, quietly, in the action bar.
  useEffect(() => {
    if (!title && !content && !excerpt) return;
    setMirrorState("pending");
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(
          draftKey(post?.id),
          JSON.stringify({ title, excerpt, content, category, tagText, savedAt: Date.now() }),
        );
        setMirroredAt(new Date());
        setMirrorState("kept");
      } catch {
        /* storage unavailable; the editor still works, so say nothing */
        setMirrorState("idle");
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [title, excerpt, content, category, tagText, post?.id]);

  const words = useMemo(() => wordCount(content), [content]);
  const minutes = useMemo(() => readingTimeFor(content), [content]);

  const selectedCategory = useMemo(
    () => (categories ?? []).find((entry) => entry.slug === category),
    [categories, category],
  );

  const tags = useMemo(
    () =>
      tagText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8),
    [tagText],
  );

  const pickImage = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((current) => ({ ...current, cover: "Please choose an image file." }));
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((current) => ({ ...current, cover: "Images must be smaller than 5MB." }));
      return;
    }
    setErrors((current) => ({ ...current, cover: "" }));
    setCoverFile(file);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Give your story a title.";
    if (!wordCount(content)) next.content = "Your story needs some content before it can be saved.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (status: PostStatus) => {
    if (!validate()) return;

    const when = fromLocalInput(scheduledFor);
    if (status === "scheduled") {
      if (!when) {
        setErrors({ scheduledFor: "Choose when this post should go live." });
        return;
      }
      if (new Date(when) <= new Date()) {
        setErrors({ scheduledFor: "Pick a time in the future, or publish now instead." });
        return;
      }
    }

    onSubmit({
      title: title.trim(),
      subtitle: subtitle.trim(),
      excerpt: excerpt.trim() || excerptFrom(content),
      content,
      category,
      tags,
      status,
      visibility,
      // Only a scheduled post carries a date; anything else clears it.
      scheduledFor: status === "scheduled" ? when : null,
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      canonicalUrl: canonicalUrl.trim(),
      coverImage: coverFile,
    });
  };

  /** With a future date set, the primary button schedules instead of publishing. */
  const isScheduling = Boolean(fromLocalInput(scheduledFor));

  /**
   * One line describing where the work stands. It distinguishes the two saves
   * that actually exist — the local mirror, and the copy on the account — so
   * "saved" never means something vaguer than the writer assumes.
   */
  const statusLabel = submitting
    ? "Saving to your account…"
    : mirrorState === "pending"
      ? "Saving…"
      : mirrorState === "kept" && mirroredAt
        ? `Kept on this device at ${mirroredAt.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}`
        : post
          ? post.status === "published"
            ? "Published story"
            : post.status === "scheduled"
              ? "Scheduled story"
              : "Draft"
          : "New draft";

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        submit(isScheduling ? "scheduled" : "published");
      }}
    >
      {recovered && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 border-l-2 border-primary bg-muted/40 py-3 pl-5 pr-4 text-sm"
        >
          <span className="text-muted-foreground">
            You have unsaved changes from a previous session.
          </span>
          <span className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setTitle(recovered.title);
                setExcerpt(recovered.excerpt);
                setContent(recovered.content);
                setCategory(recovered.category);
                setTagText(recovered.tagText);
                setRecovered(null);
              }}
            >
              Restore
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                clearStoredDraft(post?.id);
                setRecovered(null);
              }}
            >
              Discard
            </Button>
          </span>
        </div>
      )}
      {/**
        * The writing surface and the publishing settings, side by side.
        * The canvas keeps a comfortable measure; everything that describes the
        * story rather than being the story moves into a sticky rail, so drafting
        * is not interrupted by fields you touch once.
        */}
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14">
        <div className="min-w-0 space-y-9">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            maxLength={MAX_TITLE}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Untitled story"
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
            className="h-auto rounded-none border-0 border-b border-border px-0 py-3 font-serif text-4xl font-semibold shadow-none placeholder:text-muted-foreground/40 focus-visible:border-primary focus-visible:ring-0"
          />
          <div className="flex justify-between text-xs">
            {errors.title ? (
              <span id="title-error" className="text-destructive">
                {errors.title}
              </span>
            ) : (
              <span className="text-muted-foreground">A clear title helps readers find your story.</span>
            )}
            <span className="text-muted-foreground">
              {title.length}/{MAX_TITLE}
            </span>
          </div>
        </div>

        {/* Subtitle: a deck line shown under the title on the article itself. */}
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={subtitle}
            maxLength={300}
            onChange={(event) => setSubtitle(event.target.value)}
            placeholder="An optional line under the title…"
            className="h-auto rounded-none border-0 border-b border-border px-0 py-2 font-serif text-xl text-muted-foreground shadow-none placeholder:text-muted-foreground/40 focus-visible:border-primary focus-visible:ring-0"
          />
        </div>

        {/* Excerpt: the summary used on cards, in search results and in feeds. */}
        <div className="space-y-2">
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            rows={2}
            maxLength={MAX_EXCERPT}
            onChange={(event) => setExcerpt(event.target.value)}
            placeholder="A brief description that appears on cards and previews…"
            className="resize-y"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Leave this empty and we'll use the opening of your story.</span>
            <span>
              {excerpt.length}/{MAX_EXCERPT}
            </span>
          </div>
        </div>


        {/* Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="editor">Content</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setShowPreview((current) => !current)}
              aria-pressed={showPreview}
            >
              {showPreview ? (
                <>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                  Keep writing
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Preview
                </>
              )}
            </Button>
          </div>

          {showPreview ? (
            /* Deliberately the same type, measure and rules as the article
               page, so what a writer approves here is what a reader gets. */
            <div className="surface-card px-5 py-10 sm:px-10 sm:py-14">
              <div className="mx-auto w-full max-w-prose">
                {selectedCategory && (
                  <p className="eyebrow">{selectedCategory.name}</p>
                )}
                <h1 className="mt-4 font-serif text-display-sm font-semibold">
                  {title || "Untitled story"}
                </h1>
                {subtitle && (
                  <p className="mt-5 font-serif text-2xl leading-snug text-foreground/80">
                    {subtitle}
                  </p>
                )}
                {excerpt && (
                  <p className="mt-6 font-sans text-xl leading-relaxed text-muted-foreground">
                    {excerpt}
                  </p>
                )}
                {user && (
                  <div className="mt-10 flex items-center gap-3 border-y border-border py-5">
                    <UserAvatar user={user} size="sm" />
                    <div className="text-sm">
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-muted-foreground">
                        {new Date().toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                        <span aria-hidden="true"> · </span>
                        {minutes} min read
                      </p>
                    </div>
                  </div>
                )}
                {coverPreview && (
                  <img
                    src={coverPreview}
                    alt=""
                    className="mt-10 aspect-[16/9] w-full rounded-md object-cover"
                  />
                )}
                {content ? (
                  <div
                    className="article-content mt-12"
                    /* Sanitised here exactly as the article page sanitises it. */
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
                  />
                ) : (
                  <p className="mt-12 font-sans text-muted-foreground">Nothing to preview yet.</p>
                )}
                {tags.length > 0 && (
                  <ul className="mt-14 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border pt-6">
                    {tags.map((tag) => (
                      <li key={tag} className="font-sans text-sm text-muted-foreground">
                        #{tag}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <RichTextEditor
              id="editor"
              value={content}
              onChange={setContent}
              className={cn(errors.content && "border-destructive")}
            />
          )}

          <div className="flex justify-between text-xs text-muted-foreground">
            {errors.content ? (
              <span className="text-destructive">{errors.content}</span>
            ) : (
              <span>
                {words} {words === 1 ? "word" : "words"}
              </span>
            )}
            <span>{minutes} min read</span>
          </div>
        </div>


        </div>

        <aside className="space-y-9 lg:sticky lg:top-24 lg:h-fit lg:self-start">
          <p className="eyebrow border-b border-border pb-3">Story settings</p>
          {/* Cover image */}
          <div className="space-y-2">
            <Label htmlFor="cover">Cover image</Label>
            <input
              ref={fileInputRef}
              id="cover"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => pickImage(event.target.files?.[0])}
            />

            {coverPreview ? (
              <div className="relative overflow-hidden rounded-md border border-border">
                <img src={coverPreview} alt="Cover preview" className="aspect-[2/1] w-full object-cover" />
                <div className="absolute right-3 top-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Replace
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    aria-label="Remove cover image"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-muted/30 px-6 py-12 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <ImagePlus className="h-6 w-6" aria-hidden="true" />
                Upload a cover image
                <span className="text-xs">PNG or JPG, up to 5MB</span>
              </button>
            )}
            {errors.cover && <p className="text-xs text-destructive">{errors.cover}</p>}
          </div>


          {/* Category + tags */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories ?? []).map((entry) => (
                    <SelectItem key={entry.slug} value={entry.slug}>
                      {entry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!categories?.length && (
                <p className="text-xs text-muted-foreground">
                  No categories are available yet.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tagText}
                onChange={(event) => setTagText(event.target.value)}
                placeholder="mindfulness, focus, habits"
              />
              <p className="text-xs text-muted-foreground">
                Separate with commas. Up to 8 tags.
              </p>
            </div>
          </div>


          <AIAssistant
            title={title}
            content={content}
            onApplyTitle={setTitle}
            onApplyExcerpt={setExcerpt}
            onApplySeo={(seo) => {
              setSeoTitle(seo.seoTitle);
              setSeoDescription(seo.seoDescription);
              // Merge rather than replace: the author's own tags are not
              // suggestions to be overwritten.
              const existing = tagText
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);
              const merged = Array.from(new Set([...existing, ...seo.tags]));
              setTagText(merged.join(", "));
            }}
            onApplyContent={(html) => setContent(content ? `${content}\n${html}` : html)}
          />

          <PublishOptions
            visibility={visibility}
            onVisibilityChange={setVisibility}
            scheduledFor={scheduledFor}
            onScheduledForChange={setScheduledFor}
            seoTitle={seoTitle}
            onSeoTitleChange={setSeoTitle}
            seoDescription={seoDescription}
            onSeoDescriptionChange={setSeoDescription}
            canonicalUrl={canonicalUrl}
            onCanonicalUrlChange={setCanonicalUrl}
            title={title}
            excerpt={excerpt}
            error={errors.scheduledFor}
          />


        </aside>
      </div>

      {/* Actions */}
      <div className="sticky bottom-0 z-30 -mx-5 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border bg-background/90 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/75 sm:-mx-8 sm:px-8">
        {/* Where the work currently stands. Quiet, but never ambiguous. */}
        <p
          role="status"
          aria-live="polite"
          className="flex min-w-0 items-center gap-2 font-sans text-xs text-muted-foreground"
        >
          <span
            aria-hidden="true"
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-200",
              submitting || mirrorState === "pending" ? "bg-muted-foreground/50" : "bg-primary",
            )}
          />
          <span className="truncate">{statusLabel}</span>
        </p>

        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
        <div className="ml-auto flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => submit("draft")}
            disabled={submitting}
          >
            Save draft
          </Button>
          <Button type="submit" disabled={submitting} className="gap-2">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isScheduling ? "Schedule" : post ? "Update story" : "Publish"}
          </Button>
        </div>
      </div>
    </form>
  );
}
