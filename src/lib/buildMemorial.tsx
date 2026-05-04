import { pdf } from "@react-pdf/renderer";
import { getDriveImageUrl } from "@/lib/driveImage";
import { calcTotalContrato } from "@/data/servicosDecor";
import { MemorialDocument } from "@/components/funnel/MemorialPDF";
import type { MemorialData } from "@/components/funnel/MemorialPDF";
import type { Unit } from "@/contexts/FunnelContext";

const SUBCATEGORIA_NOME: Record<string, string> = {
  "2.1.1": "Painéis e Nichos",
  "2.1.2": "Bancada de Cozinha",
  "2.1.3": "Metais e Acessórios",
  "2.1.4": "Box de Banheiro",
  "2.1.5": "Iluminação",
  "2.1.6": "Mobiliário Externo",
  "2.1.7": "Decoração e Acessórios",
  "2.1.8": "Eletrodomésticos",
  "2.1.9": "Enxoval e Utensílios",
  "2.1.10": "Mezanino",
  "2.2.1": "Pintura",
  "2.2.2": "Feltro e Proteção",
  "2.2.3": "Instalações Elétricas",
  "2.2.4": "Instalações Hidráulicas",
  "2.2.5": "Ar Condicionado",
  "2.2.6": "Revestimentos e Fechamentos",
  "2.2.8": "Conservação e Limpeza",
  "2.2.9": "RRT",
  "2.2.10": "Marmoraria",
};

async function fetchBase64(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export interface BuildMemorialParams {
  selectedUnit: Unit | null;
  tipologiaSelecionada: any;
  produtosPadrao: any[];
  produtosAdicionais: any[];
  removidos: Set<number>;
  adicionados: Set<number>;
  swaps: Map<number, any>;
  subtotalProdutos: number;
}

export async function buildMemorialBlob(params: BuildMemorialParams): Promise<{ blob: Blob; filename: string }> {
  const { selectedUnit, tipologiaSelecionada, produtosPadrao, produtosAdicionais, removidos, adicionados, swaps, subtotalProdutos } = params;

  const activeItems = produtosPadrao
    .filter((p) => !removidos.has(p.produto_codigo))
    .map((p) =>
      swaps.has(p.produto_codigo)
        ? { ...p, ...swaps.get(p.produto_codigo)!, _isSwapped: true }
        : p
    );

  const adicionadosList = produtosAdicionais.filter((p) => adicionados.has(p.produto_codigo));

  const allItems = [
    ...activeItems.map((i) => ({ ...i, _isAdded: false })),
    ...adicionadosList.map((i) => ({ ...i, _isSwapped: false, _isAdded: true })),
  ];

  const groupsMap: Record<string, typeof allItems> = {};
  allItems.forEach((item) => {
    const key = (item as any).produto?.subcategoria_codigo ?? (item as any).produto?.categoria_codigo ?? "Outros";
    if (!groupsMap[key]) groupsMap[key] = [];
    groupsMap[key].push(item);
  });

  const imageCache = new Map<string | null, string | null>();
  const uniqueRawUrls = [...new Set(allItems.map((i) => (i as any).produto?.imagem_url ?? null))];
  await Promise.all(
    uniqueRawUrls.map(async (rawUrl) => {
      const resolvedUrl = getDriveImageUrl(rawUrl, 'w200');
      const fetchUrl = resolvedUrl?.startsWith('http') ? resolvedUrl : resolvedUrl ? `${window.location.origin}${resolvedUrl}` : null;
      const base64 = await fetchBase64(fetchUrl);
      imageCache.set(rawUrl, base64);
    })
  );

  const logoBase64 = await fetchBase64(`${window.location.origin}/logo-seazone.png`);
  const total = calcTotalContrato(subtotalProdutos);
  const isPersonalizado = swaps.size > 0 || removidos.size > 0 || adicionados.size > 0;

  const hoje = new Date();
  const mesCorrecao = `01/${String(hoje.getMonth() + 1).padStart(2, "0")}/${hoje.getFullYear()}`;

  const data: MemorialData = {
    empreendimento: selectedUnit?.spot ?? "",
    unidade: selectedUnit?.id ?? "",
    tipologia: tipologiaSelecionada?.tipo_letra ?? "",
    pacote: (tipologiaSelecionada as any)?.pacote?.abreviacao ?? "",
    numHospedes: tipologiaSelecionada?.num_hospedes ?? 0,
    dataGeracao: hoje.toLocaleDateString("pt-BR"),
    mesCorrecao,
    grupos: Object.entries(groupsMap).map(([key, items]) => ({
      nome: SUBCATEGORIA_NOME[key] ?? key,
      items: items.map((item: any) => ({
        nome: item.produto?.nome ?? `Produto ${item.produto_codigo}`,
        imagemBase64: imageCache.get(item.produto?.imagem_url ?? null) ?? null,
        quantidade: item.quantidade ?? 1,
        valorUnitario: item.valor_unitario ?? 0,
        isSwapped: !!item._isSwapped,
        isAdded: !!item._isAdded,
      })),
    })),
    total,
    isPersonalizado,
    logoBase64,
  };

  const blob = await pdf(<MemorialDocument data={data} />).toBlob();

  const emp = (selectedUnit?.spot ?? "Memorial").replace(/\s+/g, "_");
  const tipo = tipologiaSelecionada?.tipo_letra ?? "";
  const pkg = (tipologiaSelecionada as any)?.pacote?.abreviacao ?? "";
  const sufixo = isPersonalizado ? "_Personalizado" : "";
  const filename = `${emp}_Tipologia_${tipo}_${pkg}${sufixo}.pdf`;

  return { blob, filename };
}
