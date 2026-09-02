import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import * as commentService from "@/features/comments/api/commentService";
import { errorMessage } from "@/lib/errors";
import type { ReportReason } from "@/features/comments/types";

const REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: "spam", label: "Spam or advertising" },
  { value: "abuse", label: "Harassment or hate" },
  { value: "off_topic", label: "Off topic" },
  { value: "other", label: "Something else" },
];

/**
 * Reports a comment to a moderator.
 *
 * The confirmation deliberately says the comment has been *flagged for review*,
 * never that it has been removed — a report queues a decision, it does not make
 * one, and promising otherwise would be a lie to the reporter.
 */
export default function ReportCommentDialog({
  commentId,
  open,
  onOpenChange,
}: {
  commentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState<ReportReason>("spam");
  const [detail, setDetail] = useState("");

  const report = useMutation({
    mutationFn: () => commentService.reportComment(commentId, reason, detail.trim()),
    onSuccess: () => {
      toast.success("Thanks — this comment has been flagged for review.");
      onOpenChange(false);
      setDetail("");
      setReason("spam");
    },
    onError: (error) => toast.error(errorMessage(error, "Could not send that report.")),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report this comment</DialogTitle>
          <DialogDescription>
            A moderator will review it. The comment stays visible until they decide.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup
            value={reason}
            onValueChange={(value) => setReason(value as ReportReason)}
            className="gap-2"
          >
            {REASONS.map((entry) => (
              <div key={entry.value} className="flex items-center gap-2">
                <RadioGroupItem value={entry.value} id={`reason-${entry.value}`} />
                <Label htmlFor={`reason-${entry.value}`} className="font-normal">
                  {entry.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="report-detail">Anything to add? (optional)</Label>
            <Textarea
              id="report-detail"
              value={detail}
              maxLength={500}
              rows={3}
              onChange={(event) => setDetail(event.target.value)}
              placeholder="Context that helps a moderator decide."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => report.mutate()} disabled={report.isPending}>
            {report.isPending ? "Sending…" : "Send report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
