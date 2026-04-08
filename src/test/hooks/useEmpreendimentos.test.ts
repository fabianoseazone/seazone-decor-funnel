import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useEmpreendimentos } from '@/hooks/useEmpreendimentos';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: 1, codigo: 100, descricao: 'Itacaré Spot', cidade: 'Itacaré', estado: 'BA' },
            { id: 2, codigo: 101, descricao: 'Lagoa Spot', cidade: 'Florianópolis', estado: 'SC' },
          ],
          error: null,
        }),
      }),
    }),
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('useEmpreendimentos', () => {
  it('returns list of empreendimentos', async () => {
    const { result } = renderHook(() => useEmpreendimentos(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data![0].descricao).toBe('Itacaré Spot');
  });
});
