import { Link } from "react-router-dom";
import LegalDocument from "@/pages/legal/LegalDocument";
import { CONTACT_EMAIL, SITE_NAME } from "@/config/constants";

const UPDATED = "January 2025";

export default function Terms() {
  return (
    <LegalDocument
      eyebrow={`${SITE_NAME} / Legal`}
      title="Terms of Service"
      summary={`The agreement between you and ${SITE_NAME}: what you may do here, what we may do, and where each side's responsibility ends.`}
      updated={UPDATED}
      canonicalPath="/terms"
      sections={[
        {
          id: "agreement",
          title: "The agreement",
          body: (
            <p>
              By using {SITE_NAME} you accept these terms. If you do not accept them, please do
              not use the service. Where they conflict with the{" "}
              <Link to="/privacy">Privacy Policy</Link> on a question of personal data, the
              Privacy Policy governs.
            </p>
          ),
        },
        {
          id: "accounts",
          title: "Your account",
          body: (
            <>
              <p>
                You need an account to write, comment, follow or bookmark. You are responsible
                for what happens under it, so keep your password to yourself and tell us if you
                think it has been compromised.
              </p>
              <p>
                One person, one account. Accounts created to impersonate someone else, or to
                evade a suspension, will be removed.
              </p>
            </>
          ),
        },
        {
          id: "your-content",
          title: "What you write stays yours",
          body: (
            <>
              <p>
                You keep every right you already had in what you publish here. Nothing in these
                terms transfers ownership of your writing to us.
              </p>
              <p>
                By publishing on {SITE_NAME} you grant us a non-exclusive, worldwide,
                royalty-free licence to host, store, reproduce and display that work for the
                purpose of running the service — showing it on its page, in feeds and in search
                results, and quoting an excerpt of it in the newsletter. The licence exists so
                the site can display your work; it ends for new uses when you delete the work,
                allowing for copies in backups and caches that expire in the ordinary course.
              </p>
              <p>
                You confirm that you have the right to publish what you post, including any
                images in it.
              </p>
            </>
          ),
        },
        {
          id: "conduct",
          title: "What is not allowed",
          body: (
            <>
              <p>Do not use {SITE_NAME} to:</p>
              <ul>
                <li>Publish work that is not yours to publish.</li>
                <li>Harass, threaten or target another person.</li>
                <li>Post malware, phishing pages, or content designed to deceive.</li>
                <li>
                  Publish material that is unlawful where it is read, or that sexualises
                  children.
                </li>
                <li>Spam — bulk posting, comment farming, or undisclosed paid promotion.</li>
                <li>
                  Attack the service itself: scraping at a volume that degrades it, probing for
                  vulnerabilities without permission, or circumventing access controls.
                </li>
              </ul>
              <p>
                Comments can be reported for review. Reports are read by a human, and reporting
                something does not remove it on its own.
              </p>
            </>
          ),
        },
        {
          id: "moderation",
          title: "Moderation",
          body: (
            <p>
              We may remove content or suspend an account that breaks these terms. Where it is
              practical and lawful to do so, we will say why. Serious or repeated breaches can
              end an account without warning.
            </p>
          ),
        },
        {
          id: "our-content",
          title: "The service itself",
          body: (
            <p>
              The {SITE_NAME} name, design and software belong to us or to our licensors. You
              may read, link to and quote the site normally; you may not copy the service
              wholesale or present it as your own.
            </p>
          ),
        },
        {
          id: "availability",
          title: "Availability",
          body: (
            <p>
              {SITE_NAME} is provided as it is, without warranty of any kind. We do not promise
              that it will be uninterrupted, error-free, or that any particular feature will
              stay available. Features may change or be withdrawn.
            </p>
          ),
        },
        {
          id: "liability",
          title: "Liability",
          body: (
            <p>
              To the fullest extent the law allows, we are not liable for indirect or
              consequential loss, for lost profits, or for loss of data arising from your use of
              the service. Nothing here limits liability that cannot lawfully be limited.
            </p>
          ),
        },
        {
          id: "ending",
          title: "Ending this agreement",
          body: (
            <p>
              You can close your account at any time from the Security tab in{" "}
              <Link to="/settings">Settings</Link>. We can end an account for a breach of these
              terms. The sections on your content licence, liability and governing law survive
              the end of the agreement.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes to these terms",
          body: (
            <p>
              These terms may be revised. The date at the top changes when they are, and
              continuing to use {SITE_NAME} after a revision means you accept it. If a change is
              material, it will be announced on the site.
            </p>
          ),
        },
      ]}
      footnote={
        <>
          Questions about these terms? Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline decoration-primary/50 underline-offset-[3px]">
            {CONTACT_EMAIL}
          </a>
          .
        </>
      }
    />
  );
}
