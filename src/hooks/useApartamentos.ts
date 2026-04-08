import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Apartamento } from '@/types/catalog';

export function useApartamentos(empreendimentoCodigo: number | null) {
  return useQuery<Apartamento[]>({
    queryKey: ['apartamentos', empreendimentoCodigo],
    enabled: empreendimentoCodigo !== null,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('apartamento')
        .select('id, codigo, empreendimento_codigo, apartamento_id, tipologia_codigo')
        .eq('empreendimento_codigo', empreendimentoCodigo!)
        .order('apartamento_id');
      if (error) throw error;
      return data as Apartamento[];
    },
  });
}
