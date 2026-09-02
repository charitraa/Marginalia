import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/posts/types";

interface CategoryBadgeProps {
  category: Category;
  className?: string;
  asLink?: boolean;
}

/**
 * The one place category labels are styled.
 *
 * Set as a small caps label in the accent rather than a filled chip: on a page
 * built from hairlines and type, a pill would be the loudest thing on screen and
 * would say nothing extra.
 */
export default function CategoryBadge({ category, className, asLink = true }: CategoryBadgeProps) {
  const classes = cn(
    "inline-block font-sans text-2xs font-medium uppercase tracking-[0.14em] text-primary transition-opacity duration-200",
    asLink && "hover:opacity-70",
    className,
  );

  if (!asLink) return <span className={classes}>{category.name}</span>;

  return (
    <Link to={`/explore?category=${encodeURIComponent(category.slug)}`} className={classes}>
      {category.name}
    </Link>
  );
}
