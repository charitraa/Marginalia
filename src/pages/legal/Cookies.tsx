import Layout from "@/components/layout/Layout";

export default function Cookies() {
  return (
    <Layout>
      <div className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl prose dark:prose-invert">
          <h1>Cookie Policy</h1>
          <p className="lead">Last updated: January 2025</p>

          <h2>What Are Cookies</h2>
          <p>
            Cookies are small pieces of text stored on your browser when you visit a website. They help
            websites remember information about your visit, such as your preferences and login information.
          </p>

          <h2>How We Use Cookies</h2>
          <p>ArticleHub uses cookies for the following purposes:</p>

          <h3>Essential Cookies</h3>
          <p>
            These cookies are necessary for the website to function properly. They enable you to navigate
            the website and use its essential features.
          </p>

          <h3>Performance Cookies</h3>
          <p>
            These cookies collect anonymous information about how you use our website. This helps us
            understand visitor behavior and identify areas for improvement.
          </p>

          <h3>Functional Cookies</h3>
          <p>
            These cookies remember your preferences and choices to provide a more personalized experience.
            For example, they remember your login information and language preferences.
          </p>

          <h3>Marketing Cookies</h3>
          <p>
            These cookies are used to track your activity across websites to deliver targeted advertisements
            and marketing messages.
          </p>

          <h2>Third-Party Cookies</h2>
          <p>
            ArticleHub may allow third-party service providers to place cookies on your device. These
            providers may use cookies for analytics, advertising, and other purposes.
          </p>

          <h2>Controlling Cookies</h2>
          <p>
            Most browsers allow you to control cookies through their settings. You can usually find these
            settings in the preferences or options menu of your browser. However, disabling cookies may
            affect the functionality of the website.
          </p>

          <h2>Cookie Consent</h2>
          <p>
            When you first visit ArticleHub, you will be asked to consent to the use of cookies. You can
            change your cookie preferences at any time through your account settings.
          </p>

          <h2>Contact Us</h2>
          <p>If you have questions about our use of cookies, please contact us at privacy@articlehub.com</p>
        </div>
      </div>
    </Layout>
  );
}
