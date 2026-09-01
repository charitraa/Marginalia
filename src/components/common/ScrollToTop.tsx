import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** A new route should start at the top, the way a page load would. */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}
