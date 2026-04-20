import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFunnel } from "@/contexts/FunnelContext";
import { useProdutosTipologia } from "@/hooks/useProdutosTipologia";
import { MemorialDocument } from "./MemorialPDF";
import type { MemorialData } from "./MemorialPDF";
import { toast } from "sonner";

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

export function DownloadMemorialButton({ variant = "glass" }: { variant?: string }) {
  const {
    selectedUnit,
    tipologiaSelecionada,
    removidos,
    adicionados,
    swaps,
    subtotalProdutos,
  } = useFunnel();

  const tipologiaCodigo = tipologiaSelecionada?.codigo ?? null;
  const { produtosPadrao, produtosAdicionais } = useProdutosTipologia(tipologiaCodigo);

  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      // Apply swaps and filter removed items
      const activeItems = produtosPadrao
        .filter((p) => !removidos.has(p.produto_codigo))
        .map((p) =>
          swaps.has(p.produto_codigo)
            ? { ...p, ...swaps.get(p.produto_codigo)!, _isSwapped: true }
            : p
        );

      const adicionadosList = produtosAdicionais.filter((p) =>
        adicionados.has(p.produto_codigo)
      );

      const allItems = [
        ...activeItems.map((i) => ({ ...i, _isAdded: false })),
        ...adicionadosList.map((i) => ({ ...i, _isSwapped: false, _isAdded: true })),
      ];

      // Group by subcategoria
      const groupsMap: Record<string, typeof allItems> = {};
      allItems.forEach((item) => {
        const key =
          (item as any).produto?.subcategoria_codigo ??
          (item as any).produto?.categoria_codigo ??
          "Outros";
        if (!groupsMap[key]) groupsMap[key] = [];
        groupsMap[key].push(item);
      });

      // Pre-fetch all images as base64 to avoid CORS inside @react-pdf/renderer
      const imageCache = new Map<string | null, string | null>();
      const uniqueUrls = [...new Set(allItems.map((i) => (i as any).produto?.imagem_url ?? null))];
      await Promise.all(
        uniqueUrls.map(async (url) => {
          imageCache.set(url, await fetchBase64(url));
        })
      );

      const decorValor = tipologiaSelecionada?.decor_valor ?? 0;
      const admPct = tipologiaSelecionada?.adm_percent ?? 0;
      const admValor = (admPct / 100) * subtotalProdutos;
      const seazoneBilling = decorValor + admValor;
      const impostoValor = seazoneBilling * 0.1433;
      const total = subtotalProdutos + seazoneBilling + impostoValor;

      const isPersonalizado = swaps.size > 0 || removidos.size > 0;

      const data: MemorialData = {
        empreendimento: selectedUnit?.spot ?? "",
        unidade: selectedUnit?.id ?? "",
        tipologia: tipologiaSelecionada?.tipo_letra ?? "",
        pacote: (tipologiaSelecionada as any)?.pacote?.abreviacao ?? "",
        numHospedes: tipologiaSelecionada?.num_hospedes ?? 0,
        dataGeracao: new Date().toLocaleDateString("pt-BR"),
        grupos: Object.entries(groupsMap).map(([key, items]) => ({
          nome: SUBCATEGORIA_NOME[key] ?? key,
          items: items.map((item: any) => ({
            nome: item.produto?.nome ?? `Produto ${item.produto_codigo}`,
            imagemBase64: imageCache.get(item.produto?.imagem_url ?? null) ?? null,
            quantidade: item.quantidade ?? 1,
            isSwapped: !!item._isSwapped,
            isAdded: !!item._isAdded,
          })),
        })),
        valorProdutos: subtotalProdutos,
        taxaDecor: decorValor,
        admPercent: admPct,
        admValor,
        impostoValor,
        total,
        isPersonalizado,
      };

      const blob = await pdf(<MemorialDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const emp = (selectedUnit?.spot ?? "Memorial").replace(/\s+/g, "_");
      const tipo = tipologiaSelecionada?.tipo_letra ?? "";
      const pkg = (tipologiaSelecionada as any)?.pacote?.abreviacao ?? "";
      const sufixo = isPersonalizado ? "_Personalizado" : "";
      a.download = `${emp}_Tipologia_${tipo}_${pkg}${sufixo}.pdf`;

      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Memorial gerado com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      toast.error("Erro ao gerar o memorial. Tente novamente.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant={variant as any}
      className="w-full gap-2"
      onClick={handleDownload}
      disabled={generating}
    >
      {generating ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Baixar memorial descritivo (PDF)
        </>
      )}
    </Button>
  );
}
