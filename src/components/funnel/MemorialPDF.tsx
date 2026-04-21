import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

const CORAL = "#E8521A";
const NAVY  = "#0F1E41";
const GRAY_BG     = "#F7F8FA";
const GRAY_BORDER = "#E2E6EC";
const TEXT        = "#1A1A2E";
const TEXT_MUTED  = "#6B7280";

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export interface MemorialItem {
  nome: string;
  imagemBase64: string | null;
  quantidade: number;
  valorUnitario: number;
  isSwapped: boolean;
  isAdded: boolean;
}

export interface MemorialGrupo {
  nome: string;
  items: MemorialItem[];
}

export interface MemorialData {
  empreendimento: string;
  unidade: string;
  tipologia: string;
  pacote: string;
  numHospedes: number;
  dataGeracao: string;
  mesCorrecao: string;
  grupos: MemorialGrupo[];
  total: number;
  isPersonalizado: boolean;
  logoBase64: string | null;
}

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: TEXT,
    paddingTop: 32,
    paddingBottom: 52,
    paddingHorizontal: 32,
    backgroundColor: "white",
  },

  // ── Header ──────────────────────────────────────
  header: { flexDirection: "row", marginBottom: 18 },
  logoBox: {
    width: 90,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  logoImg:      { width: 58, height: 58, objectFit: "contain" },
  logoDecorTxt: { color: "rgba(255,255,255,0.7)", fontSize: 7, letterSpacing: 2, marginTop: 3 },
  titleBox: {
    flex: 1,
    backgroundColor: CORAL,
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
  },
  titleText: { color: "white", fontFamily: "Helvetica-Bold", fontSize: 12, letterSpacing: 0.5 },
  titleSub:  { color: "rgba(255,255,255,0.75)", fontSize: 7.5, marginTop: 3 },

  // ── Info table ───────────────────────────────────
  infoBox: { borderWidth: 1, borderColor: GRAY_BORDER, marginBottom: 12 },
  iRow:     { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: GRAY_BORDER },
  iRowLast: { flexDirection: "row" },
  iLabel: {
    width: 110, backgroundColor: GRAY_BG,
    padding: "6 9", fontFamily: "Helvetica-Bold", fontSize: 8, color: NAVY,
  },
  iValue: { flex: 1, padding: "6 9", fontSize: 8 },

  // double row (Hóspedes | Pacote)
  iLabelHalf: {
    width: 80, backgroundColor: GRAY_BG,
    padding: "6 9", fontFamily: "Helvetica-Bold", fontSize: 8, color: NAVY,
  },
  iValueHalf: {
    width: 60, padding: "6 9", fontSize: 8,
    borderRightWidth: 1, borderRightColor: GRAY_BORDER,
  },
  iLabel2: {
    width: 80, backgroundColor: GRAY_BG,
    padding: "6 9", fontFamily: "Helvetica-Bold", fontSize: 8, color: NAVY,
    borderLeftWidth: 1, borderLeftColor: GRAY_BORDER,
  },
  iValue2: { flex: 1, padding: "6 9", fontSize: 8 },

  // ── Total box ────────────────────────────────────
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: NAVY,
    padding: "10 12",
    marginBottom: 14,
  },
  totalLeft:    { flexDirection: "column" },
  totalLabel:   { color: "white", fontFamily: "Helvetica-Bold", fontSize: 10 },
  totalParcela: { color: "rgba(255,255,255,0.55)", fontSize: 7, marginTop: 2 },
  totalValue:   { color: CORAL, fontFamily: "Helvetica-Bold", fontSize: 13 },

  // ── Group header ─────────────────────────────────
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: NAVY,
    padding: "6 10",
    marginTop: 10,
  },
  groupName:  { color: "white", fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  groupTotal: { color: "white", fontFamily: "Helvetica-Bold", fontSize: 8.5 },

  // ── Product row ──────────────────────────────────
  pRow:    {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
    minHeight: 46,
  },
  pRowAlt: { backgroundColor: GRAY_BG },
  pName:   { width: "36%", padding: "4 8", fontSize: 7.5, lineHeight: 1.4 },
  pImgCell:{ width: "14%", alignItems: "center", justifyContent: "center", padding: 3 },
  pImg:    { width: 34, height: 34, objectFit: "contain" },
  pImgBox: { width: 34, height: 34, backgroundColor: GRAY_BORDER },
  pQty:    { width: "8%",  textAlign: "center", fontSize: 8, fontFamily: "Helvetica-Bold" },
  pUnit:   { width: "20%", textAlign: "right",  fontSize: 7.5, paddingRight: 6, color: TEXT_MUTED },
  pTotal:  { width: "22%", textAlign: "right",  fontSize: 8,   paddingRight: 6, fontFamily: "Helvetica-Bold" },

  // badges
  badge:      { backgroundColor: CORAL, borderRadius: 2, padding: "1 4", marginTop: 2, alignSelf: "flex-start" },
  badgeText:  { color: "white", fontSize: 5.5, fontFamily: "Helvetica-Bold" },
  badgeAdded: { backgroundColor: "#16A34A" },

  // ── Footer ───────────────────────────────────────
  footer: {
    position: "absolute", bottom: 20, left: 32, right: 32,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingTop: 5, borderTopWidth: 1, borderTopColor: GRAY_BORDER,
  },
  footerText: { fontSize: 6.5, color: TEXT_MUTED },
  pageNum:    { fontSize: 6.5, color: TEXT_MUTED },
});

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={last ? s.iRowLast : s.iRow}>
      <Text style={s.iLabel}>{label}</Text>
      <Text style={s.iValue}>{value}</Text>
    </View>
  );
}

