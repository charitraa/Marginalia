import { useState } from "react";
import { Mail, Pencil, RefreshCw, Send, Trash2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import EmptyState from "@/components/common/EmptyState";
import ErrorState from "@/components/common/ErrorState";
import Pagination from "@/components/common/Pagination";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import StatCard from "@/features/admin/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useCampaigns, useCampaignMutations } from "@/features/newsletter/hooks/useCampaigns";
import { pageCount } from "@/lib/api/normalize";
import { formatRelative } from "@/lib/format";
import type { Campaign, CampaignInput } from "@/features/newsletter/types";

const EMPTY: CampaignInput = { name: "", subject: "", html: "" };

/**
 * Newsletter campaigns.
 *
 * Sending is irreversible and reaches every confirmed subscriber, so it sits
 * behind a confirmation that names the campaign rather than a bare "are you
 * sure". A sent campaign becomes read-only: the emails are already in inboxes,
 * and letting the record drift would make its figures a lie.
 */
export default function AdminNewsletter() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [draft, setDraft] = useState<CampaignInput>(EMPTY);
  const [composing, setComposing] = useState(false);
  const [confirmSend, setConfirmSend] = useState<Campaign | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Campaign | null>(null);

  const { data, isLoading, isError, error, refetch } = useCampaigns(page);
  const { create, update, remove, send, refresh } = useCampaignMutations();

  const campaigns = data?.items ?? [];

  const openCompose = (campaign?: Campaign) => {
    setEditing(campaign ?? null);
    setDraft(campaign
      ? { name: campaign.name, subject: campaign.subject, html: "" }
      : EMPTY);
    setComposing(true);
  };

  const save = () => {
    if (editing) update.mutate({ id: editing.id, input: draft });
    else create.mutate(draft);
    setComposing(false);
  };

  return (
    <Layout>
      <Seo title="Newsletter · Admin" noIndex />

      <div className="container-page max-w-4xl py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Newsletter</h1>
            <p className="mt-2 text-muted-foreground">
              Campaigns go to every confirmed subscriber. Open and click rates come
              back from Brevo.
            </p>
          </div>
          <Button className="gap-2" onClick={() => openCompose()}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            New campaign
          </Button>
        </header>

        {isError ? (
          <ErrorState error={error} title="We couldn't load your campaigns."
                      onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="space-y-3" aria-busy="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={<Mail className="h-10 w-10" />}
            title="No campaigns yet"
            description="Write one and it goes to everyone who confirmed their subscription."
            action={{ label: "Write the first one", onClick: () => openCompose() }}
          />
        ) : (
          <ul className="space-y-4">
            {campaigns.map((campaign) => {
              const sent = campaign.status === "sent";
              return (
                <li key={campaign.id} className="rounded-lg border border-border p-5">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-medium">{campaign.subject}</h2>
                        <Badge
                          variant="outline"
                          className={
                            campaign.status === "failed"
                              ? "border-destructive/40 text-destructive"
                              : sent ? "border-primary/40 text-primary" : undefined
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {campaign.name}
                        {campaign.createdBy && ` · by ${campaign.createdBy}`}
                        {sent && campaign.sentAt && ` · sent ${formatRelative(campaign.sentAt)}`}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      {sent ? (
                        <Button
                          variant="outline" size="sm" className="gap-2"
                          onClick={() => refresh.mutate(campaign.id)}
                          disabled={refresh.isPending}
                        >
                          <RefreshCw
                            className={refresh.isPending ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                            aria-hidden="true"
                          />
                          Refresh figures
                        </Button>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" className="gap-2"
                                  onClick={() => openCompose(campaign)}>
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="gap-2 text-destructive hover:text-destructive"
                            onClick={() => setConfirmDelete(campaign)}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Delete
                          </Button>
                          <Button size="sm" className="gap-2"
                                  onClick={() => setConfirmSend(campaign)}>
                            <Send className="h-4 w-4" aria-hidden="true" />
                            Send
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {sent && campaign.stats && (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatCard label="Delivered" value={campaign.stats.delivered}
                                  hint={`${campaign.stats.sent} sent`} />
                        <StatCard label="Opens" value={campaign.stats.opens}
                                  hint={`${campaign.openRate}% of delivered`} emphasis />
                        <StatCard label="Clicks" value={campaign.stats.clicks}
                                  hint={`${campaign.clickRate}% of delivered`} />
                        <StatCard
                          label="Bounced" value={campaign.stats.hardBounces + campaign.stats.softBounces}
                          hint={`${campaign.stats.unsubscribed} unsubscribed`}
                        />
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Rates are against delivered, not sent — a bounce was never a
                        chance to open.
                        {campaign.statsUpdatedAt &&
                          ` Updated ${formatRelative(campaign.statsUpdatedAt)}.`}
                      </p>
                    </>
                  )}

                  {sent && !campaign.stats && (
                    <p className="text-sm text-muted-foreground">
                      No figures yet — Brevo takes a little while. Try refreshing.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {data && pageCount(data) > 1 && (
          <Pagination page={page} pageCount={pageCount(data)} onPageChange={setPage} />
        )}
      </div>

      {/* Compose / edit */}
      <Dialog open={composing} onOpenChange={setComposing}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit draft" : "New campaign"}</DialogTitle>
            <DialogDescription>
              Nothing is sent until you choose Send.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Internal name</Label>
              <Input
                id="campaign-name"
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="March round-up"
              />
              <p className="text-xs text-muted-foreground">Readers never see this.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-subject">Subject line</Label>
              <Input
                id="campaign-subject"
                value={draft.subject}
                onChange={(event) => setDraft({ ...draft, subject: event.target.value })}
                placeholder="What we published in March"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campaign-html">Email body (HTML)</Label>
              <Textarea
                id="campaign-html"
                rows={10}
                value={draft.html}
                onChange={(event) => setDraft({ ...draft, html: event.target.value })}
                placeholder="<h1>Hello</h1><p>This month…</p>"
                className="font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Brevo adds the unsubscribe link and the tracking that produces open
                and click rates.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setComposing(false)}>Cancel</Button>
            <Button
              onClick={save}
              disabled={
                create.isPending || update.isPending ||
                !draft.name.trim() || !draft.subject.trim() || draft.html.trim().length < 20
              }
            >
              Save draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmSend)}
        onOpenChange={(open) => !open && setConfirmSend(null)}
        title={`Send “${confirmSend?.subject ?? ""}”?`}
        description="This goes to every confirmed subscriber immediately and cannot be recalled or edited afterwards."
        confirmLabel="Send now"
        loading={send.isPending}
        onConfirm={() => {
          if (confirmSend) send.mutate(confirmSend.id);
          setConfirmSend(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title={`Delete “${confirmDelete?.name ?? ""}”?`}
        description="This draft has not been sent, so nothing reaches anyone. It cannot be recovered."
        confirmLabel="Delete draft"
        destructive
        loading={remove.isPending}
        onConfirm={() => {
          if (confirmDelete) remove.mutate(confirmDelete.id);
          setConfirmDelete(null);
        }}
      />
    </Layout>
  );
}
