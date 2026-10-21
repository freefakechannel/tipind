export interface RichTip {
  /** Bold first line. */
  title?: string
  /** Short bullet points. */
  points?: readonly string[]
  /** Muted closing line. */
  note?: string
}

export type TipContent = string | RichTip
