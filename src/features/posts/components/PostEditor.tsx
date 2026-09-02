import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, ImagePlus, Loader2, Pencil, X } from "lucide-react";
import RichTextEditor from "@/features/posts/components/RichTextEditor";
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
import type { Post, PostInput, PostStatus } from "@/features/posts/types";

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
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  useEffect(() => {
    if (!title && !content && !excerpt) return;
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(
          draftKey(post?.id),
          JSON.stringify({ title, excerpt, content, category, tagText, savedAt: Date.now() }),
        );
      } catch {
        /* storage unavailable; the editor still works */
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [title, excerpt, content, category, tagText, post?.id]);

  const words = useMemo(() => wordCount(content), [content]);
  const minutes = useMemo(() => readingTimeFor(content), [content]);

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
    onSubmit({
      title: title.trim(),
      excerpt: excerpt.trim() || excerptFrom(content),
      content,
      category,
      tags,
      status,
      coverImage: coverFile,
    });
  };

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        submit("published");
      }}
    >
      {recovered && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm"
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
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          maxLength={MAX_TITLE}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Write your title…"
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "title-error" : undefined}
          className="h-auto border-0 border-b border-border px-0 font-serif text-3xl font-semibold shadow-none focus-visible:ring-0 focus-visible:border-primary rounded-none"
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

      {/* Excerpt */}
      <div className="space-y-2">
        <Label htmlFor="excerpt">Subtitle</Label>
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
          <div className="relative overflow-hidden rounded-lg border border-border">
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
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
          >
            <ImagePlus className="h-6 w-6" aria-hidden="true" />
            Upload a cover image
            <span className="text-xs">PNG or JPG, up to 5MB</span>
          </button>
        )}
        {errors.cover && <p className="text-xs text-destructive">{errors.cover}</p>}
      </div>

      {/* Category + tags */}
      <div className="grid gap-6 sm:grid-cols-2">
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
          <div className="surface-card p-6 sm:p-8">
            <h1 className="font-serif text-3xl sm:text-4xl">{title || "Untitled story"}</h1>
            {excerpt && <p className="mt-3 text-lg text-muted-foreground">{excerpt}</p>}
            {user && (
              <div className="mt-6 flex items-center gap-3 border-b border-border pb-6">
                <UserAvatar user={user} size="sm" />
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-sm text-muted-foreground">· {minutes} min read</span>
              </div>
            )}
            {content ? (
              <div
                className="article-content mt-8"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
              />
            ) : (
              <p className="mt-8 text-muted-foreground">Nothing to preview yet.</p>
            )}
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

      {/* Actions */}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-lg sm:border sm:px-5">
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
            {post ? "Update story" : "Publish"}
          </Button>
        </div>
      </div>
    </form>
  );
}
