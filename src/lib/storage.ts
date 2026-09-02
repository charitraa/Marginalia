const LEGACY_PREFIX = "mindful.";
const PREFIX = "marginalia.";

/**
 * One-time rename of the pre-rebrand localStorage namespace.
 *
 * Everything this app persists is prefixed with the brand — the session flag,
 * the theme choice, the pending verification email and any unsaved post drafts.
 * Renaming the brand without this would sign readers out, reset their theme and
 * silently discard writing they had not published yet.
 *
 * Runs before the first render so nothing reads a key mid-migration.
 */
export function migrateLegacyStorage() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith(LEGACY_PREFIX)) continue;

      const renamed = PREFIX + key.slice(LEGACY_PREFIX.length);
      const value = localStorage.getItem(key);
      // Never clobber a value already written under the new name.
      if (value !== null && localStorage.getItem(renamed) === null) {
        localStorage.setItem(renamed, value);
      }
      localStorage.removeItem(key);
    }
  } catch {
    // Private mode, a full quota, or storage blocked entirely. The app works
    // without the carried-over state, so a failed migration is not fatal.
  }
}
