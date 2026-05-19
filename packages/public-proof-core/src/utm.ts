export type UtmParams = {
  source: string;
  medium: string;
  campaign: string;
};

export const buildUtmQuery = ({ source, medium, campaign }: UtmParams): string => {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
  });
  return `?${params.toString()}`;
};

export const buildUtmUrl = (baseUrl: string, params: UtmParams): string => {
  const separator = baseUrl.includes("?") ? "&" : "?";
  const query = buildUtmQuery(params).slice(1);
  return `${baseUrl}${separator}${query}`;
};

export const buildPlatformUtmLinks = (
  canonicalUrl: string,
  campaign: string,
  platforms: string[],
  medium = "social",
): Record<string, string> => {
  const links: Record<string, string> = {};
  for (const platform of platforms) {
    links[platform] = buildUtmUrl(canonicalUrl, {
      source: platform,
      medium,
      campaign,
    });
  }
  return links;
};
