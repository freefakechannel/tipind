#!/usr/bin/env node
/**
 * Builds the catalog artifact from the source JSON.
 *
 *   node scripts/build-catalog.mjs -i public/data/source.json --clean --write-env
 *
 * Output: <output>/catalog.<hash>.dat = MAGIC + XOR(gzip(JSON))
 * JSON:   { format: 3, priceBounds: [minCents, maxCents], manufacturers: string[],
 *           packaging: string[],
 *           products: [name, ingredient, manufacturerIdx, packagingIdx, priceCents][] }
 * Missing index/price is -1. Keep these constants in sync with
 * src/features/catalog/constants.ts.
 */
import { createHash } from "node:crypto"
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"
import { gzipSync } from "node:zlib"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const KEY_NAME = "NEXT_PUBLIC_CATALOG_XOR_KEY"
const URL_NAME = "NEXT_PUBLIC_CATALOG_DATA_URL"
const FORMAT = 3
const MAGIC = Buffer.from("PCTCAT3:", "ascii")
const NONE = -1
const MAX_UNIT_PRICE_CENTS = 10_000_000

const ALIASES = {
  name: [
    "product name",
    "product",
    "brand name",
    "brand",
    "medicine name",
    "drug name",
    "name",
  ],
  ingredient: [
    "active ingredient",
    "active ingredients",
    "ingredient",
    "content",
    "composition",
    "generic name",
    "salt",
  ],
  manufacturer: [
    "manufacturer",
    "manufacturer name",
    "maker",
    "mfr",
    "company",
  ],
  packaging: ["packaging", "pack size", "packsize", "package", "pack"],
  price: [
    "rate (usd)",
    "rate usd",
    "rate",
    "price in usd",
    "usd price",
    "price",
  ],
}

const key = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]/gu, "")

const compare = (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })

function text(value) {
  if (typeof value !== "string" && typeof value !== "number") return ""
  return String(value).normalize("NFC").replace(/\s+/g, " ").trim()
}

/** "$2.831" -> 283 (rounded half up, exact decimal arithmetic). */
function parseCents(value) {
  const cleaned = text(value)
    .replace(/^\$\s*/, "")
    .replace(/,/g, "")
  const match = /^(\d{1,9})(?:\.(\d+))?$/.exec(cleaned)
  if (!match) return NONE
  const fraction = (match[2] ?? "").padEnd(3, "0")
  let cents = Number(match[1]) * 100 + Number(fraction.slice(0, 2))
  if (Number(fraction[2]) >= 5) cents += 1
  return cents <= MAX_UNIT_PRICE_CENTS ? cents : NONE
}

function rowsFrom(json) {
  if (Array.isArray(json)) return json
  if (json && typeof json === "object") {
    for (const name of ["products", "data", "rows", "items"]) {
      if (Array.isArray(json[name])) return json[name]
    }
  }
  throw new Error(
    "The JSON must be an array of product objects (or { products: [...] })."
  )
}

function readRow(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) return null
  const fields = new Map(
    Object.entries(row).map(([name, value]) => [key(name), value])
  )
  const pick = (aliases) =>
    text(
      aliases
        .map((alias) => fields.get(key(alias)))
        .find((v) => v !== undefined)
    )

  const name = pick(ALIASES.name)
  if (!name) return null
  return {
    name,
    ingredient: pick(ALIASES.ingredient),
    manufacturer: pick(ALIASES.manufacturer),
    packaging: pick(ALIASES.packaging),
    cents: parseCents(pick(ALIASES.price)),
  }
}

function dictionary(values) {
  const canonical = new Map()
  for (const value of values) {
    if (value && !canonical.has(key(value))) canonical.set(key(value), value)
  }
  const list = [...canonical.values()].sort(compare)
  const indexes = new Map(list.map((value, index) => [key(value), index]))
  return {
    list,
    indexOf: (value) => (value ? (indexes.get(key(value)) ?? NONE) : NONE),
  }
}

function build(json) {
  const source = rowsFrom(json)
  const seen = new Set()
  const rows = []
  let invalid = 0
  let duplicates = 0

  for (const raw of source) {
    const row = readRow(raw)
    if (!row) {
      invalid += 1
      continue
    }
    const identity = [
      row.name,
      row.ingredient,
      row.manufacturer,
      row.packaging,
      row.cents,
    ]
      .map((v) => key(String(v)))
      .join("|")
    if (seen.has(identity)) {
      duplicates += 1
      continue
    }
    seen.add(identity)
    rows.push(row)
  }
  if (rows.length === 0)
    throw new Error("No valid products found (a Product Name is required).")

  rows.sort(
    (a, b) => compare(a.name, b.name) || compare(a.manufacturer, b.manufacturer)
  )

  const manufacturers = dictionary(rows.map((row) => row.manufacturer))
  const packaging = dictionary(rows.map((row) => row.packaging))
  const prices = rows.map((row) => row.cents).filter((cents) => cents !== NONE)
  const min = prices.length > 0 ? Math.min(...prices) : 0
  const max = prices.length > 0 ? Math.max(...prices) : 100_000

  return {
    stats: {
      duplicates,
      invalid,
      noPrice: rows.length - prices.length,
      source: source.length,
    },
    artifact: {
      format: FORMAT,
      priceBounds: [min, max > min ? max : min + 1],
      manufacturers: manufacturers.list,
      packaging: packaging.list,
      products: rows.map((row) => [
        row.name,
        row.ingredient,
        manufacturers.indexOf(row.manufacturer),
        packaging.indexOf(row.packaging),
        row.cents,
      ]),
    },
  }
}

