import { useState } from "react";
import { ArrowUpRight, Mail } from "lucide-react";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT_EMAIL, SITE_NAME, SOURCE_URL } from "@/config/constants";

const CHANNELS = [
  {
    label: "Anything at all",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    note: "Questions, corrections, an idea for a piece, or a bug you hit. Read by a person.",
  },
  {
    label: "Security",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Security report")}`,
    note: "Found a vulnerability? Report it privately first, with steps to reproduce, and give us time to fix it before disclosing.",
  },
  {
    label: "The code",
    value: "github.com/charitraa/Marginalia",
    href: SOURCE_URL,
    external: true,
    note: "Bugs and feature requests are welcome as issues, where everyone can follow them.",
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const set =
    (key: keyof typeof form) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  /**
   * There is no contact endpoint on the API, so this composes a real message in
   * the reader's own mail client rather than pretending to send one. The reader
   * keeps a copy in their sent folder, which is the better outcome anyway.
   */
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const body = [
      form.message,
      "",
      "—",
      form.name && `From: ${form.name}`,
      form.email && `Reply to: ${form.email}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      form.subject || `${SITE_NAME} enquiry`,
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Layout>
      <Seo
        title="Contact"
        description={`Get in touch with ${SITE_NAME}.`}
        canonicalPath="/contact"
      />

      <section className="container-page pb-16 pt-16 sm:pt-24">
        <div className="rail">
          <p className="rail-label">Contact</p>
          <div>
            <h1 className="max-w-[16ch] font-serif text-display-sm font-semibold">
              Say something in the margin.
            </h1>
            <p className="mt-7 max-w-measure font-sans text-lg leading-relaxed text-muted-foreground">
              Corrections, questions, a piece you think belongs here, or something that broke —
              it all reaches the same inbox, and it is a small enough publication that you will
              get an answer.
            </p>
          </div>
        </div>
      </section>

      <div className="container-page pb-24">
        <div className="grid gap-14 border-t border-foreground/15 pt-12 lg:grid-cols-[1fr_1.35fr] lg:gap-20">
          {/* Where to write, plainly listed. */}
          <div>
            <h2 className="eyebrow">Direct</h2>
            <ul className="mt-6">
              {CHANNELS.map((channel) => (
                <li key={channel.label} className="border-t border-border py-6 first:border-t-0 first:pt-0">
                  <p className="font-sans text-2xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    {channel.label}
                  </p>
                  <a
                    href={channel.href}
                    {...(channel.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="group mt-2 inline-flex items-center gap-1.5 font-serif text-lg font-semibold text-foreground transition-colors duration-200 hover:text-primary"
                  >
                    <span className="break-all">{channel.value}</span>
                    {channel.external && (
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 transition-transform duration-200 ease-editorial group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    )}
                  </a>
                  <p className="mt-2 font-sans text-sm leading-relaxed text-muted-foreground">
                    {channel.note}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* The form is a composer, not a submission — and it says so. */}
          <div>
            <h2 className="eyebrow">Draft a message</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={set("name")}
                    autoComplete="name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Your email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={form.subject}
                  onChange={set("subject")}
                  placeholder="What is this about?"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  onChange={set("message")}
                  rows={8}
                  required
                  placeholder="Write as much or as little as you like."
                  className="mt-2 resize-y"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
                <p className="max-w-[24rem] font-sans text-xs leading-relaxed text-muted-foreground">
                  This opens the message in your own mail app, addressed to {CONTACT_EMAIL} — so
                  you keep a copy of what you sent.
                </p>
                <Button type="submit" className="gap-2" disabled={!form.message.trim()}>
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Open in your mail app
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
