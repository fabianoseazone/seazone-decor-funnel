import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProdutoTipologia } from '@/types/catalog';

export function useProdutosSubstitutos(
  empreendimentoCodigo: number | null,
  tipoLetra: string | null,
) {
  return useQuery<ProdutoTipologia[]>({
    queryKey: ['produtos-substitutos', empreendimentoCodigo, tipoLetra],
    enabled: empreendimentoCodigo !== null && tipoLetra !== null,
    queryFn: async () => {
      // 1. All tipologias with same empreendimento + tipo_letra (all packages)
      const { data: tipologias, error: tipErr } = await supabase
        .from('tipologia')
        .select('codigo')
        .eq('empreendimento_codigo', empreendimentoCodigo!)
        .eq('tipo_letra', tipoLetra!);

      if (tipErr) throw tipErr;
      const tipCodigos = (tipologias ?? []).map((t: any) => t.codigo);
      if (!tipCodigos.length) return [];

      // 2. All products across those tipologias
      const { data, error } = await supabase
        .from('produto_tipologia')
        .select(`
          id, tipologia_codigo, produto_codigo, quantidade, valor_unitario, item_adicional,
          produto:produto_codigo (
            id, codigo, nome, descricao,
            categoria_codigo, subcategoria_codigo, valor, imagem_url,
            grupo_substituicao_codigo
          )
        `)
        .in('tipologia_codigo', tipCodigos)
        .order('subcategoria_codigo');

      if (error) throw error;

      // 3. Deduplicate by produto_codigo — keep cheapest/first occurrence
      const seen = new Set<number>();
      return (data as ProdutoTipologia[]).filter(p => {
        if (seen.has(p.produto_codigo)) return false;
        seen.add(p.produto_codigo);
        return true;
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}