const encode = (artifact, keyBytes) => {
  const gzipped = gzipSync(Buffer.from(JSON.stringify(artifact), "utf8"), {
    level: 9,
  })
  const masked = gzipped.map(
    (byte, index) => byte ^ keyBytes[index % keyBytes.length]
  )
  return Buffer.concat([MAGIC, masked])
}

async function updateEnv(file, name, value) {
  let content = ""
  try {
    content = await readFile(file, "utf8")
  } catch {
    // New file.
  }
  const line = `${name}=${value}`
  const pattern = new RegExp(`^${name}=.*$`, "m")
  const next = pattern.test(content)
    ? content.replace(pattern, line)
    : `${content}${content && !content.endsWith("\n") ? "\n" : ""}${line}\n`
  await writeFile(file, next)
}

async function main() {
  const { values } = parseArgs({
    options: {
      clean: { type: "boolean" },
      help: { short: "h", type: "boolean" },
      input: { short: "i", type: "string" },
      output: { default: "public/data", short: "o", type: "string" },
      "write-env": { type: "boolean" },
    },
  })

  if (values.help || !values.input) {
    console.log(
      "Usage: node scripts/build-catalog.mjs -i <source.json> [-o public/data] [--clean] [--write-env]"
    )
    return
  }

  try {
    process.loadEnvFile(path.join(ROOT, ".env"))
  } catch {
    // .env is optional if the variable is already set.
  }
  const xorKey = process.env[KEY_NAME]?.trim()
  if (!xorKey)
    throw new Error(
      `Missing ${KEY_NAME} (set it in .env). Note: it ships in the browser bundle, so it only obfuscates.`
    )

  const input = path.resolve(ROOT, values.input)
  const outputDir = path.resolve(ROOT, values.output)
  const json = JSON.parse(
    (await readFile(input, "utf8")).replace(/^\uFEFF/, "")
  )

  const { artifact, stats } = build(json)
  const payload = encode(artifact, Buffer.from(xorKey, "utf8"))
  const hash = createHash("sha256").update(payload).digest("hex").slice(0, 8)
  const fileName = `catalog.${hash}.dat`

  await mkdir(outputDir, { recursive: true })
  await writeFile(path.join(outputDir, fileName), payload)

  if (values.clean) {
    const stale = (await readdir(outputDir)).filter(
      (name) =>
        /^(catalog|manufacturers|packaging)\.[\w-]+\.dat$/.test(name) &&
        name !== fileName
    )
    await Promise.all(stale.map((name) => unlink(path.join(outputDir, name))))
    if (stale.length > 0)
      console.log(`Removed ${stale.length.toString()} stale file(s).`)
  }

  const dataUrl = `/${path.relative(path.join(ROOT, "public"), path.join(outputDir, fileName)).split(path.sep).join("/")}`
  if (values["write-env"]) {
    await updateEnv(path.join(ROOT, ".env.production"), URL_NAME, dataUrl)
    console.log(`Updated .env.production`)
  }

  console.log(`Wrote ${fileName} (${payload.length.toLocaleString()} bytes)`)
  console.log(
    `Products: ${artifact.products.length.toLocaleString()} of ${stats.source.toLocaleString()} rows`
  )
  console.log(
    `Skipped: ${stats.invalid.toLocaleString()} invalid, ${stats.duplicates.toLocaleString()} duplicates`
  )
  console.log(
    `Without a usable price: ${stats.noPrice.toLocaleString()} (shown, but can't be added to an estimate)`
  )
  console.log(
    `Manufacturers: ${artifact.manufacturers.length.toLocaleString()}, packaging options: ${artifact.packaging.length.toLocaleString()}`
  )
  console.log(
    `Price range: ${(artifact.priceBounds[0] / 100).toFixed(2)}–${(artifact.priceBounds[1] / 100).toFixed(2)} USD`
  )
  if (!values["write-env"]) console.log(`Set ${URL_NAME}=${dataUrl}`)
}

main().catch((error) => {
  console.error(
    `Catalog build failed: ${error instanceof Error ? error.message : String(error)}`
  )
  process.exitCode = 1
})
