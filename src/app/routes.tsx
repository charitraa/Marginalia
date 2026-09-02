import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/components/common/ProtectedRoute";
import RoleRoute from "@/components/common/RoleRoute";
import RouteFallback from "@/components/common/RouteFallback";

// The landing page ships in the main bundle; every other route is split out so
// a first visit downloads only what it renders.
import Home from "@/pages/Home";

const Explore = lazy(() => import("@/pages/Explore"));
const Trending = lazy(() => import("@/pages/Trending"));
const Search = lazy(() => import("@/pages/Search"));
const AuthorProfile = lazy(() => import("@/pages/AuthorProfile"));
const NewsletterAction = lazy(() => import("@/pages/NewsletterAction"));

const Feed = lazy(() => import("@/pages/Feed"));
const SeriesList = lazy(() => import("@/pages/series/SeriesList"));
const SeriesDetail = lazy(() => import("@/pages/series/SeriesDetail"));
const ManageSeries = lazy(() => import("@/pages/series/ManageSeries"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const Post = lazy(() => import("@/pages/posts/Post"));
const Write = lazy(() => import("@/pages/posts/Write"));
const EditPost = lazy(() => import("@/pages/posts/EditPost"));

const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const VerifyEmail = lazy(() => import("@/pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const OAuthCallback = lazy(() => import("@/pages/auth/OAuthCallback"));

const Dashboard = lazy(() => import("@/pages/account/Dashboard"));
const UserSettings = lazy(() => import("@/pages/account/UserSettings"));
const Bookmarks = lazy(() => import("@/pages/account/Bookmarks"));
const Notifications = lazy(() => import("@/pages/account/Notifications"));
const ReadingHistory = lazy(() => import("@/pages/account/ReadingHistory"));
const Trash = lazy(() => import("@/pages/account/Trash"));
const Analytics = lazy(() => import("@/pages/account/Analytics"));

const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminModeration = lazy(() => import("@/pages/admin/AdminModeration"));
const AdminNewsletter = lazy(() => import("@/pages/admin/AdminNewsletter"));
const ReviewQueue = lazy(() => import("@/pages/admin/ReviewQueue"));

const About = lazy(() => import("@/pages/legal/About"));
const Contact = lazy(() => import("@/pages/legal/Contact"));
const Privacy = lazy(() => import("@/pages/legal/Privacy"));
const Terms = lazy(() => import("@/pages/legal/Terms"));
const Cookies = lazy(() => import("@/pages/legal/Cookies"));

/** Wraps a route element in the signed-in guard, which sends guests to /login
 *  and returns them here afterwards. */
const guarded = (element: JSX.Element) => <ProtectedRoute>{element}</ProtectedRoute>;

/** Wraps a route in a capability guard. A signed-in user without the
 *  capability gets the 404 page, so staff areas are not advertised. */
const staffOnly = (
  element: JSX.Element,
  capability: "canModerate" | "canManageUsers" | "canEditOthers",
) => <RoleRoute require={capability}>{element}</RoleRoute>;

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public reading */}
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/trending" element={<Trending />} />
        <Route path="/search" element={<Search />} />
        <Route path="/post/:slug" element={<Post />} />
        <Route path="/author/:username" element={<AuthorProfile />} />
        <Route path="/series" element={<SeriesList />} />
        <Route path="/series/:slug" element={<SeriesDetail />} />

        {/* Accounts */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Where GitHub and Google send the browser back to. */}
        <Route path="/auth/callback/:provider" element={<OAuthCallback />} />

        {/* Both halves of the newsletter double opt-in. The token in the URL is
            the whole authorisation, so no account is needed. */}
        <Route path="/newsletter/confirm" element={<NewsletterAction action="confirm" />} />
        <Route path="/newsletter/unsubscribe" element={<NewsletterAction action="unsubscribe" />} />

        {/* Signed-in only */}
        <Route path="/write" element={guarded(<Write />)} />
        <Route path="/post/:slug/edit" element={guarded(<EditPost />)} />
        <Route path="/dashboard" element={guarded(<Dashboard />)} />
        <Route path="/settings" element={guarded(<UserSettings />)} />
        <Route path="/bookmarks" element={guarded(<Bookmarks />)} />
        <Route path="/notifications" element={guarded(<Notifications />)} />
        <Route path="/history" element={guarded(<ReadingHistory />)} />
        <Route path="/trash" element={guarded(<Trash />)} />
        <Route path="/feed" element={guarded(<Feed />)} />
        <Route path="/analytics" element={guarded(<Analytics />)} />
        <Route path="/series/:slug/manage" element={guarded(<ManageSeries />)} />

        {/* Staff. Moderators see the dashboard and the queue; only admins
            reach user management. */}
        <Route path="/admin" element={staffOnly(<AdminDashboard />, "canModerate")} />
        <Route path="/admin/moderation" element={staffOnly(<AdminModeration />, "canModerate")} />
        <Route path="/admin/users" element={staffOnly(<AdminUsers />, "canManageUsers")} />
        <Route path="/admin/newsletter" element={staffOnly(<AdminNewsletter />, "canManageUsers")} />
        <Route path="/admin/review" element={staffOnly(<ReviewQueue />, "canEditOthers")} />

        {/* Static */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
