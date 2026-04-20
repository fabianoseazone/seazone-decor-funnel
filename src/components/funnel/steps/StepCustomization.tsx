import { useState, useCallback, useEffect, useMemo } from "react";
import { ArrowRight, ArrowLeft, Loader2, RefreshCw, X, Search, ArrowLeftRight, Trash2, Plus, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useFunnel } from "@/contexts/FunnelContext";
import { useProdutosTipologia } from "@/hooks/useProdutosTipologia";
import { useProdutosSubstitutos } from "@/hooks/useProdutosSubstitutos";
import type { ProdutoTipologia } from "@/types/catalog";

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

/** Converts a Google Drive view/share URL to a displayable thumbnail URL. */
function getDriveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return url; // not a Drive URL, return as-is
  return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`;
}

// ─── Substitution Sheet ──────────────────────────────────────────────────────

function SubstitutionSheet({
  item,
  open,
  onClose,
  substitutos,
  loadingSubstitutos,
  currentSwap,
  onSwap,
  onClearSwap,
}: {
  item: ProdutoTipologia | null;
  open: boolean;
  onClose: () => void;
  substitutos: ProdutoTipologia[];
  loadingSubstitutos: boolean;
  currentSwap: ProdutoTipologia | undefined;
  onSwap: (newItem: ProdutoTipologia) => void;
  onClearSwap: () => void;
}) {
  const [search, setSearch] = useState("");

  useEffect(() => { if (open) setSearch(""); }, [open]);

  if (!item) return null;

  const currentItem = currentSwap ?? item;
  const currentPrice = (currentItem.valor_unitario ?? 0) * (currentItem.quantidade ?? 1);

  // Show alternatives from the same grupo_substituicao_codigo (fallback to subcategoria/categoria)
  const targetGrupo = item.produto?.grupo_substituicao_codigo;
  const targetSub = item.produto?.subcategoria_codigo;
  const targetCat = item.produto?.categoria_codigo;

  const alternatives = substitutos.filter(s => {
    if (s.produto_codigo === currentItem.produto_codigo) return false;
    if (targetGrupo != null) {
      // Primary: must be in the same substitution group
      if (s.produto?.grupo_substituicao_codigo !== targetGrupo) return false;
    } else if (targetSub) {
      if (s.produto?.subcategoria_codigo !== targetSub) return false;
    } else if (targetCat) {
      if (s.produto?.categoria_codigo !== targetCat) return false;
    }
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.produto?.nome?.toLowerCase().includes(q);
  });

  const renderAlt = (alt: ProdutoTipologia) => {
    const imgUrl = getDriveImageUrl(alt.produto?.imagem_url);
    return (
      <div
        key={alt.id}
        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-seazone-coral/50 hover:bg-seazone-coral/5 cursor-pointer transition-all group"
        onClick={() => { onSwap(alt); onClose(); }}
      >
        {imgUrl ? (
          <img src={imgUrl} alt={alt.produto?.nome ?? ""} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-secondary flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{alt.produto?.nome}</p>
          {alt.quantidade > 1 && (
            <p className="text-xs text-muted-foreground">Qtd: {alt.quantidade}</p>
          )}
        </div>
        <ArrowLeftRight className="w-5 h-5 text-muted-foreground group-hover:text-seazone-coral transition-colors flex-shrink-0" />
      </div>
    );
  };

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="font-display">Trocar produto</SheetTitle>
        </SheetHeader>

        {/* Current item */}
        <div className="mb-4 p-4 rounded-xl bg-secondary/60 border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Item atual</p>
          <div className="flex items-center gap-4">
            {currentItem.produto?.imagem_url ? (
              <img src={getDriveImageUrl(currentItem.produto.imagem_url)!} alt={currentItem.produto?.nome} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-muted flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground">{currentItem.produto?.nome}</p>
              {currentItem.quantidade > 1 && (
                <p className="text-sm text-muted-foreground">Qtd: {currentItem.quantidade}</p>
              )}
            </div>
            {currentSwap && (
              <Button variant="ghost" size="sm" onClick={onClearSwap} className="text-muted-foreground flex-shrink-0">
                <X className="w-4 h-4 mr-1" /> Desfazer
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loadingSubstitutos ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-seazone-coral" />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-bold text-seazone-coral uppercase tracking-wider mb-3">
              Alternativas disponíveis
            </p>
            {alternatives.length > 0
              ? alternatives.map(renderAlt)
              : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Nenhuma alternativa encontrada nesta categoria.
                </p>
              )
            }
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── StepCustomization ───────────────────────────────────────────────────────

export function StepCustomization() {
  const {
    tipologiaSelecionada,
    nextStep,
    prevStep,
    removidos,
    toggleRemovido,
    adicionados,
    toggleAdicionado,
    swaps,
    setSwap,
    clearSwap,
    setSubtotalProdutos,
  } = useFunnel();

  const [selectedItem, setSelectedItem] = useState<ProdutoTipologia | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const tipologiaCodigo = tipologiaSelecionada?.codigo ?? null;
  const empCodigo = tipologiaSelecionada?.empreendimento_codigo ?? null;
  const tipoLetra = tipologiaSelecionada?.tipo_letra ?? null;

  const { produtosPadrao, produtosAdicionais, isLoading } = useProdutosTipologia(tipologiaCodigo);
  const { data: substitutos = [], isLoading: loadingSubstitutos } = useProdutosSubstitutos(empCodigo, tipoLetra);

  // Active standard items: not removed, with swaps applied
  const activeItems = useMemo(() =>
    produtosPadrao
      .filter(p => !removidos.has(p.produto_codigo))
      .map(p => swaps.has(p.produto_codigo) ? { ...p, ...swaps.get(p.produto_codigo)!, _originalCodigo: p.produto_codigo } : p),
    [produtosPadrao, removidos, swaps]
  );

  // Removed standard items (for restore section)
  const removidosList = useMemo(() =>
    produtosPadrao.filter(p => removidos.has(p.produto_codigo)),
    [produtosPadrao, removidos]
  );

  // Added optional items
  const adicionadosList = useMemo(() =>
    produtosAdicionais.filter(p => adicionados.has(p.produto_codigo)),
    [produtosAdicionais, adicionados]
  );

  // Subtotal → context (for header): active standard + added optional
  const subtotal = useMemo(() => {
    const stdTotal = activeItems.reduce((sum, p) => sum + (p.valor_unitario ?? 0) * (p.quantidade ?? 1), 0);
    const addTotal = adicionadosList.reduce((sum, p) => sum + (p.valor_unitario ?? 0) * (p.quantidade ?? 1), 0);
    return stdTotal + addTotal;
  }, [activeItems, adicionadosList]);

  useEffect(() => { setSubtotalProdutos(subtotal); }, [subtotal, setSubtotalProdutos]);

  const decorValor = tipologiaSelecionada?.decor_valor ?? 0;
  const admPercent = (tipologiaSelecionada?.adm_percent ?? 0) / 100;
  const seazoneBilling = decorValor + admPercent * subtotal;
  const total = subtotal + seazoneBilling * 1.1433;

  const openSwap = useCallback((item: ProdutoTipologia) => {
    setSelectedItem(item);
    setSheetOpen(true);
  }, []);

  const handleSwap = useCallback((newItem: ProdutoTipologia) => {
    if (!selectedItem) return;
    const originalCodigo = (selectedItem as any)._originalCodigo ?? selectedItem.produto_codigo;
    setSwap(originalCodigo, newItem);
  }, [selectedItem, setSwap]);

  const handleClearSwap = useCallback(() => {
    if (!selectedItem) return;
    const originalCodigo = (selectedItem as any)._originalCodigo ?? selectedItem.produto_codigo;
    clearSwap(originalCodigo);
    setSheetOpen(false);
  }, [selectedItem, clearSwap]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-seazone-coral" />
      </div>
    );
  }

  // Group active items by subcategoria
  const groups = activeItems.reduce<Record<string, typeof activeItems>>((acc, p) => {
    const key = (p as any).produto?.subcategoria_codigo ?? (p as any).produto?.categoria_codigo ?? "Outros";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});

  const currentSwapForSelected = selectedItem
    ? swaps.get((selectedItem as any)._originalCodigo ?? selectedItem.produto_codigo)
    : undefined;

  return (
    <div className="space-y-6 pb-48">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          Personalizar Produtos
        </h2>
        <p className="text-muted-foreground">
          Clique em qualquer item para trocar por uma alternativa
        </p>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Badge variant="secondary">{activeItems.length} itens incluídos</Badge>
        {removidosList.length > 0 && <Badge variant="outline">{removidosList.length} removido{removidosList.length > 1 ? "s" : ""}</Badge>}
        {adicionadosList.length > 0 && <Badge variant="coral">+{adicionadosList.length} adicionado{adicionadosList.length > 1 ? "s" : ""}</Badge>}
        {swaps.size > 0 && <Badge variant="coral">{swaps.size} substituído{swaps.size > 1 ? "s" : ""}</Badge>}
      </div>

      {/* Active product groups */}
      {Object.entries(groups).map(([categoria, items]) => (
        <div key={categoria} className="space-y-3">
          <h3 className="text-xs font-bold text-seazone-coral uppercase tracking-wider">
            {SUBCATEGORIA_NOME[categoria] ?? categoria}
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {items.map((item: any) => {
              const isSwapped = swaps.has(item._originalCodigo ?? item.produto_codigo);
              return (
                <Card key={item.id} variant="elevated" className="hover:border-seazone-coral/40 transition-all group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 cursor-pointer" onClick={() => openSwap(item)}>
                        {item.produto?.imagem_url ? (
                          <img src={getDriveImageUrl(item.produto.imagem_url)!} alt={item.produto.nome} className="w-20 h-20 rounded-xl object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-secondary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-0.5">
                          <p className="font-semibold text-foreground text-sm leading-tight flex-1">
                            {item.produto?.nome ?? `Produto ${item.produto_codigo}`}
                          </p>
                          {isSwapped && <Badge variant="coral" className="text-[10px] flex-shrink-0">Personalizado</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">Qtd: {item.quantidade}</span>
                        {/* Actions below name */}
                        <div className="flex gap-1.5 mt-2">
                          <button
                            onClick={() => openSwap(item)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border hover:border-seazone-coral/50 hover:bg-seazone-coral/8 text-muted-foreground hover:text-seazone-coral transition-colors text-xs font-medium"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Trocar
                          </button>
                          <button
                            onClick={() => toggleRemovido(item._originalCodigo ?? item.produto_codigo)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border hover:border-destructive/40 hover:bg-destructive/8 text-muted-foreground hover:text-destructive transition-colors text-xs font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* Removed items — restore */}
      {removidosList.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Itens removidos</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {removidosList.map(item => (
              <Card key={item.id} variant="elevated" className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {item.produto?.imagem_url ? (
                      <img src={getDriveImageUrl(item.produto.imagem_url)!} alt={item.produto?.nome ?? ""} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 grayscale" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-secondary flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-through text-muted-foreground">
                        {item.produto?.nome ?? `Produto ${item.produto_codigo}`}
                      </p>
                      <p className="text-xs text-muted-foreground">Qtd: {item.quantidade}</p>
                    </div>
                    <button onClick={() => toggleRemovido(item.produto_codigo)} className="p-2 rounded-lg hover:bg-seazone-coral/10 text-muted-foreground hover:text-seazone-coral transition-colors flex-shrink-0" title="Restaurar">
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Optional items — add */}
      {produtosAdicionais.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-seazone-coral uppercase tracking-wider">Itens opcionais disponíveis</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {produtosAdicionais.map(item => {
              const isAdded = adicionados.has(item.produto_codigo);
              return (
                <Card key={item.id} variant="elevated" className={`transition-all ${isAdded ? "border-seazone-coral/40" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {item.produto?.imagem_url ? (
                        <img src={getDriveImageUrl(item.produto.imagem_url)!} alt={item.produto?.nome ?? ""} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-secondary flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground">{item.produto?.nome ?? `Produto ${item.produto_codigo}`}</p>
                        <p className="text-xs text-muted-foreground">Qtd: {item.quantidade}</p>
                      </div>
                      <button
                        onClick={() => toggleAdicionado(item.produto_codigo)}
                        className={`p-2.5 rounded-lg transition-colors flex-shrink-0 ${isAdded ? "bg-seazone-coral/10 text-seazone-coral hover:bg-destructive/10 hover:text-destructive" : "bg-secondary hover:bg-seazone-coral/10 text-muted-foreground hover:text-seazone-coral"}`}
                        title={isAdded ? "Remover" : "Adicionar"}
                      >
                        {isAdded ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Substitution Sheet */}
      <SubstitutionSheet
        item={selectedItem}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        substitutos={substitutos}
        loadingSubstitutos={loadingSubstitutos}
        currentSwap={currentSwapForSelected}
        onSwap={handleSwap}
        onClearSwap={handleClearSwap}
      />

      {/* Sticky bottom bar */}
      <Card variant="navy" className="fixed bottom-0 left-0 right-0 z-50 rounded-none">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 container mx-auto max-w-7xl">
            <div>
              <span className="text-primary-foreground/60 text-sm">Total estimado: </span>
              <span className="text-2xl font-bold text-seazone-coral">
                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex gap-3">
              <Button variant="glass" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
              <Button variant="coral" onClick={nextStep}>
                Continuar <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
