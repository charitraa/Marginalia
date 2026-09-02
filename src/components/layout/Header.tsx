import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
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
import { authorPath } from "@/lib/routes";
import { SITE_NAME } from "@/config/constants";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/explore", label: "Explore" },
  { to: "/trending", label: "Trending" },
];

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Navigating away should always close the mobile sheet.
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);

  // A open mobile menu locks the page behind it.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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
      "text-sm font-medium transition-colors",
      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
    );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <div className="container-page flex h-16 items-center gap-4">
        <Link to="/" className="shrink-0 font-serif text-xl font-bold tracking-tight">
          {SITE_NAME}
        </Link>

        <nav aria-label="Main" className="ml-4 hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navLinkClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" asChild aria-label="Search stories">
            <Link to="/search">
              <Search className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
            </Link>
          </Button>

          <ThemeToggle />

          {isAuthenticated && user ? (
            <>
              <NotificationBell />

              <Button asChild className="hidden gap-2 sm:inline-flex">
                <Link to="/write">
                  <PenLine className="h-4 w-4" aria-hidden="true" />
                  Write
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-1 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout} className="gap-2">
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild>
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
          <nav aria-label="Mobile" className="container-page flex flex-col py-3">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-3 text-base font-medium transition-colors",
                    isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60",
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
            <NavLink
              to="/search"
              className="rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-accent/60"
            >
              Search
            </NavLink>

            {!isAuthenticated && (
              <div className="mt-3 flex gap-3 border-t border-border pt-4">
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
