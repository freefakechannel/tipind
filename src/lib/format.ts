const currency = new Intl.NumberFormat("en-US", {
  currency: "USD",
  style: "currency",
})
const integer = new Intl.NumberFormat("en-US")

export function formatCents(cents: number) {
  return currency.format(cents / 100)
}

export function formatNumber(value: number) {
  return integer.format(value)
}

export function pluralize(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural
}

/** Replaces `{key}` placeholders in content strings. */
export function formatMessage(
  template: string,
  values: Readonly<Record<string, string>>
) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, value),
    template
  )
}

/** Lowercases and strips diacritics, for searching and de-duplication. */
export function normalizeText(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
}
