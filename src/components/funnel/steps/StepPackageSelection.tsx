import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Package, ArrowRight, Loader2, Settings2, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFunnel } from "@/contexts/FunnelContext";
import { useTipologiasDisponiveis } from "@/hooks/useTipologiasDisponiveis";
import { useProdutosTipologia } from "@/hooks/useProdutosTipologia";
import { useEmpreendimentoRenders } from "@/hooks/useEmpreendimentoRenders";
import type { ProdutoTipologia } from "@/types/catalog";

function getDriveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/d\/([^/]+)\//);
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w120`;
  return url;
}

const PACOTE_LABEL: Record<string, string> = {
  ES: "Essential", PL: "Plus", PR: "Premium", HD1: "HD1", AM: "Ampliada",
};

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

function ProductList({ tipologiaCodigo }: { tipologiaCodigo: number }) {
  const { produtosPadrao, isLoading } = useProdutosTipologia(tipologiaCodigo);
  const { setSubtotalProdutos } = useFunnel();

  useEffect(() => {
    const total = produtosPadrao.reduce((sum, p) => sum + (p.valor_unitario ?? 0) * (p.quantidade ?? 1), 0);
    setSubtotalProdutos(total);
  }, [produtosPadrao, setSubtotalProdutos]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-seazone-coral" />
      </div>
    );
  }

  if (!produtosPadrao.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhum produto encontrado para esta tipologia.
      </p>
    );
  }

  const groups = produtosPadrao.reduce<Record<string, ProdutoTipologia[]>>((acc, p) => {
    const key = p.produto?.subcategoria_codigo ?? p.produto?.categoria_codigo ?? "Outros";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          {produtosPadrao.length} itens incluídos
        </span>
      </div>

      <div className="max-h-72 overflow-y-auto space-y-4 pr-1">
        {Object.entries(groups).map(([categoria, items]) => (
          <div key={categoria}>
            <p className="text-xs font-bold text-seazone-coral uppercase tracking-wider mb-2">
              {SUBCATEGORIA_NOME[categoria] ?? categoria}
            </p>
            <div className="space-y-1">
              {items.map((item) => {
                const imgUrl = getDriveImageUrl(item.produto?.imagem_url);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 text-sm py-1.5 border-b border-border/40"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.produto?.nome ?? ""}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <ImageOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="flex-1 text-foreground">
                      {item.produto?.nome ?? `Produto ${item.produto_codigo}`}
                      {(item.quantidade ?? 1) > 1 && (
                        <span className="text-muted-foreground ml-1">× {item.quantidade}</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function Lightbox({ renders, startIdx, onClose }: {
  renders: { id: number; url: string }[];
  startIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.requestFullscreen().catch(() => {});
    return () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { document.exitFullscreen().catch(() => {}); onClose(); }
      if (e.key === "ArrowLeft")  setIdx(i => (i - 1 + renders.length) % renders.length);
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % renders.length);
    };
    const onFsChange = () => { if (!document.fullscreenElement) onClose(); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [renders.length, onClose]);

  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i - 1 + renders.length) % renders.length); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i + 1) % renders.length); };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
    >
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/60 to-transparent">
        <span className="text-white/80 text-sm">{idx + 1} / {renders.length}</span>
        <button
          onClick={() => { document.exitFullscreen().catch(() => {}); onClose(); }}
          className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full px-4 py-1.5 text-sm transition-colors"
        >
          Fechar
        </button>
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors">
        <ChevronRight className="w-6 h-6" />
      </button>

      <img
        src={renders[idx].url}
        alt={`Foto ${idx + 1}`}
        className="max-w-[92vw] max-h-[80vh] object-contain"
      />

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2">
        {renders.map((r, i) => (
          <button
            key={r.id}
            onClick={(e) => { e.stopPropagation(); setIdx(i); }}
            className={`flex-shrink-0 w-16 h-11 rounded-lg overflow-hidden transition-all duration-200 ${
              i === idx ? "ring-2 ring-white opacity-100" : "opacity-40 hover:opacity-70"
            }`}
          >
            <img src={r.url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

function RenderGallery({ empreendimentoCodigo, pacoteCodigo, nomePacote }: {
  empreendimentoCodigo: number;
  pacoteCodigo: number;
  nomePacote: string;
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const { data: renders = [], isLoading } = useEmpreendimentoRenders(empreendimentoCodigo, pacoteCodigo);

  useEffect(() => { setActiveIdx(0); }, [empreendimentoCodigo, pacoteCodigo]);

  if (isLoading || !renders.length) return null;

  const prev = () => setActiveIdx(i => (i - 1 + renders.length) % renders.length);
  const next = () => setActiveIdx(i => (i + 1) % renders.length);
  const sideCount = Math.min(2, renders.length - 1);
  const sideIdxs = Array.from({ length: sideCount }, (_, k) => (activeIdx + k + 1) % renders.length);

  return (
    <>
    {lightboxIdx !== null && (
      <Lightbox
        renders={renders}
        startIdx={lightboxIdx}
        onClose={() => setLightboxIdx(null)}
      />
    )}
    <div className="pt-4 border-t border-border space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-3.5 bg-seazone-coral rounded-full" />
          <p className="text-xs font-semibold text-foreground tracking-wide uppercase">
            Como fica — {nomePacote}
          </p>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {activeIdx + 1} / {renders.length}
        </span>
      </div>

      <div className="grid gap-2" style={{ gridTemplateColumns: "3fr 1fr" }}>
        <div className="flex flex-col gap-2">
          <div className="relative rounded-xl overflow-hidden bg-white group" style={{ height: "340px" }}>
            <img
              src={renders[activeIdx].url}
              alt={`${nomePacote} — foto ${activeIdx + 1}`}
              className="w-full h-full object-contain cursor-zoom-in"
              onClick={() => setLightboxIdx(activeIdx)}
            />
            <button
              onClick={(e) => { e.preventDefault(); prev(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.preventDefault(); next(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-1.5 justify-center">
            {renders.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIdx
                    ? "w-2.5 h-2.5 bg-seazone-coral"
                    : "w-2 h-2 bg-border hover:bg-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-2" style={{ gridTemplateRows: "1fr 1fr", height: "340px" }}>
          {sideIdxs.map((idx, k) => {
            const isLast = k === sideCount - 1 && renders.length > 3;
            return (
              <button
                key={k}
                onClick={(e) => { e.preventDefault(); setActiveIdx(idx); }}
                className="relative rounded-xl overflow-hidden bg-white group/t w-full h-full"
              >
                <img
                  src={renders[idx].url}
                  alt={`Foto ${idx + 1}`}
                  className="w-full h-full object-contain group-hover/t:opacity-80 transition-opacity duration-200 cursor-zoom-in"
                  onClick={(e) => { e.stopPropagation(); setLightboxIdx(idx); }}
                />
                {isLast && renders.length > 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                    <span className="text-white text-xs font-bold">+{renders.length - 3}</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}

function PackageCard({ tip, isSelected, isRecommended, onSelect }: {
  tip: any;
  isSelected: boolean;
  isRecommended?: boolean;
  onSelect: (tip: any) => void;
}) {
  const abrev: string = tip.pacote?.abreviacao ?? "";
  const nome = PACOTE_LABEL[abrev] ?? tip.descricao;
  const { produtosPadrao, isLoading: loadingProdutos } = useProdutosTipologia(tip.codigo);

  const totalPrice = useMemo(() => {
    if (!produtosPadrao.length) return null;
    const subtotal = produtosPadrao.reduce((sum, p) => sum + (p.valor_unitario ?? 0) * (p.quantidade ?? 1), 0);
    const decorValor = tip.decor_valor ?? 0;
    const admPercent = (tip.adm_percent ?? 0) / 100;
    return subtotal + (decorValor + admPercent * subtotal) * 1.1433;
  }, [produtosPadrao, tip.decor_valor, tip.adm_percent]);

  return (
    <Card
      variant={isSelected ? "selected" : "elevated"}
      className={`relative cursor-pointer transition-all duration-300 ${
        isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"
      }`}
      onClick={() => onSelect(tip)}
    >
      <CardHeader className="text-center pb-4">
        {isRecommended && (
          <Badge variant="coral" className="mx-auto mb-3 text-xs">
            ✦ Recomendado para você
          </Badge>
        )}
        <div className="flex justify-center mb-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
            abrev === "PR" ? "bg-premium-gradient" :
            abrev === "PL" ? "bg-coral-gradient" : "bg-secondary"
          }`}>
            <Package className={`w-7 h-7 ${abrev === "ES" ? "text-foreground" : "text-primary-foreground"}`} />
          </div>
        </div>
        <h3 className="text-xl font-display font-bold">{nome}</h3>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center py-2 rounded-xl bg-secondary/50">
          {loadingProdutos ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto text-muted-foreground" />
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{produtosPadrao.length} itens incluídos</p>
              {totalPrice != null && (
                <p className="text-seazone-coral font-bold text-xl mt-0.5">
                  R$ {totalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </>
          )}
        </div>

        <Button
          variant={isSelected ? "coral" : "outline"}
          className="w-full"
          onClick={(e) => { e.stopPropagation(); onSelect(tip); }}
        >
          {isSelected ? <><Check className="w-4 h-4 mr-1" />Selecionado</> : "Selecionar"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function StepPackageSelection() {
  const { selectedUnit, selectPackage, setTipologiaSelecionada, tipologiaSelecionada, nextStep, setCurrentStep, recommendedPackageAbrev } = useFunnel();

  const tipologiaCodigo = selectedUnit?.tipologiaCodigo ?? null;
  const { data: tipologias, isLoading } = useTipologiasDisponiveis(tipologiaCodigo);

  const handleSelect = (tip: any) => {
    const abrev: string = tip.pacote?.abreviacao ?? "";
    selectPackage((PACOTE_LABEL[abrev]?.toLowerCase() ?? "essential") as any);
    setTipologiaSelecionada(tip);
  };

  // Preload sz=w200 images (used in StepCustomization) as soon as a package is selected
  const { produtosPadrao: preloadProdutos } = useProdutosTipologia(tipologiaSelecionada?.codigo ?? null);
  useEffect(() => {
    if (!preloadProdutos.length) return;
    preloadProdutos.forEach(p => {
      const raw = (p.produto as any)?.imagem_url as string | null | undefined;
      if (!raw) return;
      const match = raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (!match) return;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`;
      document.head.appendChild(link);
    });
  }, [preloadProdutos]);

  // Auto-select recommended package when coming from the prospect quiz
  useEffect(() => {
    if (!tipologias?.length || !recommendedPackageAbrev || tipologiaSelecionada) return;
    const match = tipologias.find((t: any) => t.pacote?.abreviacao === recommendedPackageAbrev);
    if (match) handleSelect(match);
  }, [tipologias, recommendedPackageAbrev]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-seazone-coral" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">Escolha seu Plano</h2>
        <p className="text-muted-foreground">Selecione o plano e veja os itens incluídos</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {(tipologias ?? []).map((tip: any) => (
          <PackageCard
            key={tip.id}
            tip={tip}
            isSelected={tipologiaSelecionada?.codigo === tip.codigo}
            isRecommended={!!recommendedPackageAbrev && tip.pacote?.abreviacao === recommendedPackageAbrev}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {tipologiaSelecionada && (
        <Card variant="elevated">
          <CardContent className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-foreground">
                Itens do Plano {PACOTE_LABEL[tipologiaSelecionada.pacote?.abreviacao ?? ""] ?? tipologiaSelecionada.descricao}
              </h3>
              <Badge variant="secondary">
                {tipologiaSelecionada.tipo_letra} · {tipologiaSelecionada.num_hospedes} hóspedes
              </Badge>
            </div>

            {/* Gallery — above product list */}
            <RenderGallery
              empreendimentoCodigo={tipologiaSelecionada.empreendimento_codigo}
              pacoteCodigo={tipologiaSelecionada.pacote?.codigo ?? tipologiaSelecionada.pacote_codigo}
              nomePacote={PACOTE_LABEL[tipologiaSelecionada.pacote?.abreviacao ?? ""] ?? tipologiaSelecionada.descricao}
            />

            {/* Separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Itens incluídos
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Product list */}
            <ProductList tipologiaCodigo={tipologiaSelecionada.codigo} />

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-border">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setCurrentStep(2)}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Avançar com este plano
              </Button>
              <Button variant="coral" size="lg" className="flex-1" onClick={nextStep}>
                <Settings2 className="w-4 h-4 mr-2" />
                Personalizar itens
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
