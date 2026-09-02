/** Sign-in types. */

/** A provider this deployment actually has credentials for. */
export interface SocialProvider {
  name: "github" | "google";
  authorizeUrl: string;
  clientId: string;
  scope: string;
}
