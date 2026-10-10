export const STORAGE_KEY = "pct24x7:order-estimate:v2"
export const STORAGE_VERSION = 2
export const MAX_QUANTITY = 9_999
export const MAX_LINE_ITEMS = 500
/** $100,000. With the limits above, totals stay far below Number.MAX_SAFE_INTEGER. */
export const MAX_UNIT_PRICE_CENTS = 10_000_000
export const MAX_TEXT_LENGTH = 512
