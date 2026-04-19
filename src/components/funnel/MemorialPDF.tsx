import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import seazoneLogo from "@/assets/seazone-icon.png";

const CORAL = "#E8521A";
const NAVY = "#0F1E41";
const GRAY_BG = "#F7F8FA";
const GRAY_BORDER = "#E2E6EC";
const TEXT = "#1A1A2E";
const TEXT_MUTED = "#6B7280";

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function driveThumb(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w120` : url;
}

export interface MemorialItem {
  nome: string;
  imagemUrl: string | null;
  quantidade: number;
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
  grupos: MemorialGrupo[];
  valorProdutos: number;
  taxaDecor: number;
  admPercent: number;
  admValor: number;
  impostoValor: number;
  total: number;
  isPersonalizado: boolean;
}

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: TEXT,
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 36,
    backgroundColor: "white",
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: { flexDirection: "row", marginBottom: 20, borderRadius: 6, overflow: "hidden" },
  headerLogoBox: {
    backgroundColor: NAVY,
    width: 72,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  headerLogo: { width: 44, height: 44, objectFit: "contain" },
  headerTitleBox: {
    flex: 1,
    backgroundColor: CORAL,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  headerLabel: { color: "rgba(255,255,255,0.7)", fontSize: 7, letterSpacing: 2, marginBottom: 4 },
  headerTitle: { color: "white", fontFamily: "Helvetica-Bold", fontSize: 14, letterSpacing: 1 },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 8, marginTop: 3 },

  // ── Info table ────────────────────────────────────────────────────────────
  infoBox: {
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 16,
  },
  infoRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: GRAY_BORDER },
  infoRowLast: { flexDirection: "row" },
  infoLabel: {
    width: 130,
    backgroundColor: GRAY_BG,
    padding: "7 10",
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: NAVY,
  },
  infoValue: { flex: 1, padding: "7 10", fontSize: 8 },

  // ── Financial card ────────────────────────────────────────────────────────
  finCard: {
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 20,
  },
  finHeader: { backgroundColor: NAVY, padding: "8 12" },
  finHeaderText: { color: "white", fontFamily: "Helvetica-Bold", fontSize: 9, letterSpacing: 0.5 },
  finRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "6 12",
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
  },
  finLabel: { fontSize: 8, color: TEXT_MUTED },
  finValue: { fontSize: 8 },
  finTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "9 12",
    backgroundColor: GRAY_BG,
  },
  finTotalLabel: { fontSize: 9, fontFamily: "Helvetica-Bold", color: NAVY },
  finTotalValue: { fontSize: 10, fontFamily: "Helvetica-Bold", color: CORAL },

  // ── Product group ─────────────────────────────────────────────────────────
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: NAVY,
    padding: "7 12",
    marginTop: 14,
    borderRadius: 4,
  },
  groupName: { color: "white", fontFamily: "Helvetica-Bold", fontSize: 9 },
  groupCount: { color: "rgba(255,255,255,0.6)", fontSize: 7 },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_BORDER,
    minHeight: 44,
  },
  productRowAlt: { backgroundColor: GRAY_BG },
  productImg: { width: 34, height: 34, objectFit: "contain", borderRadius: 3, marginRight: 10 },
  productImgBox: {
    width: 34,
    height: 34,
    backgroundColor: GRAY_BORDER,
    borderRadius: 3,
    marginRight: 10,
  },
  productName: { flex: 1, fontSize: 8, lineHeight: 1.35 },
  productQtyBox: {
    width: 28,
    height: 20,
    backgroundColor: GRAY_BG,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  productQty: { fontSize: 8, fontFamily: "Helvetica-Bold", color: NAVY },
  badge: {
    backgroundColor: CORAL,
    borderRadius: 3,
    padding: "1 5",
    marginLeft: 6,
    alignSelf: "center",
  },
  badgeText: { color: "white", fontSize: 6, fontFamily: "Helvetica-Bold" },
  badgeAdded: { backgroundColor: "#16A34A" },

  // ── Footer ────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: GRAY_BORDER,
  },
  footerText: { fontSize: 7, color: TEXT_MUTED },
  pageNum: { fontSize: 7, color: TEXT_MUTED },
});

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={last ? s.infoRowLast : s.infoRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

function FinRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.finRow}>
      <Text style={s.finLabel}>{label}</Text>
      <Text style={s.finValue}>{value}</Text>
    </View>
  );
}

function ProductRow({ item, idx }: { item: MemorialItem; idx: number }) {
  const imgUrl = driveThumb(item.imagemUrl);
  const isAlt = idx % 2 === 1;
  return (
    <View style={[s.productRow, isAlt ? s.productRowAlt : {}]}>
      {imgUrl ? (
        <Image src={imgUrl} style={s.productImg} />
      ) : (
        <View style={s.productImgBox} />
      )}
      <Text style={s.productName}>{item.nome}</Text>
      {item.isSwapped && (
        <View style={s.badge}><Text style={s.badgeText}>Personalizado</Text></View>
      )}
      {item.isAdded && (
        <View style={[s.badge, s.badgeAdded]}><Text style={s.badgeText}>Adicional</Text></View>
      )}
      <View style={s.productQtyBox}>
        <Text style={s.productQty}>{item.quantidade}</Text>
      </View>
    </View>
  );
}

function PageFooter({ date, personalizado }: { date: string; personalizado: boolean }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>
        Seazone Decor · {date}{personalizado ? " · Personalizado" : ""}
      </Text>
      <Text style={s.pageNum} render={({ pageNumber, totalPages }) =>
        `${pageNumber} / ${totalPages}`
      } />
    </View>
  );
}

export function MemorialDocument({ data }: { data: MemorialData }) {
  const titulo = [
    data.empreendimento,
    data.tipologia ? `Tipologia ${data.tipologia}` : null,
    data.pacote,
    data.isPersonalizado ? "Personalizado" : null,
  ].filter(Boolean).join(" · ");

  return (
    <Document title={titulo} author="Seazone Decor">
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.headerLogoBox}>
            <Image src={seazoneLogo} style={s.headerLogo} />
          </View>
          <View style={s.headerTitleBox}>
            <Text style={s.headerLabel}>SEAZONE DECOR</Text>
            <Text style={s.headerTitle}>MEMORIAL DESCRITIVO</Text>
            {data.isPersonalizado && (
              <Text style={s.headerSub}>Plano Personalizado</Text>
            )}
          </View>
        </View>

        {/* ── Info ── */}
        <View style={s.infoBox}>
          <InfoRow label="Empreendimento" value={data.empreendimento} />
          <InfoRow label="Unidade" value={data.unidade || "—"} />
          <InfoRow label="Tipologia" value={data.tipologia ? `Tipologia ${data.tipologia} — ${data.pacote}` : data.pacote} />
          <InfoRow label="Hóspedes" value={`${data.numHospedes} hóspedes`} />
          <InfoRow label="Data de geração" value={data.dataGeracao} last />
        </View>

        {/* ── Financial ── */}
        <View style={s.finCard}>
          <View style={s.finHeader}>
            <Text style={s.finHeaderText}>RESUMO FINANCEIRO</Text>
          </View>
          <FinRow label="Valor dos produtos" value={fmt(data.valorProdutos)} />
          <FinRow label="Taxa Decor (custos operacionais)" value={fmt(data.taxaDecor)} />
          <FinRow label={`Taxa Administração (${data.admPercent}%)`} value={fmt(data.admValor)} />
          <FinRow label="Imposto de Serviço (14,33%)" value={fmt(data.impostoValor)} />
          <View style={s.finTotal}>
            <Text style={s.finTotalLabel}>TOTAL ESTIMADO</Text>
            <Text style={s.finTotalValue}>{fmt(data.total)}</Text>
          </View>
        </View>

        {/* ── Product groups ── */}
        {data.grupos.map((grupo) => (
          <View key={grupo.nome}>
            <View style={s.groupHeader}>
              <Text style={s.groupName}>{grupo.nome}</Text>
              <Text style={s.groupCount}>{grupo.items.length} {grupo.items.length === 1 ? "item" : "itens"}</Text>
            </View>
            {grupo.items.map((item, idx) => (
              <ProductRow key={`${grupo.nome}-${idx}`} item={item} idx={idx} />
            ))}
          </View>
        ))}

        <PageFooter date={data.dataGeracao} personalizado={data.isPersonalizado} />
      </Page>
    </Document>
  );
}
