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
      // Deduplicate by apartamento_id — each unit may have one row per package
      const seen = new Set<string>();
      return (data as Apartamento[]).filter((a) => {
        if (seen.has(a.apartamento_id)) return false;
        seen.add(a.apartamento_id);
        return true;
      });
    },
  });
}
