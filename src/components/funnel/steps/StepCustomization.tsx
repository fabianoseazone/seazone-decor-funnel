import { useState, useCallback } from "react";
import { Check, Plus, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useFunnel } from "@/contexts/FunnelContext";
import { useProdutosTipologia } from "@/hooks/useProdutosTipologia";
import type { ProdutoTipologia } from "@/types/catalog";

export function StepCustomization() {
  const { tipologiaSelecionada, nextStep, prevStep } = useFunnel();
  const [extras, setExtras] = useState<Set<number>>(new Set());

  const tipologiaCodigo = tipologiaSelecionada?.codigo ?? null;
  const { produtosPadrao, produtosAdicionais, isLoading } = useProdutosTipologia(tipologiaCodigo);

  const toggleExtra = useCallback((produtoCodigo: number) => {
    setExtras(prev => {
      const next = new Set(prev);
      next.has(produtoCodigo) ? next.delete(produtoCodigo) : next.add(produtoCodigo);
      return next;
    });
  }, []);

  const calcTotal = () => {
    const padrao = produtosPadrao.reduce(
      (sum, p) => sum + (p.valor_unitario ?? 0) * (p.quantidade ?? 1), 0
    );
    const adicional = produtosAdicionais
      .filter(p => extras.has(p.produto_codigo))
      .reduce((sum, p) => sum + (p.valor_unitario ?? 0) * (p.quantidade ?? 1), 0);
    const subtotal = padrao + adicional;
    const decorValor = tipologiaSelecionada?.decor_valor ?? 3000;
    const admPercent = (tipologiaSelecionada?.adm_percent ?? 13) / 100;
    return {
      subtotal,
      decorValor,
      admValor: admPercent * subtotal,
      total: subtotal + decorValor + admPercent * subtotal,
    };
  };

  const { subtotal, decorValor, admValor, total } = calcTotal();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-seazone-coral" />
      </div>
    );
  }

  const renderProduct = (item: ProdutoTipologia, isExtra: boolean) => {
    const selected = isExtra ? extras.has(item.produto_codigo) : true;
    const categoria = item.produto?.subcategoria_codigo ?? item.produto?.categoria_codigo;
    return (
      <Card
        key={item.id}
        variant={selected ? "selected" : "elevated"}
        className={`transition-all duration-200 ${isExtra ? "cursor-pointer" : ""}`}
        onClick={isExtra ? () => toggleExtra(item.produto_codigo) : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {item.produto?.imagem_url ? (
              <img
                src={item.produto.imagem_url}
                alt={item.produto.nome}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-secondary flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-foreground truncate">
                  {item.produto?.nome ?? `Produto ${item.produto_codigo}`}
                </h4>
                {isExtra ? (
                  <Switch
                    checked={selected}
                    onCheckedChange={() => toggleExtra(item.produto_codigo)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Badge variant="secondary" className="text-xs">Incluído</Badge>
                )}
              </div>
              {item.produto?.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.produto.descricao}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Qtd: {item.quantidade}{categoria ? ` · ${categoria}` : ""}
                </span>
                <span className={`font-bold text-sm ${
                  isExtra && selected ? "text-seazone-coral" : "text-foreground"
                }`}>
                  R$ {((item.valor_unitario ?? 0) * (item.quantidade ?? 1)).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 pb-48">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          Produtos do Plano
        </h2>
        <p className="text-muted-foreground">
          Itens incluídos e opções de personalização para sua unidade
        </p>
      </div>

      {produtosPadrao.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-seazone-success" />
            Itens Incluídos ({produtosPadrao.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {produtosPadrao.map(item => renderProduct(item, false))}
          </div>
        </div>
      )}

      {produtosAdicionais.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-seazone-coral" />
            Itens Adicionais ({extras.size} selecionados)
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {produtosAdicionais.map(item => renderProduct(item, true))}
          </div>
        </div>
      )}

      <Card variant="navy" className="fixed bottom-0 left-0 right-0 z-50 rounded-none">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 container mx-auto max-w-7xl">
            <div className="space-y-1 text-sm">
              <div className="flex gap-6">
                <span className="text-primary-foreground/60">Produtos:</span>
                <span className="text-primary-foreground font-medium">
                  R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex gap-6">
                <span className="text-primary-foreground/60">Decor:</span>
                <span className="text-primary-foreground font-medium">
                  R$ {decorValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex gap-6">
                <span className="text-primary-foreground/60">
                  Adm ({tipologiaSelecionada?.adm_percent ?? 13}%):
                </span>
                <span className="text-primary-foreground font-medium">
                  R$ {admValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex gap-6 border-t border-primary-foreground/20 pt-1">
                <span className="text-primary-foreground/60 font-semibold">Total:</span>
                <span className="text-2xl font-bold text-seazone-coral">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
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
