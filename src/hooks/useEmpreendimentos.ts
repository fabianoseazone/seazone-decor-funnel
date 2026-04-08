import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Empreendimento } from '@/types/catalog';

export function useEmpreendimentos() {
  return useQuery<Empreendimento[]>({
    queryKey: ['empreendimentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empreendimento')
        .select('id, codigo, descricao, cidade, estado')
        .order('descricao');
      if (error) throw error;
      return data as Empreendimento[];
    },
  });
}
