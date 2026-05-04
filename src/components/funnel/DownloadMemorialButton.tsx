import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFunnel } from "@/contexts/FunnelContext";
import { useProdutosTipologia } from "@/hooks/useProdutosTipologia";
import { buildMemorialBlob } from "@/lib/buildMemorial";
import { toast } from "sonner";

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
      const { blob, filename } = await buildMemorialBlob({
        selectedUnit, tipologiaSelecionada, produtosPadrao, produtosAdicionais,
        removidos, adicionados, swaps, subtotalProdutos,
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
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
