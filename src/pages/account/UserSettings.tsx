import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import Seo from "@/components/common/Seo";
import UserAvatar from "@/features/users/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/features/auth/hooks/useAuth";
import * as userService from "@/features/users/api/userService";
import { errorMessage, fieldErrors } from "@/lib/errors";
import { cn } from "@/lib/utils";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const MAX_BIO = 280;

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "account", label: "Account" },
  { id: "security", label: "Security" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card p-6">
      <h2 className="text-xl">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm text-destructive">{message}</p>;
}

export default function UserSettings() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    username: "",
    headline: "",
    bio: "",
    city: "",
    district: "",
    website: "",
    twitter: "",
    github: "",
    linkedin: "",
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [savingPassword, setSavingPassword] = useState(false);

  // Populate once the current user resolves.
  useEffect(() => {
    if (!user) return;
    setProfile({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      headline: user.headline,
      bio: user.bio,
      city: user.city,
      district: user.district,
      website: user.website,
      twitter: user.twitter,
      github: user.github,
      linkedin: user.linkedin,
    });
    setEmail(user.email);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key: keyof typeof profile) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setProfile((current) => ({ ...current, [key]: event.target.value }));

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileErrors({});
    setSavingProfile(true);
    try {
      const updated = await userService.updateProfile(profile);
      setUser(updated);
      toast.success("Profile updated.");
    } catch (error) {
      setProfileErrors(fieldErrors(error));
      toast.error(errorMessage(error, "We couldn't update your profile."));
    } finally {
      setSavingProfile(false);
    }
  };

  const uploadAvatar = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Images must be smaller than 5MB.");
      return;
    }

    setUploading(true);
    try {
      const updated = await userService.updateAvatar(file);
      setUser(updated);
      toast.success("Profile picture updated.");
    } catch (error) {
      toast.error(errorMessage(error, "We couldn't upload that image."));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const saveEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingEmail(true);
    try {
      const result = await userService.changeEmail(email.trim());
      toast.info(result.message);
      // Changing an address returns the account to unverified.
      navigate("/verify", { state: { email: result.email } });
    } catch (error) {
      toast.error(errorMessage(error, "We couldn't change your email."));
    } finally {
      setSavingEmail(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordErrors({});

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordErrors({ new_password_confirm: "New passwords do not match." });
      return;
    }

    setSavingPassword(true);
    try {
      await userService.changePassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated.");
    } catch (error) {
      setPasswordErrors(fieldErrors(error));
      toast.error(errorMessage(error, "We couldn't update your password."));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <Layout>
      <Seo title="Settings" canonicalPath="/settings" noIndex />

      <div className="container-page max-w-3xl py-12 sm:py-16">
        <header>
          <h1 className="text-4xl">Settings</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Manage how you appear across {""}
            <span className="whitespace-nowrap">Marginalia</span>.
          </p>
        </header>

        <div className="mt-8 border-b border-border">
          <div className="flex gap-6" role="tablist">
            {TABS.map((entry) => (
              <button
                key={entry.id}
                role="tab"
                aria-selected={tab === entry.id}
                onClick={() => setTab(entry.id)}
                className={cn(
                  "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
                  tab === entry.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {tab === "profile" && (
            <>
              <Section
                title="Profile picture"
                description="A square image works best. Up to 5MB."
              >
                <div className="flex items-center gap-5">
                  <UserAvatar user={user ?? undefined} size="xl" />
                  <div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="sr-only"
                      id="avatar"
                      onChange={(event) => uploadAvatar(event.target.files?.[0])}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" aria-hidden="true" />
                          Change picture
                        </>
                      )}
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">
                      JPG, PNG, WebP or GIF.
                    </p>
                  </div>
                </div>
              </Section>

              <form onSubmit={saveProfile}>
                <Section title="About you" description="This is what readers see on your profile.">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={set("firstName")}
                        className="mt-2"
                      />
                      <FieldError message={profileErrors.first_name} />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={set("lastName")}
                        className="mt-2"
                      />
                      <FieldError message={profileErrors.last_name} />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={set("username")}
                      className="mt-2"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Your profile lives at /author/{profile.username || "username"}
                    </p>
                    <FieldError message={profileErrors.username} />
                  </div>

                  <div>
                    <Label htmlFor="headline">Headline</Label>
                    <Input
                      id="headline"
                      placeholder="Full-stack developer & writer"
                      value={profile.headline}
                      onChange={set("headline")}
                      className="mt-2"
                    />
                    <FieldError message={profileErrors.headline} />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={3}
                      maxLength={MAX_BIO}
                      placeholder="A sentence or two about what you write."
                      value={profile.bio}
                      onChange={set("bio")}
                      className="mt-2 resize-none"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {profile.bio.length}/{MAX_BIO}
                    </p>
                    <FieldError message={profileErrors.bio} />
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={profile.city} onChange={set("city")} className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        value={profile.district}
                        onChange={set("district")}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </Section>

                <Section title="Links" description="Shown on your public profile.">
                  <div className="grid gap-5 sm:grid-cols-2">
                    {(["website", "twitter", "github", "linkedin"] as const).map((key) => (
                      <div key={key}>
                        <Label htmlFor={key} className="capitalize">
                          {key}
                        </Label>
                        <Input
                          id={key}
                          type="url"
                          inputMode="url"
                          placeholder={`https://…`}
                          value={profile[key]}
                          onChange={set(key)}
                          className="mt-2"
                        />
                        <FieldError message={profileErrors[key]} />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={savingProfile} className="gap-2">
                      {savingProfile && (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      )}
                      Save changes
                    </Button>
                  </div>
                </Section>
              </form>
            </>
          )}

          {tab === "account" && (
            <form onSubmit={saveEmail}>
              <Section
                title="Email address"
                description="Changing this sends a verification code to the new address."
              >
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2"
                  />
                  {user && !user.isVerified && (
                    <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                      This address is not verified yet.
                    </p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={savingEmail || !email.trim() || email.trim() === user?.email}
                    className="gap-2"
                  >
                    {savingEmail && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                    Update email
                  </Button>
                </div>
              </Section>
            </form>
          )}

          {tab === "security" && (
            <>
              <form onSubmit={savePassword}>
                <Section title="Password" description="Use at least 8 characters.">
                  <div>
                    <Label htmlFor="currentPassword">Current password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      autoComplete="current-password"
                      value={passwords.currentPassword}
                      onChange={(event) =>
                        setPasswords((c) => ({ ...c, currentPassword: event.target.value }))
                      }
                      className="mt-2"
                    />
                    <FieldError message={passwordErrors.current_password} />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.newPassword}
                      onChange={(event) =>
                        setPasswords((c) => ({ ...c, newPassword: event.target.value }))
                      }
                      className="mt-2"
                    />
                    <FieldError message={passwordErrors.new_password} />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={passwords.confirmPassword}
                      onChange={(event) =>
                        setPasswords((c) => ({ ...c, confirmPassword: event.target.value }))
                      }
                      className="mt-2"
                    />
                    <FieldError message={passwordErrors.new_password_confirm} />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={
                        savingPassword ||
                        !passwords.currentPassword ||
                        !passwords.newPassword ||
                        !passwords.confirmPassword
                      }
                      className="gap-2"
                    >
                      {savingPassword && (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      )}
                      Update password
                    </Button>
                  </div>
                </Section>
              </form>

              <Section title="Sign out" description="End this session on this device.">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      await logout();
                      toast.success("Logged out successfully.");
                      navigate("/");
                    }}
                  >
                    Sign out
                  </Button>
                </div>
              </Section>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
