import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { MessageSquare, ImageIcon, BarChart3, Rss, History, Shield, ChevronDown,
  Bookmark, LayoutDashboard, LogOut, Menu, PenLine, Search, Settings, User as UserIcon, X,
} from "lucide-react";
import { toast } from "sonner";
import ThemeToggle from "@/components/common/ThemeToggle";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import UserAvatar from "@/features/users/components/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCategories } from "@/features/posts/hooks/usePosts";
import { authorPath, categoryPath } from "@/lib/routes";
import Logo from "@/components/common/Logo";
import { SITE_NAME } from "@/config/constants";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/explore", label: "Explore" },
  { to: "/trending", label: "Trending" },
  { to: "/series", label: "Series" },
];

/** Categories come from the API, so the menu only lists topics that exist. */
function CategoryMenu() {
  const [open, setOpen] = useState(false);
  // Deferred: readers who never open this never pay for the request.
  const { data: categories } = useCategories(open);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        className={cn(
          "group inline-flex items-center gap-1 text-sm transition-colors duration-200",
          open ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        Categories
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform duration-200 ease-editorial", open && "rotate-180")}
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-64 p-1.5">
        {categories?.length ? (
          categories.map((category) => (
            <DropdownMenuItem asChild key={category.id}>
              <Link to={categoryPath(category.slug)} className="flex items-baseline justify-between gap-4">
                <span className="font-serif text-base">{category.name}</span>
                {category.count != null && (
                  <span className="font-sans text-xs tabular-nums text-muted-foreground">{category.count}</span>
                )}
              </Link>
            </DropdownMenuItem>
          ))
        ) : (
          <p className="px-2 py-3 text-sm text-muted-foreground">Loading topics…</p>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/explore" className="text-sm text-muted-foreground">
            Browse everything
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Navigating away should always close the mobile sheet.
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);

  // An open mobile menu locks the page behind it.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /**
   * The header sits flush with the page until the reader moves, then draws its
   * rule and tightens. The threshold is past the first line of most heroes, so
   * it does not flicker on tiny scrolls.
   */
  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    const { serverCleared } = await logout();
    toast.success("Logged out successfully.");
    if (!serverCleared) {
      // The cookie is httpOnly, so only the API can truly revoke it.
      toast("Sign-out completed on this device.", {
        description: "Close your browser to end the session everywhere.",
      });
    }
    navigate("/");
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative text-sm transition-colors duration-200",
      isActive
        ? "text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:bg-primary"
        : "text-muted-foreground hover:text-foreground",
    );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300 ease-editorial",
        condensed
          ? "border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70"
          : "border-b border-transparent bg-background",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <div
        className={cn(
          "container-page grid grid-cols-[auto_1fr_auto] items-center gap-4 transition-[height] duration-300 ease-editorial",
          condensed ? "h-header-sm" : "h-header",
        )}
      >
        <Link
          to="/"
          className="shrink-0 text-[1.0625rem] tracking-tight"
          aria-label={`${SITE_NAME} home`}
        >
          <Logo />
        </Link>

        {/* Centre column: the publication's own sections. */}
        <nav aria-label="Main" className="hidden items-center justify-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
          <CategoryMenu />
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
        </nav>
        <div className="md:hidden" />

        <div className="flex items-center justify-end gap-0.5 sm:gap-1">
          <Button variant="ghost" size="icon" asChild aria-label="Search stories">
            <Link to="/search">
              <Search className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
            </Link>
          </Button>

          <ThemeToggle />

          {isAuthenticated && user ? (
            <>
              <Button variant="ghost" size="icon" asChild aria-label="Your feed" className="hidden sm:inline-flex">
                <Link to="/feed">
                  <Rss className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
                </Link>
              </Button>

              <NotificationBell />

              <Button asChild size="sm" className="ml-1.5 hidden gap-1.5 sm:inline-flex">
                <Link to="/write">
                  <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                  Write
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-1.5 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    aria-label="Account menu"
                  >
                    <UserAvatar user={user} size="sm" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <p className="truncate text-sm font-medium">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={authorPath(user)} className="gap-2">
                      <UserIcon className="h-4 w-4" aria-hidden="true" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="gap-2">
                      <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/bookmarks" className="gap-2">
                      <Bookmark className="h-4 w-4" aria-hidden="true" />
                      Reading list
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/history" className="gap-2">
                      <History className="h-4 w-4" aria-hidden="true" />
                      Reading history
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/analytics" className="gap-2">
                      <BarChart3 className="h-4 w-4" aria-hidden="true" />
                      Analytics
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/media" className="gap-2">
                      <ImageIcon className="h-4 w-4" aria-hidden="true" />
                      Media library
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-comments" className="gap-2">
                      <MessageSquare className="h-4 w-4" aria-hidden="true" />
                      Your comments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="sm:hidden">
                    <Link to="/write" className="gap-2">
                      <PenLine className="h-4 w-4" aria-hidden="true" />
                      Write a story
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="gap-2">
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  {/* Only staff see this entry at all, which keeps the admin
                      area out of an ordinary reader's menu. */}
                  {user.canModerate && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="gap-2">
                          <Shield className="h-4 w-4" aria-hidden="true" />
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout} className="gap-2">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="ml-2 hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Sign in
              </Link>
              <Button asChild size="sm">
                <Link to="/register">Get started</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav"
          className="animate-slide-down border-t border-border bg-background md:hidden"
        >
          <nav aria-label="Mobile" className="container-page flex flex-col py-2">
            {[...NAV_LINKS, { to: "/about", label: "About", end: false }].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "border-b border-border/70 py-3.5 font-serif text-lg transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/search"
              className="border-b border-border/70 py-3.5 font-serif text-lg text-muted-foreground transition-colors"
            >
              Search
            </NavLink>

            {!isAuthenticated && (
              <div className="mt-5 flex gap-3 pb-2">
                <Button variant="outline" asChild className="flex-1">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link to="/register">Get started</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
