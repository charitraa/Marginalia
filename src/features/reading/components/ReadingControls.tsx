import { Focus, Minus, Plus, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import type { ReadingPrefs } from "../hooks/useReadingPrefs";

const MIN = 0.9;
const MAX = 1.4;
const STEP = 0.1;

/**
 * Text size and focus mode.
 *
 * Both are comfort settings rather than accessibility substitutes — browser
 * zoom still works, and this sits alongside it for readers who want larger
 * body text without enlarging the whole interface.
 */
export default function ReadingControls({
  prefs,
  onChange,
}: {
  prefs: ReadingPrefs;
  onChange: (patch: Partial<ReadingPrefs>) => void;
}) {
  const setScale = (delta: number) =>
    onChange({
      fontScale: Math.round(Math.min(MAX, Math.max(MIN, prefs.fontScale + delta)) * 10) / 10,
    });

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Reading options">
      <Type className="mr-1 h-4 w-4 text-muted-foreground" aria-hidden="true" />

      <Button
        variant="ghost" size="icon" className="h-8 w-8"
        onClick={() => setScale(-STEP)}
        disabled={prefs.fontScale <= MIN}
        aria-label="Smaller text"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </Button>

      <span className="w-10 text-center text-xs tabular-nums text-muted-foreground"
            aria-live="polite">
        {Math.round(prefs.fontScale * 100)}%
      </span>

      <Button
        variant="ghost" size="icon" className="h-8 w-8"
        onClick={() => setScale(STEP)}
        disabled={prefs.fontScale >= MAX}
        aria-label="Larger text"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </Button>

      <Toggle
        pressed={prefs.focusMode}
        onPressedChange={(pressed) => onChange({ focusMode: pressed })}
        aria-label="Focus mode — hide everything but the article"
        title="Focus mode"
        className="h-8 w-8 p-0"
      >
        <Focus className="h-4 w-4" aria-hidden="true" />
      </Toggle>
    </div>
  );
}
