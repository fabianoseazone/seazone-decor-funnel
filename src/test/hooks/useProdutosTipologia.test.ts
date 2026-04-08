import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProdutosTipologia } from '@/hooks/useProdutosTipologia';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 1, tipologia_codigo: 12, produto_codigo: 6,
                quantidade: 1, valor_unitario: 300, item_adicional: false,
                produto: { id: 1, codigo: 6, nome: 'Cadeira', descricao: null,
                           categoria_codigo: '2.2', subcategoria_codigo: '2.2.10',
                           valor: 300, imagem_url: null },
              },
              {
                id: 2, tipologia_codigo: 12, produto_codigo: 29,
                quantidade: 1, valor_unitario: 400, item_adicional: true,
                produto: { id: 2, codigo: 29, nome: 'Poltrona', descricao: null,
                           categoria_codigo: '2.2', subcategoria_codigo: '2.2.8',
                           valor: 400, imagem_url: null },
              },
            ],
            error: null,
          }),
        }),
      }),
    }),
  },
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('useProdutosTipologia', () => {
  it('splits products by item_adicional', async () => {
    const { result } = renderHook(() => useProdutosTipologia(12), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.produtosPadrao).toHaveLength(1);
    expect(result.current.produtosAdicionais).toHaveLength(1);
    expect(result.current.produtosPadrao[0].produto?.nome).toBe('Cadeira');
  });

  it('is disabled when tipologiaCodigo is null', () => {
    const { result } = renderHook(() => useProdutosTipologia(null), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});
