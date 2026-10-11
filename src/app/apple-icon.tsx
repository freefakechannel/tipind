import { ImageResponse } from "next/og"

import { PILL_PATHS } from "@/lib/brand-image"

export const alt = "tipind pill logo"
export const size = { width: 180, height: 180 }
export const contentType = "image/png"
export const dynamic = "force-static"

/** Generated apple-touch-icon: the same pill glyph as the site logo. */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(145deg, #2a80ec, #1648a3)",
        display: "flex",
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <svg height={108} viewBox="0 0 24 24" width={108}>
        <path
          d={PILL_PATHS.body}
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.2}
        />
        <path
          d={PILL_PATHS.seam}
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.2}
        />
      </svg>
    </div>,
    size
  )
}
