import {
  Document,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer"

import { siteContent } from "@/config/content"
import { siteConfig } from "@/config/site"
import { formatMessage, formatMills, formatNumber } from "@/lib/format"

import type { EstimateLineItem } from "../../types"
import { lineTotalMills, packetCount, totalMills } from "../line-items"

export interface PdfPalette {
  brand50: string
  brand100: string
  brand600: string
  brand700: string
  brand900: string
  text900: string
  text600: string
  text500: string
  line: string
  surface: string
}

export interface EstimateDocumentInput {
  generatedAt: Date
  items: readonly EstimateLineItem[]
  palette: PdfPalette
  reference: string
}

/** Standard PDF fonts only cover Latin text; anything else becomes "?". */
// Map (not a plain object) so lookups can never hit prototype keys.
const PDF_CHAR_MAP: ReadonlyMap<string, string> = new Map([
  // Corrupted-source marker: drop it instead of printing "?".
  ["\ufffd", ""],
  ["\u03b1", "alpha"],
  ["\u03b2", "beta"],
  ["\u03b3", "gamma"],
  ["\u03bc", "mu"],
  ["\u2264", "<="],
  ["\u2265", ">="],
  ["\u00b1", "+/-"],
  ["\u2212", "-"],
])

const pdfText = (value: string) =>
  value
    .replace(
      /[^\u0020-\u007E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u20AC]/g,
      (char) => PDF_CHAR_MAP.get(char) ?? "?"
    )
    .replace(/ {2,}/g, " ")

// Widths sized for the worst case the estimate limits allow:
// index "500", qty "9,999", unit "$100,000.000", total "$999,900,000.000".
const COLUMN = { index: 20, pack: 60, quantity: 34, unit: 60, total: 80 }
const MARGIN = 40

function createStyles(c: PdfPalette) {
  return StyleSheet.create({
    page: {
      backgroundColor: "#ffffff",
      color: c.text900,
      fontFamily: "Helvetica",
      fontSize: 9,
      paddingBottom: 60,
      paddingHorizontal: MARGIN,
      paddingTop: 46,
    },
    topBand: {
      backgroundColor: c.brand600,
      height: 8,
      left: 0,
      position: "absolute",
      right: 0,
      top: 0,
    },
    brandRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    brandLeft: { alignItems: "center", flexDirection: "row", gap: 10 },
    logoTile: {
      alignItems: "center",
      backgroundColor: c.brand600,
      borderRadius: 9,
      height: 34,
      justifyContent: "center",
      width: 34,
    },
    brandName: {
      color: c.brand900,
      fontFamily: "Helvetica-Bold",
      fontSize: 17,
      letterSpacing: 0.6,
    },
    eyebrow: {
      color: c.brand600,
      fontFamily: "Helvetica-Bold",
      fontSize: 8,
      letterSpacing: 1.6,
      textAlign: "right",
      textTransform: "uppercase",
    },
    docTitle: {
      color: c.text900,
      fontFamily: "Helvetica-Bold",
      fontSize: 20,
      marginTop: 2,
      textAlign: "right",
    },
    contact: { color: c.text500, fontSize: 8, marginTop: 8 },
    metaRow: { flexDirection: "row", gap: 8, marginTop: 18 },
    metaCell: {
      backgroundColor: c.brand50,
      borderRadius: 8,
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    metaLabel: {
      color: c.brand700,
      fontFamily: "Helvetica-Bold",
      fontSize: 7,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    metaValue: {
      color: c.text900,
      fontFamily: "Helvetica-Bold",
      fontSize: 10,
      marginTop: 3,
    },
    tableHead: {
      alignItems: "center",
      backgroundColor: c.brand600,
      borderRadius: 6,
      flexDirection: "row",
      height: 20,
      paddingHorizontal: 8,
    },
    headText: {
      color: "#ffffff",
      fontFamily: "Helvetica-Bold",
      fontSize: 7,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    row: {
      alignItems: "flex-start",
      borderBottomColor: c.line,
      borderBottomWidth: 0.6,
      flexDirection: "row",
      paddingHorizontal: 8,
      paddingVertical: 7,
    },
    rowAlt: { backgroundColor: c.surface },
    cellIndex: { color: c.text500, fontSize: 8, width: COLUMN.index },
    cellProduct: { flex: 1, paddingRight: 8 },
    productName: { fontFamily: "Helvetica-Bold", fontSize: 9 },
    productMeta: {
      color: c.text500,
      fontSize: 7,
      lineHeight: 1.35,
      marginTop: 2,
    },
    productMaker: { color: c.text600, fontSize: 7, marginTop: 2 },
    cellPack: { color: c.text600, fontSize: 8, width: COLUMN.pack },
    cellQuantity: { fontSize: 9, textAlign: "right", width: COLUMN.quantity },
    cellUnit: {
      color: c.text600,
      fontSize: 8.5,
      textAlign: "right",
      width: COLUMN.unit,
    },
    cellTotal: {
      fontFamily: "Helvetica-Bold",
      fontSize: 9,
      textAlign: "right",
      width: COLUMN.total,
    },
    summaryWrap: { alignItems: "flex-end", marginTop: 16 },
    summary: {
      backgroundColor: c.brand50,
      borderColor: c.brand100,
      borderRadius: 10,
      borderWidth: 0.8,
      padding: 14,
      width: 230,
    },
    summaryLine: {
      color: c.text600,
      flexDirection: "row",
      fontSize: 9,
      justifyContent: "space-between",
      marginBottom: 5,
    },
    summaryDivider: {
      backgroundColor: c.brand100,
      height: 0.8,
      marginVertical: 6,
    },
    summaryTotalLabel: {
      color: c.brand700,
      fontFamily: "Helvetica-Bold",
      fontSize: 8,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    summaryTotal: {
      color: c.brand700,
      fontFamily: "Helvetica-Bold",
      fontSize: 19,
      marginTop: 3,
    },
    notes: {
      borderLeftColor: c.brand600,
      borderLeftWidth: 2.5,
      marginTop: 20,
      paddingLeft: 10,
    },
    notesTitle: {
      color: c.text900,
      fontFamily: "Helvetica-Bold",
      fontSize: 8,
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    note: { color: c.text600, fontSize: 8, lineHeight: 1.45, marginTop: 3 },
    footer: {
      alignItems: "center",
      borderTopColor: c.line,
      borderTopWidth: 0.6,
      bottom: 24,
      color: c.text500,
      flexDirection: "row",
      fontSize: 7.5,
      justifyContent: "space-between",
      left: MARGIN,
      paddingTop: 7,
      position: "absolute",
      right: MARGIN,
    },
    repeatHead: { left: MARGIN, position: "absolute", right: MARGIN, top: 16 },
  })
}

type Styles = ReturnType<typeof createStyles>

function columnHeader(copy: typeof siteContent.estimate.pdf, s: Styles) {
  return (
    <View style={s.tableHead}>
      <Text style={[s.headText, { width: COLUMN.index }]}>
        {copy.indexColumn}
      </Text>
      <Text style={[s.headText, { flex: 1 }]}>{copy.productColumn}</Text>
      <Text style={[s.headText, { width: COLUMN.pack }]}>
        {copy.packColumn}
      </Text>
      <Text
        style={[s.headText, { textAlign: "right", width: COLUMN.quantity }]}
      >
        {copy.quantityColumn}
      </Text>
      <Text style={[s.headText, { textAlign: "right", width: COLUMN.unit }]}>
        {copy.unitColumn}
      </Text>
      <Text style={[s.headText, { textAlign: "right", width: COLUMN.total }]}>
        {copy.totalColumn}
      </Text>
    </View>
  )
}

/** Plain function (not a component) so `pdf()` accepts the returned element. */
export function createEstimateDocument({
  generatedAt,
  items,
  palette,
  reference,
}: EstimateDocumentInput) {
  const copy = siteContent.estimate.pdf
  const s = createStyles(palette)
  const date = new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
    generatedAt
  )
  const contactLine = [siteConfig.contact.email, siteConfig.contact.phone]
    .filter(Boolean)
    .join("   ·   ")

  return (
    <Document
      author={siteConfig.name}
      creator={siteConfig.name}
      subject={copy.documentTitle}
      title={`${siteConfig.name} ${copy.documentTitle} ${reference}`}
    >
      <Page size="A4" style={s.page}>
        <View fixed style={s.topBand} />

        {/* Column header repeated on pages 2+; page 1 has it in the flow. */}
        <View
          fixed
          render={({ pageNumber }) =>
            pageNumber > 1 ? columnHeader(copy, s) : null
          }
          style={s.repeatHead}
        />

        <View style={s.brandRow}>
          <View style={s.brandLeft}>
            <View style={s.logoTile}>
              <Svg height={18} viewBox="0 0 24 24" width={18}>
                <Path
                  d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"
                  fill="none"
                  stroke="#ffffff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                />
                <Path
                  d="m8.5 8.5 7 7"
                  fill="none"
                  stroke="#ffffff"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                />
              </Svg>
            </View>
            <Text style={s.brandName}>
              {pdfText(siteConfig.name.toUpperCase())}
            </Text>
          </View>
          <View>
            <Text style={s.eyebrow}>{copy.statusValue}</Text>
            <Text style={s.docTitle}>{copy.documentTitle}</Text>
          </View>
        </View>

        {contactLine ? (
          <Text style={s.contact}>{pdfText(contactLine)}</Text>
        ) : null}

        <View style={s.metaRow}>
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>{copy.referenceLabel}</Text>
            <Text style={s.metaValue}>{reference}</Text>
          </View>
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>{copy.dateLabel}</Text>
            <Text style={s.metaValue}>{date}</Text>
          </View>
          <View style={s.metaCell}>
            <Text style={s.metaLabel}>{copy.statusLabel}</Text>
            <Text style={s.metaValue}>{copy.statusValue}</Text>
          </View>
        </View>

        <View style={{ marginTop: 18 }}>
          {columnHeader(copy, s)}
          {items.map((item, index) => (
            <View
              key={item.id}
              style={index % 2 === 1 ? [s.row, s.rowAlt] : s.row}
              wrap={false}
            >
              <Text style={s.cellIndex}>{index + 1}</Text>
              <View style={s.cellProduct}>
                <Text style={s.productName}>{pdfText(item.name)}</Text>
                {item.ingredient ? (
                  <Text style={s.productMeta}>{pdfText(item.ingredient)}</Text>
                ) : null}
                {item.manufacturer ? (
                  <Text style={s.productMaker}>
                    {pdfText(item.manufacturer)}
                  </Text>
                ) : null}
              </View>
              <Text style={s.cellPack}>{pdfText(item.packaging) || "-"}</Text>
              <Text style={s.cellQuantity}>{formatNumber(item.quantity)}</Text>
              <Text style={s.cellUnit}>{formatMills(item.unitPriceMills)}</Text>
              <Text style={s.cellTotal}>
                {formatMills(lineTotalMills(item))}
              </Text>
            </View>
          ))}
        </View>

        <View style={s.summaryWrap} wrap={false}>
          <View style={s.summary}>
            <View style={s.summaryLine}>
              <Text>{copy.productsLabel}</Text>
              <Text>{formatNumber(items.length)}</Text>
            </View>
            <View style={s.summaryLine}>
              <Text>{copy.packetsLabel}</Text>
              <Text>{formatNumber(packetCount(items))}</Text>
            </View>
            <View style={s.summaryDivider} />
            <Text style={s.summaryTotalLabel}>{copy.totalLabel}</Text>
            <Text style={s.summaryTotal}>{formatMills(totalMills(items))}</Text>
          </View>
        </View>

        <View style={s.notes} wrap={false}>
          <Text style={s.notesTitle}>{copy.notesTitle}</Text>
          <Text style={s.note}>{copy.noteEstimate}</Text>
          <Text style={s.note}>{copy.notePrices}</Text>
        </View>

        <View fixed style={s.footer}>
          <Text>
            {pdfText(`${siteConfig.name}  ·  ${new URL(siteConfig.url).host}`)}
          </Text>
          <Text
            render={(props) =>
              formatMessage(copy.pageLabel, {
                page: props.pageNumber.toString(),
                pages: props.totalPages ? props.totalPages.toString() : "",
              })
            }
          />
        </View>
      </Page>
    </Document>
  )
}
