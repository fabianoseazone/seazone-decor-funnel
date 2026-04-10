import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EmpreendimentoRender {
  id: number;
  empreendimento_codigo: number;
  pacote_codigo: number;
  ordem: number;
  url: string;
}

export function useEmpreendimentoRenders(
  empreendimentoCodigo: number | null,
  pacoteCodigo: number | null,
) {
  return useQuery<EmpreendimentoRender[]>({
    queryKey: ['empreendimento-renders', empreendimentoCodigo, pacoteCodigo],
    enabled: empreendimentoCodigo !== null && pacoteCodigo !== null,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empreendimento_renders')
        .select('*')
        .eq('empreendimento_codigo', empreendimentoCodigo!)
        .eq('pacote_codigo', pacoteCodigo!)
        .order('ordem');
      if (error) throw error;
      return data as EmpreendimentoRender[];
    },
  });
}
