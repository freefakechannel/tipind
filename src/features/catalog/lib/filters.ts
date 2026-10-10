import type { CatalogProduct, FacetSelection, PriceRange } from "../types"

export interface ProductFilters {
  manufacturer: FacetSelection
  packaging: FacetSelection
  priceRange: PriceRange | null
}

interface CompiledFacet {
  include: ReadonlySet<string>
  exclude: ReadonlySet<string>
}

function compile(selection: FacetSelection): CompiledFacet {
  const include = new Set<string>()
  const exclude = new Set<string>()
  for (const [value, mode] of selection) {
    if (mode === "include") include.add(value)
    else exclude.add(value)
  }
  return { include, exclude }
}

const allows = (facet: CompiledFacet, value: string) =>
  !facet.exclude.has(value) &&
  (facet.include.size === 0 || facet.include.has(value))

export function filterProducts(
  products: readonly CatalogProduct[],
  filters: ProductFilters
): readonly CatalogProduct[] {
  const manufacturer = compile(filters.manufacturer)
  const packaging = compile(filters.packaging)
  const range = filters.priceRange

  const isUnfiltered =
    range === null &&
    filters.manufacturer.size === 0 &&
    filters.packaging.size === 0
  if (isUnfiltered) return products

  return products.filter((product) => {
    if (range) {
      const price = product.priceCents
      if (price === null || price < range[0] || price > range[1]) return false
    }
    return (
      allows(manufacturer, product.manufacturer) &&
      allows(packaging, product.packaging)
    )
  })
}
