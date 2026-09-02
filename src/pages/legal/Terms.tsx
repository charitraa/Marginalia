import Layout from "@/components/layout/Layout";

export default function Terms() {
  return (
    <Layout>
      <div className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl prose dark:prose-invert">
          <h1>Terms of Service</h1>
          <p className="lead">Last updated: January 2025</p>

          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing and using the ArticleHub website and mobile application, you accept and agree to be
            bound by the terms and provision of this agreement.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software)
            on ArticleHub for personal, non-commercial transitory viewing only. This is the grant of a license,
            not a transfer of title, and under this license you may not:
          </p>
          <ul>
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose or for any public display</li>
            <li>Attempt to decompile or reverse engineer any software contained on ArticleHub</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
          </ul>

          <h2>3. Disclaimer</h2>
          <p>
            The materials on ArticleHub are provided on an 'as is' basis. ArticleHub makes no warranties,
            expressed or implied, and hereby disclaims and negates all other warranties including, without
            limitation, implied warranties or conditions of merchantability, fitness for a particular purpose,
            or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2>4. Limitations</h2>
          <p>
            In no event shall ArticleHub or its suppliers be liable for any damages (including, without
            limitation, damages for loss of data or profit, or due to business interruption) arising out of
            the use or inability to use the materials on ArticleHub.
          </p>

          <h2>5. Accuracy of Materials</h2>
          <p>
            The materials appearing on ArticleHub could include technical, typographical, or photographic
            errors. ArticleHub does not warrant that any of the materials on the website are accurate,
            complete, or current.
          </p>

          <h2>6. Links</h2>
          <p>
            ArticleHub has not reviewed all of the sites linked to its website and is not responsible for
            the contents of any such linked site. The inclusion of any link does not imply endorsement by
            ArticleHub of the site. Use of any such linked website is at the user's own risk.
          </p>

          <h2>7. Modifications</h2>
          <p>
            ArticleHub may revise these terms of service for the website at any time without notice. By
            using this website, you are agreeing to be bound by the then current version of these terms
            of service.
          </p>

          <h2>8. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the
            United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>

          <h2>Contact Us</h2>
          <p>If you have any questions about these Terms of Service, please contact us at legal@articlehub.com</p>
        </div>
      </div>
    </Layout>
  );
}
