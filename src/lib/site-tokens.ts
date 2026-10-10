import { siteConfig } from "@/config/site"

/** Replaces `{name}` and `{founded}` placeholders in content strings. */
export function replaceSiteTokens(value: string) {
  return value
    .replaceAll("{name}", siteConfig.name)
    .replaceAll("{founded}", siteConfig.founded.toString())
}
