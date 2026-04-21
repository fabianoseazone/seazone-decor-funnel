import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { ProdutoTipologia } from '@/types/catalog';

interface UseProdutosTipologiaResult {
  data: ProdutoTipologia[] | undefined;
  produtosPadrao: ProdutoTipologia[];
  produtosAdicionais: ProdutoTipologia[];
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | null;
}

export function useProdutosTipologia(tipologiaCodigo: number | null): UseProdutosTipologiaResult {
  const query = useQuery<ProdutoTipologia[]>({
    queryKey: ['produtos-tipologia', tipologiaCodigo],
    enabled: tipologiaCodigo !== null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produto_tipologia')
        .select(`
          id,
          tipologia_codigo,
          produto_codigo,
          quantidade,
          valor_unitario,
          item_adicional,
          produto:produto_codigo (
            id, codigo, nome, descricao,
            categoria_codigo, subcategoria_codigo, valor, imagem_url,
            grupo_substituicao_codigo
          )
        `)
        .eq('tipologia_codigo', tipologiaCodigo!)
        .order('subcategoria_codigo');
      if (error) throw error;
      return data as ProdutoTipologia[];
    },
  });

  const data = query.data;

  // Stable references — prevents useEffect dependency loops in consumers
  const produtosPadrao = useMemo(() => data?.filter(p => !p.item_adicional) ?? [], [data]);
  const produtosAdicionais = useMemo(() => data?.filter(p => p.item_adicional) ?? [], [data]);

  return {
    ...query,
    produtosPadrao,
    produtosAdicionais,
  };
}
