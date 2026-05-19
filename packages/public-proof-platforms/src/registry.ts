import type { ProviderAdapter } from "./provider";
import { linkedinManualProvider } from "./linkedin-manual";
import { substackManualProvider } from "./substack-manual";
import { devtoProvider } from "./devto";
import { blueskyProvider } from "./bluesky";
import { mastodonProvider } from "./mastodon";
import { redditProvider } from "./reddit";

export const allProviders: ProviderAdapter[] = [
  linkedinManualProvider,
  substackManualProvider,
  devtoProvider,
  blueskyProvider,
  mastodonProvider,
  redditProvider,
];

export const getProvider = (name: string): ProviderAdapter => {
  const provider = allProviders.find((p) => p.provider === name);
  if (!provider) throw new Error(`Unknown provider: ${name}`);
  return provider;
};
