import Layout from "@/components/layout/Layout";

export default function Privacy() {
  return (
    <Layout>
      <div className="py-12 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl prose dark:prose-invert">
          <h1>Privacy Policy</h1>
          <p className="lead">Last updated: January 2025</p>

          <h2>Introduction</h2>
          <p>
            ArticleHub ("we" or "us" or "our") operates the ArticleHub website and mobile application
            (the "Service").
          </p>
          <p>
            This page informs you of our policies regarding the collection, use, and disclosure of
            personal data when you use our Service and the choices you have associated with that data.
          </p>

          <h2>Information Collection and Use</h2>
          <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>

          <h3>Types of Data Collected</h3>
          <ul>
            <li>Personal Data including but not limited to Email address, First name and last name, Phone number, Cookies and Usage Data</li>
            <li>Usage Data including information such as your IP address, browser type and version, pages you visit, time and date of your visits, and other diagnostic data</li>
          </ul>

          <h2>Use of Data</h2>
          <p>ArticleHub uses the collected data for various purposes:</p>
          <ul>
            <li>To provide and maintain our Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer support</li>
            <li>To gather analysis or valuable information so that we can improve our Service</li>
            <li>To monitor the usage of our Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>

          <h2>Security of Data</h2>
          <p>
            The security of your data is important to us, but remember that no method of transmission over
            the Internet or method of electronic storage is 100% secure. While we strive to use commercially
            acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
          </p>

          <h2>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@articlehub.com</p>
        </div>
      </div>
    </Layout>
  );
}
