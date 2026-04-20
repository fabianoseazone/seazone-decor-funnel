import { useEffect } from 'react';
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

  // Preload images in all sizes used across the funnel so they're ready before the user navigates
  useEffect(() => {
    if (!data) return;
    data.forEach(p => {
      const raw = (p.produto as any)?.imagem_url as string | null | undefined;
      if (!raw) return;
      const match = raw.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (!match) return;
      const id = match[1];
      ['w120', 'w200'].forEach(sz => {
        const img = new Image();
        img.src = `https://drive.google.com/thumbnail?id=${id}&sz=${sz}`;
      });
    });
  }, [data]);

  return {
    ...query,
    produtosPadrao:     data?.filter(p => !p.item_adicional) ?? [],
    produtosAdicionais: data?.filter(p =>  p.item_adicional) ?? [],
  };
}
