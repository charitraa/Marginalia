import { Link } from "react-router-dom";
import LegalDocument from "@/pages/legal/LegalDocument";
import { CONTACT_EMAIL, SITE_NAME } from "@/config/constants";

const UPDATED = "January 2025";

/** Rendered as a plain definition row rather than a table: it reads the same at
 *  320px as it does on a desktop, and there is nothing to scroll sideways. */
function Store({ name, purpose, life }: { name: string; purpose: string; life: string }) {
  return (
    <div className="border-t border-border py-4 first:border-t-0 first:pt-0">
      <p className="font-mono text-sm text-foreground">{name}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{purpose}</p>
      <p className="mt-1.5 text-2xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {life}
      </p>
    </div>
  );
}

export default function Cookies() {
  return (
    <LegalDocument
      eyebrow={`${SITE_NAME} / Legal`}
      title="Cookie Policy"
      summary={`${SITE_NAME} stores very little in your browser, and every item of it has a job. Here is the complete list.`}
      updated={UPDATED}
      canonicalPath="/cookies"
      sections={[
        {
          id: "what",
          title: "What this covers",
          body: (
            <>
              <p>
                Cookies are small pieces of data a site stores in your browser. This policy also
                covers the two related browser stores {SITE_NAME} uses —{" "}
                <strong>local storage</strong> and <strong>session storage</strong> — because
                they do similar work and you deserve the same account of them.
              </p>
              <p>
                Everything below is either necessary for the service to function or a
                preference you set yourself. There are no advertising cookies here, and no
                third-party trackers.
              </p>
            </>
          ),
        },
        {
          id: "essential",
          title: "Strictly necessary",
          body: (
            <>
              <p>Without these, signing in does not work.</p>
              <div className="mt-6">
                <Store
                  name="Session cookie"
                  purpose="Set by the API when you sign in, and sent back with each request so the server knows it is you. It is HTTP-only, so no script on the page — ours or anyone else's — can read it."
                  life="Until it expires or you sign out"
                />
                <Store
                  name="marginalia.session"
                  purpose="A local flag recording that you chose to stay signed in, so the app knows to attempt a silent refresh on your next visit. It holds no token and no personal data."
                  life="Local storage, until you sign out"
                />
                <Store
                  name="marginalia.oauth-state"
                  purpose="A single-use random value written before you are sent to GitHub or Google, and compared when you return. It is what makes the sign-in round trip tamper-evident."
                  life="Session storage, deleted on return"
                />
              </div>
            </>
          ),
        },
        {
          id: "preferences",
          title: "Your preferences",
          body: (
            <>
              <p>
                These exist only because you set them, and they never leave your device.
              </p>
              <div className="mt-6">
                <Store
                  name="marginalia.theme"
                  purpose="Whether you chose the light theme, the dark one, or to follow your system. Change it any time from the header or from Settings."
                  life="Local storage, until changed"
                />
                <Store
                  name="marginalia.reading"
                  purpose="Article text size and focus mode, kept per device — a phone and a desktop can be set differently."
                  life="Local storage, until changed"
                />
                <Store
                  name="marginalia.draft.*"
                  purpose="An in-progress post, mirrored as you type so a dropped connection or a closed tab never loses your writing. Cleared as soon as the draft saves to your account."
                  life="Local storage, until the draft saves"
                />
                <Store
                  name="marginalia.pending-verification"
                  purpose="The address awaiting a verification code, so reloading the page does not strand you mid sign-up."
                  life="Local storage, until verified"
                />
              </div>
            </>
          ),
        },
        {
          id: "third-party",
          title: "Third parties",
          body: (
            <>
              <p>
                {SITE_NAME} sets no advertising or analytics cookies, and sells nothing to data
                brokers. Article view counts are recorded on the server, not by a tracker in
                your browser.
              </p>
              <p>
                Signing in with GitHub or Google sends you to that provider, which will apply
                its own cookies under its own policy while you are on its pages. Fonts are
                served by Google Fonts.
              </p>
            </>
          ),
        },
        {
          id: "control",
          title: "Staying in control",
          body: (
            <>
              <p>
                Every browser can clear or block this data from its privacy settings, and you
                can clear it for this site alone. Two things to expect if you do:
              </p>
              <ul>
                <li>Blocking the session cookie means you cannot stay signed in.</li>
                <li>
                  Clearing local storage resets your theme and reading preferences, and discards
                  any unsaved draft.
                </li>
              </ul>
              <p>
                Reading {SITE_NAME} signed out needs none of it. See the{" "}
                <Link to="/privacy">Privacy Policy</Link> for what happens on the server.
              </p>
            </>
          ),
        },
      ]}
      footnote={
        <>
          Questions about this policy? Write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-foreground underline decoration-primary/50 underline-offset-[3px]">
            {CONTACT_EMAIL}
          </a>
          .
        </>
      }
    />
  );
}
