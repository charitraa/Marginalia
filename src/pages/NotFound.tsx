import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// Mistyping a URL is ordinary navigation, not an application fault, so it is
// not logged to the console.
const NotFound = () => {
  return (
    <Layout>
      <Seo title="Page not found" noIndex />
      <div className="min-h-screen flex items-center justify-center py-12 md:py-20">
        <div className="text-center max-w-md px-4">
          <div className="mb-8">
            <p className="text-6xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              404
            </p>
          </div>

          <h1 className="text-4xl font-semibold mb-4">Page Not Found</h1>

          <p className="text-lg text-muted-foreground mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
          </p>

          <div className="space-y-3">
            <Link to="/" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2">
                Back to Home <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/explore" className="block">
              <Button variant="outline" className="w-full">
                Explore Articles
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
