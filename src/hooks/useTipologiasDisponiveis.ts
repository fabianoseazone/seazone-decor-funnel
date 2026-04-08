import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tipologia } from '@/types/catalog';

export function useTipologiasDisponiveis(tipologiaCodigo: number | null) {
  return useQuery<Tipologia[]>({
    queryKey: ['tipologias-disponiveis', tipologiaCodigo],
    enabled: tipologiaCodigo !== null,
    queryFn: async () => {
      const { data: base, error: e1 } = await supabase
        .from('tipologia')
        .select('empreendimento_codigo, tipo_letra')
        .eq('codigo', tipologiaCodigo!)
        .single();
      if (e1) throw e1;

      const { data, error: e2 } = await supabase
        .from('tipologia')
        .select('*, pacote:pacote_codigo(id, codigo, descricao, abreviacao)')
        .eq('empreendimento_codigo', base.empreendimento_codigo)
        .eq('tipo_letra', base.tipo_letra!)
        .order('pacote_codigo');
      if (e2) throw e2;
      return data as Tipologia[];
    },
  });
}
