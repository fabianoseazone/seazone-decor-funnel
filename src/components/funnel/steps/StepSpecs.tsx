import { useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, Search, ImageOff, ChevronDown, ChevronRight as ChevronRightIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFunnel } from "@/contexts/FunnelContext";
import { useProdutosTipologia } from "@/hooks/useProdutosTipologia";
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

function getDriveImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w200`;
  return url;
}

export function StepSpecs() {
  const {
    tipologiaSelecionada,
    removidos,
    adicionados,
    swaps,
    nextStep,
    prevStep,
  } = useFunnel();

  const [search, setSearch] = useState("");
  const [closedGroups, setClosedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (key: string) => {
    setClosedGroups(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const tipologiaCodigo = tipologiaSelecionada?.codigo ?? null;
  const { produtosPadrao, produtosAdicionais, isLoading } = useProdutosTipologia(tipologiaCodigo);

  // Apply swaps and filter removed items
  const activeItems = useMemo(() =>
    produtosPadrao
      .filter(p => !removidos.has(p.produto_codigo))
      .map(p => swaps.has(p.produto_codigo)
        ? { ...p, ...swaps.get(p.produto_codigo)!, _originalCodigo: p.produto_codigo }
        : p
      ),
    [produtosPadrao, removidos, swaps]
  );

  const adicionadosList = useMemo(() =>
    produtosAdicionais.filter(p => adicionados.has(p.produto_codigo)),
    [produtosAdicionais, adicionados]
  );

  const allItems: (ProdutoTipologia & { _secao?: string })[] = [
    ...activeItems.map(i => ({ ...i, _secao: "Itens do Plano" })),
    ...adicionadosList.map(i => ({ ...i, _secao: "Itens Adicionais" })),
  ];

  const filtered = search.trim()
    ? allItems.filter(i => i.produto?.nome?.toLowerCase().includes(search.toLowerCase()))
    : allItems;

  // Group by subcategoria
  const groups = filtered.reduce<Record<string, typeof filtered>>((acc, item) => {
    const key = item.produto?.subcategoria_codigo ?? item.produto?.categoria_codigo ?? "Outros";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const subtotalProdutos = allItems.reduce(
    (sum, p) => sum + (p.valor_unitario ?? 0) * (p.quantidade ?? 1), 0
  );
  const decorValor = tipologiaSelecionada?.decor_valor ?? 0;
  const admPercent = (tipologiaSelecionada?.adm_percent ?? 0) / 100;
  const admValor = admPercent * subtotalProdutos;
  const total = subtotalProdutos + decorValor + admValor;

  const pacoteNome = tipologiaSelecionada?.descricao ?? "Plano";
  const tipoLetra = tipologiaSelecionada?.tipo_letra ?? "";

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="text-center">
        <Badge variant="coral" className="mb-3">Memorial Descritivo</Badge>
        <h2 className="text-3xl font-display font-bold text-foreground mb-1">
          Resumo do Pedido
        </h2>
        <p className="text-muted-foreground text-sm">
          Confira todos os itens incluídos no seu plano antes de prosseguir
        </p>
      </div>

      {/* Nota fiscal card */}
      <Card variant="elevated" className="overflow-hidden">
        {/* Invoice header */}
        <div className="bg-seazone-navy px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-primary-foreground/60 text-xs uppercase tracking-wider font-semibold">Plano selecionado</p>
            <p className="text-primary-foreground font-display font-bold text-xl">{pacoteNome}</p>
            {tipoLetra && (
              <p className="text-primary-foreground/60 text-sm">Tipologia {tipoLetra}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-primary-foreground/60 text-xs uppercase tracking-wider font-semibold">Total de itens</p>
            <p className="text-seazone-coral font-bold text-2xl">{allItems.length}</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Column headers */}
        <div className="px-6 py-2 grid grid-cols-[48px_1fr_60px] gap-3 border-b border-border bg-secondary/40">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider"></span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Produto</span>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Qtd</span>
        </div>

        {/* Items grouped by subcategoria */}
        <div className="divide-y divide-border/50">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-seazone-coral border-t-transparent rounded-full animate-spin" />
            </div>
          ) : Object.keys(groups).length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Nenhum item encontrado.
            </div>
          ) : (
            Object.entries(groups).map(([categoria, items]) => {
              const isOpen = !closedGroups.has(categoria);
              const nomeGrupo = SUBCATEGORIA_NOME[categoria] ?? categoria;
              return (
                <div key={categoria}>
                  {/* Category header — clickable to toggle */}
                  <button
                    onClick={() => toggleGroup(categoria)}
                    className="w-full px-6 py-2.5 bg-secondary/20 hover:bg-secondary/40 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-seazone-coral uppercase tracking-wider">
                        {nomeGrupo}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {items.length} {items.length === 1 ? "item" : "itens"}
                      </span>
                    </div>
                    {isOpen
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      : <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                    }
                  </button>
                  {/* Rows */}
                  {isOpen && items.map((item: any) => {
                    const imgUrl = getDriveImageUrl(item.produto?.imagem_url);
                    const qty = item.quantidade ?? 1;
                    const isSwapped = swaps.has(item._originalCodigo ?? item.produto_codigo);
                    const isAdded = item._secao === "Itens Adicionais";

                    return (
                      <div
                        key={item.id}
                        className="px-6 py-3 grid grid-cols-[48px_1fr_60px] gap-3 items-center hover:bg-secondary/20 transition-colors"
                      >
                        {/* Image */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex items-center justify-center flex-shrink-0">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={item.produto?.nome ?? ""}
                              className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                          ) : (
                            <ImageOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>

                        {/* Name + badges */}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground leading-snug truncate">
                            {item.produto?.nome ?? `Produto ${item.produto_codigo}`}
                          </p>
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {isSwapped && <Badge variant="coral" className="text-[10px] py-0">Personalizado</Badge>}
                            {isAdded && <Badge variant="secondary" className="text-[10px] py-0">Adicional</Badge>}
                          </div>
                        </div>

                        {/* Qty */}
                        <span className="text-sm font-semibold text-foreground text-center">
                          {qty}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-border bg-secondary/30 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-bold text-foreground text-base">Total Decor Lucrativo</span>
              <p className="text-xs text-muted-foreground">{allItems.length} itens</p>
            </div>
            <span className="font-bold text-seazone-coral text-xl">
              R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4">
        <Button variant="outline" size="lg" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
        <Button variant="coral" size="lg" onClick={nextStep}>
          Ver Condições Comerciais <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
