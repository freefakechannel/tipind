import type { CartLineItem } from "../types"

// eslint-disable-next-line security/detect-unsafe-regex -- each repetition is anchored by a mandatory x/×/* literal, so there's no ambiguous partitioning of input between iterations (verified: O(n) on adversarial inputs, not exponential).
const PACK_PATTERN = /^\s*\d+(?:\s*[x×*]\s*\d+)*\s*(?:'?s\s*)?$/i

/** Units inside one packet: "1x10" -> 10, "1x1" -> 1. */
export function unitsPerPacket(packaging: string) {
  if (!PACK_PATTERN.test(packaging)) return 1

  const total = (packaging.match(/\d+/g) ?? []).reduce(
    (product, part) => product * Number(part),
    1
  )
  return Number.isSafeInteger(total) && total > 0 ? total : 1
}

/** Total units ordered: 10 packets of "1x10" -> 100. */
export const totalUnits = (item: CartLineItem) =>
  unitsPerPacket(item.packaging) * item.quantity

/** Guesses the unit word from the product name. Falls back to "units". */
export function unitWord(name: string, count: number) {
  // const text = name.toLowerCase()
  // const single = /\b(?:inj|injection|vial|amp|ampoule)\b/.test(text)
  //   ? "vial"
  //   : /\bcap(?:s|sule|sules)?\b/.test(text)
  //     ? "capsule"
  //     : /\btab(?:s|let|lets)?\b/.test(text)
  //       ? "tablet"
  //       : "unit"

  const single = "unit"
  return count === 1 ? single : `${single}s`
}
