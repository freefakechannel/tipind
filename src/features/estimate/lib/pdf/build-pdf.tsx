import { siteConfig } from "@/config/site"

import type { EstimateLineItem } from "../../types"
import type { PdfPalette } from "./estimate-document"

const HEX = /^#[0-9a-f]{3,8}$/i

/** Reads the brand colors from CSS, so re-branding in main.css updates the PDF. */
function readPalette(): PdfPalette {
  const css = getComputedStyle(document.documentElement)
  const color = (name: string, fallback: string) => {
    const value = css.getPropertyValue(name).trim()
    return HEX.test(value) ? value : fallback
  }

  return {
    brand50: color("--color-primary-50", "#eff6ff"),
    brand100: color("--color-primary-100", "#dbeafe"),
    brand600: color("--color-primary-600", "#2563eb"),
    brand700: color("--color-primary-700", "#1d4ed8"),
    brand900: color("--color-primary-900", "#1e3a8a"),
    line: color("--color-neutral-200", "#e2e8f0"),
    surface: color("--color-neutral-50", "#f8fafc"),
    text500: color("--color-neutral-500", "#64748b"),
    text600: color("--color-neutral-600", "#475569"),
    text900: color("--color-neutral-900", "#0f172a"),
  }
}

const two = (value: number) => value.toString().padStart(2, "0")

export async function buildEstimatePdf(items: readonly EstimateLineItem[]) {
  // Loaded on demand: the PDF engine never touches the initial bundle.
  const [{ pdf }, { createEstimateDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./estimate-document"),
  ])

  const now = new Date()
  const day = `${now.getFullYear().toString()}${two(now.getMonth() + 1)}${two(now.getDate())}`
  const slug = siteConfig.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

  const blob = await pdf(
    createEstimateDocument({
      generatedAt: now,
      items,
      palette: readPalette(),
      reference: `${siteConfig.name.slice(0, 3).toUpperCase()}-${day}-${two(now.getHours())}${two(now.getMinutes())}`,
    })
  ).toBlob()

  return { blob, fileName: `${slug}-estimate-${day}.pdf` }
}
