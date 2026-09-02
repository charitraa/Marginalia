/** The AI assistant. Every call is triggered by the author; nothing runs on its own. */

export interface AIStatus {
  enabled: boolean;
  provider: string;
  features: string[];
}

export type RewriteTone = "clearer" | "shorter" | "friendlier" | "formal";

export interface SeoSuggestion {
  seoTitle: string;
  seoDescription: string;
  tags: string[];
}

export interface OutlineSection {
  heading: string;
  points: string[];
}
