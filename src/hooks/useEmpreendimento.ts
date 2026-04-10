import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Empreendimento {
  id: number;
  codigo: number;
  descricao: string;
  cidade: string | null;
  estado: string | null;
  data_entrega: string | null;
}

export function useEmpreendimento(codigo: number | null) {
  return useQuery<Empreendimento | null>({
    queryKey: ['empreendimento', codigo],
    enabled: codigo !== null,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empreendimento')
        .select('id, codigo, descricao, cidade, estado, data_entrega')
        .eq('codigo', codigo!)
        .single();
      if (error) throw error;
      return data as Empreendimento;
    },
  });
}
