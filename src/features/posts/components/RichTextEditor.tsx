import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Loader2,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { uploadEditorImage } from "@/features/uploads/api/uploadService";
import { errorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

interface ToolbarAction {
  icon: typeof Bold;
  label: string;
  command: string;
  argument?: string;
}

const INLINE_ACTIONS: ToolbarAction[] = [
  { icon: Bold, label: "Bold", command: "bold" },
  { icon: Italic, label: "Italic", command: "italic" },
  { icon: Strikethrough, label: "Strikethrough", command: "strikeThrough" },
];

const BLOCK_ACTIONS: ToolbarAction[] = [
  { icon: Heading2, label: "Heading", command: "formatBlock", argument: "h2" },
  { icon: Heading3, label: "Subheading", command: "formatBlock", argument: "h3" },
  { icon: Quote, label: "Quote", command: "formatBlock", argument: "blockquote" },
  { icon: Code2, label: "Code block", command: "formatBlock", argument: "pre" },
];

const LIST_ACTIONS: ToolbarAction[] = [
  { icon: List, label: "Bulleted list", command: "insertUnorderedList" },
  { icon: ListOrdered, label: "Numbered list", command: "insertOrderedList" },
];

/**
 * A contenteditable editor producing the HTML the API stores.
 *
 * document.execCommand is deprecated but remains the only dependency-free way
 * to get reliable rich text editing across browsers; output is sanitised on the
 * way out here and again on render.
 */
export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Tell your story…",
  className,
  id = "editor",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  /** The last HTML this editor emitted, so we can tell our own edits apart. */
  const emittedRef = useRef<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Writing to innerHTML resets the caret, so only do it when the value changed
  // outside this component (loading a post to edit), never on our own keystrokes.
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || value === emittedRef.current) return;

    editor.innerHTML = sanitizeHtml(value);
    emittedRef.current = value;
    setIsEmpty(!editor.textContent?.trim());
  }, [value]);

  const emitChange = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    setIsEmpty(!editor.textContent?.trim());
    emittedRef.current = editor.innerHTML;
    onChange(editor.innerHTML);
  }, [onChange]);

  const exec = (command: string, argument?: string) => {
    editorRef.current?.focus();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand(command, false, argument);
    emitChange();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const insertImage = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadEditorImage(file);
      if (!url) throw new Error("no url returned");
      // Focus first: execCommand inserts at the caret, which is lost while the
      // file dialog is open.
      editorRef.current?.focus();
      exec("insertImage", url);
    } catch (error) {
      toast.error(errorMessage(error, "That image could not be uploaded."));
    } finally {
      setUploading(false);
    }
  };

  const addLink = () => {
    const url = window.prompt("Link URL");
    if (!url) return;
    // Only http(s) and mail links; javascript: URLs are rejected outright.
    if (!/^(https?:\/\/|mailto:)/i.test(url)) {
      window.alert("Please enter a link starting with http://, https:// or mailto:");
      return;
    }
    exec("createLink", url);
  };

  const renderAction = ({ icon: Icon, label, command, argument }: ToolbarAction) => (
    <Button
      key={label}
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8"
      title={label}
      aria-label={label}
      onMouseDown={(event) => event.preventDefault()} // keep the selection
      onClick={() => exec(command, argument)}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </Button>
  );

  return (
    /* No overflow clipping here: it would trap the sticky toolbar below. */
    <div className={cn("surface-card", className)}>
      <div
        role="toolbar"
        aria-label="Formatting"
        aria-controls={id}
        /* Follows the writer down a long draft, tucked under the site header. */
        className="sticky top-14 z-20 flex flex-wrap items-center gap-0.5 rounded-t-md border-b border-border bg-card/95 p-1.5 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      >
        {INLINE_ACTIONS.map(renderAction)}
        <Separator orientation="vertical" className="mx-1 h-5" />
        {BLOCK_ACTIONS.map(renderAction)}
        <Separator orientation="vertical" className="mx-1 h-5" />
        {LIST_ACTIONS.map(renderAction)}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Add link"
          aria-label="Add link"
          onMouseDown={(event) => event.preventDefault()}
          onClick={addLink}
        >
          <Link2 className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="Insert image"
          aria-label="Insert image"
          disabled={uploading}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            // Reset first so choosing the same file twice still fires.
            event.target.value = "";
            if (file) void insertImage(file);
          }}
        />

        <div className="ml-auto flex items-center gap-0.5">
          {renderAction({ icon: Undo2, label: "Undo", command: "undo" })}
          {renderAction({ icon: Redo2, label: "Redo", command: "redo" })}
        </div>
      </div>

      <div className="relative">
        {isEmpty && (
          <p
            className="pointer-events-none absolute left-5 top-5 font-serif text-lg text-muted-foreground"
            aria-hidden="true"
          >
            {placeholder}
          </p>
        )}
        <div
          id={id}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Story content"
          onInput={emitChange}
          onBlur={emitChange}
          onPaste={(event) => {
            // Paste as plain text so foreign markup never enters the document.
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
          }}
          className="article-content min-h-[24rem] w-full px-5 py-5 focus:outline-none"
        />
      </div>
    </div>
  );
}