function ProductRow({ item, idx }: { item: MemorialItem; idx: number }) {
  const isAlt  = idx % 2 === 1;
  const total  = item.valorUnitario * item.quantidade;
  return (
    <View style={[s.pRow, isAlt ? s.pRowAlt : {}]}>
      {/* Name + badges */}
      <View style={s.pName}>
        <Text>{item.nome}</Text>
        {item.isSwapped && (
          <View style={s.badge}><Text style={s.badgeText}>Personalizado</Text></View>
        )}
        {item.isAdded && (
          <View style={[s.badge, s.badgeAdded]}><Text style={s.badgeText}>Adicional</Text></View>
        )}
      </View>
      {/* Image */}
      <View style={s.pImgCell}>
        {item.imagemBase64
          ? <Image src={item.imagemBase64} style={s.pImg} />
          : <View style={s.pImgBox} />}
      </View>
      {/* Qty */}
      <Text style={s.pQty}>{item.quantidade}</Text>
      {/* Unit price */}
      <Text style={s.pUnit}>
        {item.valorUnitario > 0 ? fmt(item.valorUnitario) : "—"}
      </Text>
      {/* Line total */}
      <Text style={s.pTotal}>
        {total > 0 ? fmt(total) : "—"}
      </Text>
    </View>
  );
}

export function MemorialDocument({ data }: { data: MemorialData }) {
  const tipologiaComposta = [
    data.empreendimento,
    data.tipologia ? `Tipologia ${data.tipologia}` : null,
    data.pacote,
    data.isPersonalizado ? "Personalizado" : null,
  ].filter(Boolean).join("_");

  return (
    <Document title={`Memorial — ${data.empreendimento}`} author="Seazone Decor">
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.logoBox}>
            {data.logoBase64
              ? <Image src={data.logoBase64} style={s.logoImg} />
              : null}
            <Text style={s.logoDecorTxt}>DECOR</Text>
          </View>
          <View style={s.titleBox}>
            <Text style={s.titleText}>MEMORIAL DESCRITIVO POR TIPOLOGIA</Text>
            {tipologiaComposta ? <Text style={s.titleSub}>{tipologiaComposta}</Text> : null}
          </View>
        </View>

        {/* ── Info table ── */}
        <View style={s.infoBox}>
          <InfoRow label="Empreendimento" value={data.empreendimento || "—"} />
          <InfoRow label="Unidade"        value={data.unidade        || "—"} />
          <InfoRow label="Tipologia"      value={tipologiaComposta   || "—"} />
          <InfoRow label="Mês Correção"   value={data.mesCorrecao}           />
          <InfoRow label="Índice"         value="IPCA"                       />
          <InfoRow label="Hóspedes"       value={data.numHospedes ? String(data.numHospedes) : "—"} />
          <InfoRow label="Pacote"         value={data.pacote || "—"} />
          <InfoRow label="Data de geração" value={data.dataGeracao} />
          <InfoRow label="Valor Total"     value={fmt(data.total)} last />
        </View>

        {/* ── Product groups ── */}
        {data.grupos.map((grupo) => {
          const grupoTotal = grupo.items.reduce(
            (sum, i) => sum + i.valorUnitario * i.quantidade, 0
          );
          return (
            <View key={grupo.nome} wrap={false}>
              <View style={s.groupHeader}>
                <Text style={s.groupName}>{grupo.nome}</Text>
                {grupoTotal > 0 && <Text style={s.groupTotal}>{fmt(grupoTotal)}</Text>}
              </View>
              {grupo.items.map((item, idx) => (
                <ProductRow key={idx} item={item} idx={idx} />
              ))}
            </View>
          );
        })}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            Seazone Decor · {data.dataGeracao}
            {data.isPersonalizado ? " · Personalizado" : ""}
          </Text>
          <Text
            style={s.pageNum}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  );
}
