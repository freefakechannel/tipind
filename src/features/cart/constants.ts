/** Bumped to v3 because prices changed from cents to mills. */
export const STORAGE_KEY = "tipind:order-cart:v3"
export const STORAGE_VERSION = 3
export const MAX_QUANTITY = 9_999
export const MAX_LINE_ITEMS = 500
/** $100,000 in mills. Totals stay far below Number.MAX_SAFE_INTEGER. */
export const MAX_UNIT_PRICE_MILLS = 100_000_000
/** Longer text is clipped, never rejected. */
export const MAX_TEXT_LENGTH = 1_000
export const SIDEBAR_ID = "cart-sidebar"
export const DEFAULT_WIDTH = 420
export const MIN_WIDTH = 320
/** The sidebar can never be wider than this share of the screen. */
export const MAX_VIEWPORT_FRACTION = 1 / 3
export const WIDTH_STORAGE_KEY = "tipind:cart-width"
