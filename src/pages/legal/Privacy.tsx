import { Link } from "react-router-dom";
import LegalDocument from "@/pages/legal/LegalDocument";
import { CONTACT_EMAIL, SITE_NAME } from "@/config/constants";

const UPDATED = "January 2025";

export default function Privacy() {
  return (
    <LegalDocument
      eyebrow={`${SITE_NAME} / Legal`}
      title="Privacy Policy"
      summary={`What ${SITE_NAME} collects when you read or write here, why it is collected, and what you can do about it.`}
      updated={UPDATED}
      canonicalPath="/privacy"
      sections={[
        {
          id: "scope",
          title: "Scope",
          body: (
            <>
              <p>
                This policy covers {SITE_NAME} — the website you are reading and the API behind
                it. It explains what personal data the service handles and on what basis.
              </p>
              <p>
                You can read {SITE_NAME} without an account. Most of what follows applies only
                once you create one.
              </p>
            </>
          ),
        },
        {
          id: "what-we-collect",
          title: "What we collect",
          body: (
            <>
              <p>Three kinds of data, and nothing beyond them:</p>
              <ul>
                <li>
                  <strong>Account data.</strong> Your name, username, email address, and — if
                  you add them — an avatar and a short biography. If you sign in with GitHub or
                  Google, we receive your name, email address and profile picture from that
                  provider, and nothing else.
                </li>
                <li>
                  <strong>What you publish.</strong> Posts, drafts, comments, likes, bookmarks,
                  follows and uploaded images. Published work is public by design; drafts are
                  private to you unless you create a share link for one.
                </li>
                <li>
                  <strong>Technical data.</strong> Ordinary server logs — IP address, browser
                  and the pages requested — kept to keep the service running and to count
                  article views.
                </li>
              </ul>
              <p>
                We do not ask for a phone number, a postal address or payment details, and there
                is nowhere to enter them.
              </p>
            </>
          ),
        },
        {
          id: "how-we-use-it",
          title: "How we use it",
          body: (
            <>
              <p>To operate the service you asked for:</p>
              <ul>
                <li>To keep you signed in and to protect your account.</li>
                <li>To show your work under your name, and to attribute comments.</li>
                <li>
                  To send transactional email — verification, password resets and notifications
                  you have enabled.
                </li>
                <li>
                  To send the newsletter, but only to addresses that confirmed a subscription.
                </li>
                <li>To detect abuse, spam and technical faults.</li>
              </ul>
              <p>
                We do not sell personal data, and we do not use it to build advertising
                profiles.
              </p>
            </>
          ),
        },
        {
          id: "sharing",
          title: "Who else sees it",
          body: (
            <>
              <p>
                Anything you publish — a post, a comment, your public profile — is visible to
                anyone who visits the page it appears on.
              </p>
              <p>
                Beyond that, data is shared only with the infrastructure providers needed to run
                the service: hosting, storage for uploaded images, and an email provider for
                transactional messages. They process data on our instructions and for no
                purpose of their own. We also disclose data where the law genuinely requires it.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies",
          body: (
            <p>
              Sign-in relies on a session cookie, and your theme and reading preferences are
              stored in your own browser. The detail is in the{" "}
              <Link to="/cookies">Cookie Policy</Link>.
            </p>
          ),
        },
        {
          id: "retention",
          title: "How long it is kept",
          body: (
            <>
              <p>
                Account data is kept while your account exists. Deleting your account removes
                your profile, your posts and your comments; the confirmation screen tells you
                exactly how much will go before you confirm.
              </p>
              <p>
                Technical logs are short-lived. Newsletter subscriptions end the moment you
                unsubscribe, from the link in any issue.
              </p>
            </>
          ),
        },
        {
          id: "your-choices",
          title: "Your choices",
          body: (
            <>
              <p>You can, at any time and without asking anyone:</p>
              <ul>
                <li>
                  Correct your name, username, biography, avatar, email address or password in{" "}
                  <Link to="/settings">Settings</Link>.
                </li>
                <li>Delete any post or comment you have written.</li>
                <li>Unsubscribe from the newsletter.</li>
                <li>Delete your account, permanently, from the Security tab in Settings.</li>
              </ul>
              <p>
                If you would like a copy of your data, or want something removed that you cannot
                remove yourself, write to us.
              </p>
            </>
          ),
        },
        {
          id: "security",
          title: "Security",
          body: (
            <p>
              Passwords are stored hashed, never in readable form. Traffic is encrypted in
              transit, and every post body is sanitised before it is rendered. No service can
              promise perfect security, but nothing here is left to chance either — and if a
              breach affects you, we will tell you.
            </p>
          ),
        },
        {
          id: "children",
          title: "Children",
          body: (
            <p>
              {SITE_NAME} is not intended for children under 13, and accounts are not knowingly
              created for them. If you believe a child has an account here, contact us and it
              will be removed.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes",
          body: (
            <p>
              If this policy changes in a way that affects you, the date at the top changes with
              it and the change is announced on the site. Continuing to use {SITE_NAME}
              {" "}after that means the revised policy applies.
            </p>
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
