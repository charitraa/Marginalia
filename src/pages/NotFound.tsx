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

      <div className="container-page flex min-h-[70vh] items-center py-20">
        {/* The page is literally set in the margin — the one place the brand's
            own idiom can carry a joke without explaining it. A single accent
            rule does the work; the rail's own hairline would only double it. */}
        <div className="w-full">
          <p className="eyebrow mb-6">Error 404</p>

          <div className="min-w-0 border-l-2 border-primary pl-8">
            <h1 className="max-w-[16ch] font-serif text-4xl font-semibold sm:text-5xl">
              This page wandered off into the margins.
            </h1>
            <p className="mt-6 max-w-measure font-sans text-lg leading-relaxed text-muted-foreground">
              Nothing lives at this address. It may have been moved, unpublished, or the
              link may simply have a typo in it.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild className="group gap-2">
                <Link to="/">
                  Back home
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 ease-editorial group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/explore">Explore stories</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
