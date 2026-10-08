import type { MetadataRoute } from "next"

import { siteConfig } from "@/config/site"
export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    lang: "en",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8fafc", // slate-50, matches --background
    theme_color: "#2563eb", // blue-600, matches --primary
    icons: [
      {
        src: `/icons/${siteConfig.name.toLowerCase().replace(/\s+/g, "-")}-192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `/icons/${siteConfig.name.toLowerCase().replace(/\s+/g, "-")}-512.png`,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: `/icons/${siteConfig.name.toLowerCase().replace(/\s+/g, "-")}-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["health", "shopping"],
    shortcuts: [
      {
        name: "Browse the catalog",
        short_name: "Catalog",
        url: "/#catalog",
        icons: [
          {
            src: `/icons/${siteConfig.name.toLowerCase().replace(/\s+/g, "-")}-192.png`,
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Build an order estimate",
        short_name: "Estimate",
        url: "/estimate/",
        icons: [
          {
            src: `/icons/${siteConfig.name.toLowerCase().replace(/\s+/g, "-")}-192.png`,
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
  }
}
