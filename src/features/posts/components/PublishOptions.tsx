import { CalendarClock, Globe, Lock, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { PostVisibility } from "../types";

/** Converts an ISO string to the value a datetime-local input expects. */
export function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  // datetime-local has no timezone, so shift into local time before slicing.
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

/** And back again, so the API always receives a real instant. */
export function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const VISIBILITY: Array<{
  value: PostVisibility;
  label: string;
  hint: string;
  icon: typeof Globe;
}> = [
  { value: "public", label: "Everyone", hint: "Anyone can read it.", icon: Globe },
  { value: "members", label: "Members only", hint: "Signed-in readers only.", icon: Users },
  { value: "private", label: "Only me", hint: "Hidden from every public list.", icon: Lock },
];

/**
 * The secondary publishing controls: when it goes live, who may read it, and
 * how it appears in search results.
 *
 * Collapsed by default — none of it is needed to write, and putting it inline
 * would bury the editor under fields most posts never touch.
 */
export default function PublishOptions({
  visibility,
  onVisibilityChange,
  scheduledFor,
  onScheduledForChange,
  seoTitle,
  onSeoTitleChange,
  seoDescription,
  onSeoDescriptionChange,
  canonicalUrl,
  onCanonicalUrlChange,
  title,
  excerpt,
  error,
}: {
  visibility: PostVisibility;
  onVisibilityChange: (value: PostVisibility) => void;
  scheduledFor: string;
  onScheduledForChange: (value: string) => void;
  seoTitle: string;
  onSeoTitleChange: (value: string) => void;
  seoDescription: string;
  onSeoDescriptionChange: (value: string) => void;
  canonicalUrl: string;
  onCanonicalUrlChange: (value: string) => void;
  title: string;
  excerpt: string;
  error?: string;
}) {
  // The smallest instant the picker should accept is "now", rounded to a minute.
  const minimum = toLocalInput(new Date(Date.now() + 60_000).toISOString());

  return (
    <Accordion type="multiple" className="surface-card px-4 sm:px-5">
      <AccordionItem value="schedule" className="border-b-0">
        <AccordionTrigger className="text-sm font-medium">
          <span className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Schedule &amp; visibility
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-5 pb-5">
          <div className="space-y-2">
            <Label htmlFor="scheduled-for">Publish at</Label>
            <Input
              id="scheduled-for"
              type="datetime-local"
              min={minimum}
              value={scheduledFor}
              onChange={(event) => onScheduledForChange(event.target.value)}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "scheduled-error" : "scheduled-hint"}
            />
            {error ? (
              <p id="scheduled-error" className="text-sm text-destructive">{error}</p>
            ) : (
              <p id="scheduled-hint" className="text-xs text-muted-foreground">
                Leave empty to publish immediately. With a date set, use
                “Schedule” instead of “Publish”.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Who can read it</Label>
            <Select
              value={visibility}
              onValueChange={(value) => onVisibilityChange(value as PostVisibility)}
            >
              <SelectTrigger id="visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY.map(({ value, label, icon: Icon }) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {VISIBILITY.find((entry) => entry.value === visibility)?.hint}
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="seo" className="border-b-0">
        <AccordionTrigger className="text-sm font-medium">
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" aria-hidden="true" />
            Search appearance
          </span>
        </AccordionTrigger>
        <AccordionContent className="space-y-5 pb-5">
          <div className="space-y-2">
            <Label htmlFor="seo-title">Search title</Label>
            <Input
              id="seo-title"
              value={seoTitle}
              maxLength={70}
              onChange={(event) => onSeoTitleChange(event.target.value)}
              placeholder={title || "Uses the post title"}
            />
            <p className="text-xs text-muted-foreground">
              {seoTitle.length}/70 · leave empty to use the title.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="seo-description">Search description</Label>
            <Textarea
              id="seo-description"
              rows={3}
              maxLength={200}
              value={seoDescription}
              onChange={(event) => onSeoDescriptionChange(event.target.value)}
              placeholder={excerpt || "Uses the excerpt"}
            />
            <p className="text-xs text-muted-foreground">
              {seoDescription.length}/200 · leave empty to use the excerpt.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonical-url">Canonical URL</Label>
            <Input
              id="canonical-url"
              type="url"
              value={canonicalUrl}
              onChange={(event) => onCanonicalUrlChange(event.target.value)}
              placeholder="https://example.com/original-post"
            />
            <p className="text-xs text-muted-foreground">
              Only if this was published elsewhere first — it tells search
              engines which copy is the original.
            </p>
          </div>

          {/* A preview beats explaining what the fields do. */}
          <div className="rounded-md border border-border p-3">
            <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
              Preview
            </p>
            <p className="line-clamp-1 text-sm text-[#1a0dab] dark:text-[#8ab4f8]">
              {seoTitle || title || "Untitled story"}
            </p>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {seoDescription || excerpt || "No description yet."}
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
