import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/posts/types";

interface CategoryBadgeProps {
  category: Category;
  className?: string;
  asLink?: boolean;
}

/** The one place category chips are styled. */
export default function CategoryBadge({ category, className, asLink = true }: CategoryBadgeProps) {
  const classes = cn(
    "inline-flex items-center rounded-full border border-border bg-muted/70 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors",
    asLink && "hover:border-primary/40 hover:text-foreground",
    className,
  );

  if (!asLink) return <span className={classes}>{category.name}</span>;

  return (
    <Link to={`/explore?category=${encodeURIComponent(category.slug)}`} className={classes}>
      {category.name}
    </Link>
  );
}
