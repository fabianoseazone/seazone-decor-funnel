# Design Spec — Página de Orçamento por Pacotes (Seazone Decor)

**Data:** 2026-04-08  
**Status:** Aprovado  
**Projeto:** `C:\Users\Fabiano\Downloads\Site`

---

## Objetivo

Substituir o simulador genérico ("Simular Investimento") por um fluxo real de orçamento, onde o proprietário seleciona seu empreendimento e unidade e visualiza os produtos reais do seu pacote — com possibilidade de personalização e cálculo de total em tempo real.

---

## Stack

- React + TypeScript + Vite (codebase existente)
- Supabase PostgreSQL (já configurado: projeto `qnkhsgbqnnjkbehxxdny`)
- shadcn/ui + Tailwind CSS
- Fonte de dados: Google Sheets Seazone (migração via script ETL)

---

## Modelo de Dados (Supabase)

Tabelas a criar via migration, populadas via script ETL das abas Google Sheets:

| Tabela Supabase     | Fonte Sheets         | Linhas aprox. |
|---------------------|----------------------|---------------|
| `empreendimento`    | db004_empreendimentos| 60            |
| `pacote`            | db005_pacotes        | 5             |
| `produto`           | db002_produtos       | ~40           |
| `tipologia`         | db007_tipologia      | 862           |
| `tipologia_apto`    | db012_tipxapt        | 6.072         |
| `produto_tipologia` | db009_prodxtip       | 92.372        |
| `apartamento`       | db010_aptos          | ~6.000        |

### Tabela `produto_tipologia` (chave do sistema)
```sql
produto_id      → produto.id
tipologia_id    → tipologia.id
quantidade      integer
valor_unitario  numeric
item_adicional  boolean  -- FALSE=padrão, TRUE=personalização
```

---

## Fluxo de Telas

### Tela 1 — Seleção de Unidade
**Componente:** `UnitSelector.tsx` (já existe, trocar mock por Supabase)

1. Dropdown: seleciona empreendimento (`empreendimento` table)
2. Dropdown dependente: lista unidades do empreendimento (`apartamento` filtrado por `empreendimento_id`)
3. Botão "Iniciar Configuração" → Tela 2

**Query de contexto:**
```
apartamento.id → tipologia_apto.tipologia_id → tipologia (tipo_letra, pacote_id, decor_valor, adm_percent)
```

### Tela 2 — Seleção de Pacote
**Componente:** `StepPackageSelection.tsx` (já existe, trocar mock por dados reais)

- Mostra apenas os pacotes disponíveis para a tipologia da unidade
- Cada card exibe: nome do pacote, total de itens, valor estimado
- "Ver Detalhes" abre drawer com lista de produtos do pacote

### Tela 2b — Lista de Produtos + Personalização
**Componente:** `StepCustomization.tsx` (já existe, trocar mock por Supabase)

- Lista produtos de `produto_tipologia` filtrados por `tipologia_id`
- Produtos padrão (`item_adicional=FALSE`): exibidos, não removíveis
- Produtos adicionais (`item_adicional=TRUE`): toggle add/remove
- Barra sticky com total atualizado em tempo real

**Cálculo do total:**
```
total_produtos = Σ (quantidade × valor_unitario) dos produtos selecionados
taxa_decor     = tipologia.decor_valor  (ex: R$3.000)
taxa_adm       = tipologia.adm_percent × total_produtos  (ex: 13%)
TOTAL          = total_produtos + taxa_decor + taxa_adm
```

---

## Componentes a Criar/Modificar

### Novos hooks (src/hooks/)
- `useEmpreendimentos.ts` — busca lista de empreendimentos
- `useUnidades.ts` — busca apartamentos por empreendimento_id
- `useTipologia.ts` — busca tipologia da unidade selecionada
- `useProdutosTipologia.ts` — busca produtos da tipologia

### Modificações em componentes existentes
- `UnitSelector.tsx` — substituir `mockSpots`/`mockUnits` pelos hooks reais
- `StepPackageSelection.tsx` — substituir `packagesData` pelos pacotes da tipologia
- `StepCustomization.tsx` — substituir `customizationItems` pelos produtos reais
- `FunnelContext.tsx` — adicionar estado de tipologia, cálculo real de decor+adm

### Novos arquivos
- `supabase/migrations/001_catalog_tables.sql` — schema completo
- `scripts/etl_sheets_to_supabase.py` — importa Sheets → Supabase

---

## ETL (Google Sheets → Supabase)

Script Python que:
1. Lê cada aba do Google Sheets via Google Sheets API
2. Transforma e normaliza os dados (ex: extrai `tipo_letra` do campo `descricao` da tipologia)
3. Insere em lotes no Supabase via API REST

Execução: manual, sob demanda quando os dados no Sheets mudarem.

---

## Autenticação (fase 2 — não inclusa nesta entrega)

- Role `proprietario`: vê apenas seu apartamento (RLS por `apartamento_id`)
- Role `interno`: acesso a todos os empreendimentos
- Implementar após o fluxo funcionar com dados reais

---

## O que NÃO está no escopo desta entrega

- Persistir a seleção final do proprietário (db015/db016)
- Auth com roles
- Admin UI para editar catálogo
- Sync automático Sheets → Supabase
