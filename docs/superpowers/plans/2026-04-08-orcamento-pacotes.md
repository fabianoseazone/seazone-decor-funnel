# Orçamento por Pacotes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic "Simular Investimento" simulator with a real database-driven quoting flow where property owners select their unit and see/customize real products from their assigned package.

**Architecture:** The existing `/funnel` React route already has all UI components (UnitSelector, StepPackageSelection, StepCustomization) using hardcoded mock data. We create Supabase tables, seed them from Excel exports, then replace mock data with Supabase React Query hooks throughout.

**Tech Stack:** React 18 + TypeScript + Vite, Supabase (project `qnkhsgbqnnjkbehxxdny`), @tanstack/react-query, shadcn/ui, vitest + @testing-library/react

---

## File Map

**Create:**
- `package.json` — rename from `package (1).json`
- `.gitignore` — rename from `gitignore.txt`
- `.env` — from `env.txt` values
- `supabase/migrations/20260408000000_catalog_tables.sql` — DB schema
- `src/types/catalog.ts` — domain types for catalog tables
- `src/hooks/useEmpreendimentos.ts` — query empreendimentos
- `src/hooks/useApartamentos.ts` — query apartments by empreendimento
- `src/hooks/useTipologiasDisponiveis.ts` — all packages available for a unit's tipo_letra
- `src/hooks/useProdutosTipologia.ts` — products for a specific tipologia
- `src/test/hooks/useEmpreendimentos.test.ts` — hook unit tests
- `src/test/hooks/useProdutosTipologia.test.ts` — hook unit tests
- `scripts/seed_supabase.py` — ETL: Excel/CSV → Supabase

**Modify:**
- `src/integrationssupabase/types.ts` — add catalog table types
- `src/types/funnel.ts` — extend `Unit` with `tipologiaCodigo`
- `src/contexts/FunnelContext.tsx` — add tipologia state + real pricing
- `src/components/funnel/UnitSelector.tsx` — replace mockSpots/mockUnits
- `src/components/funnel/steps/StepPackageSelection.tsx` — replace packagesData
- `src/components/funnel/steps/StepCustomization.tsx` — replace customizationItems

---

## Task 1: Project Setup

**Files:**
- Create: `package.json` (rename from `package (1).json`)
- Create: `.gitignore` (rename from `gitignore.txt`)
- Create: `.env`

- [ ] **Step 1: Rename package files**

```bash
cd "C:/Users/Fabiano/Downloads/Site"
cp "package (1).json" package.json
cp gitignore.txt .gitignore
```

- [ ] **Step 2: Create .env file**

Create `.env` at project root:
```
VITE_SUPABASE_PROJECT_ID=qnkhsgbqnnjkbehxxdny
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFua2hzZ2Jxbm5qa2JlaHh4ZG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTQ1ODgsImV4cCI6MjA4NTk3MDU4OH0.aY6azaem5UP2W5281oiT2HrVoQno2d3v4kWFo2eaYCY
VITE_SUPABASE_URL=https://qnkhsgbqnnjkbehxxdny.supabase.co
```

- [ ] **Step 3: Install dependencies**

```bash
cd "C:/Users/Fabiano/Downloads/Site"
npm install
```

Expected: `node_modules` created, no errors.

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
```

Expected output includes: `Local: http://localhost:5173/`  
Open browser to `http://localhost:5173/funnel` — should see UnitSelector screen.

- [ ] **Step 5: Initialize git and commit**

```bash
cd "C:/Users/Fabiano/Downloads/Site"
git init
git add package.json .gitignore .env src public supabase vite.config.ts tsconfig*.json tailwind.config.ts postcss.config.js components.json index.html
git commit -m "chore: initial project setup from Lovable export"
```

---

## Task 2: Database Migration

**Files:**
- Create: `supabase/migrations/20260408000000_catalog_tables.sql`

- [ ] **Step 1: Write migration SQL**

Create `supabase/migrations/20260408000000_catalog_tables.sql`:

```sql
-- Empreendimentos (real estate developments)
CREATE TABLE IF NOT EXISTS empreendimento (
  id          SERIAL PRIMARY KEY,
  codigo      INTEGER UNIQUE NOT NULL,
  descricao   TEXT NOT NULL,
  endereco    TEXT,
  cidade      TEXT,
  estado      TEXT,
  cep         TEXT,
  quantidade_unidades INTEGER,
  data_entrega DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Packages (Essential, Plus, Premium, HD1, Ampliada)
CREATE TABLE IF NOT EXISTS pacote (
  id         SERIAL PRIMARY KEY,
  codigo     INTEGER UNIQUE NOT NULL,
  descricao  TEXT NOT NULL,
  abreviacao TEXT NOT NULL,  -- ES, PL, PR, HD1, AM
  ativo      BOOLEAN DEFAULT TRUE
);

-- Products catalog
CREATE TABLE IF NOT EXISTS produto (
  id                   SERIAL PRIMARY KEY,
  codigo               INTEGER UNIQUE NOT NULL,
  nome                 TEXT NOT NULL,
  descricao            TEXT,
  categoria_codigo     TEXT,
  subcategoria_codigo  TEXT,
  valor                NUMERIC(10,2),
  imagem_url           TEXT,
  link                 TEXT,
  ativo                BOOLEAN DEFAULT TRUE
);

-- Tipologia: one row per (empreendimento, tipo_letra, pacote) combination
CREATE TABLE IF NOT EXISTS tipologia (
  id                    SERIAL PRIMARY KEY,
  codigo                INTEGER UNIQUE NOT NULL,
  empreendimento_codigo INTEGER REFERENCES empreendimento(codigo),
  descricao             TEXT NOT NULL,
  tipo_letra            TEXT,          -- A, B, H, L, etc. (extracted from descricao)
  pacote_codigo         INTEGER REFERENCES pacote(codigo),
  num_hospedes          INTEGER,
  decor_tipo            TEXT,          -- 'absoluto' or 'percentual'
  decor_valor           NUMERIC(10,2),
  decor_percent         NUMERIC(5,2),
  adm_tipo              TEXT,
  adm_percent           NUMERIC(5,2),
  adm_valor             NUMERIC(10,2)
);

-- Apartments: each physical unit linked to its tipologia
CREATE TABLE IF NOT EXISTS apartamento (
  id                    SERIAL PRIMARY KEY,
  codigo                INTEGER UNIQUE NOT NULL,
  empreendimento_codigo INTEGER REFERENCES empreendimento(codigo),
  apartamento_id        TEXT NOT NULL,  -- unit number, e.g. "101", "A201"
  tipologia_codigo      INTEGER REFERENCES tipologia(codigo),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Product × Tipologia: the curated product list per tipologia
CREATE TABLE IF NOT EXISTS produto_tipologia (
  id                   SERIAL PRIMARY KEY,
  codigo               INTEGER,
  tipologia_codigo     INTEGER REFERENCES tipologia(codigo),
  produto_codigo       INTEGER REFERENCES produto(codigo),
  quantidade           NUMERIC(10,2) DEFAULT 1,
  categoria_codigo     TEXT,
  subcategoria_codigo  TEXT,
  valor_unitario       NUMERIC(10,2),
  item_adicional       BOOLEAN DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_apartamento_empreendimento ON apartamento(empreendimento_codigo);
CREATE INDEX IF NOT EXISTS idx_tipologia_empreendimento   ON tipologia(empreendimento_codigo);
CREATE INDEX IF NOT EXISTS idx_tipologia_tipo_letra       ON tipologia(tipo_letra);
CREATE INDEX IF NOT EXISTS idx_produto_tipologia_tip      ON produto_tipologia(tipologia_codigo);
CREATE INDEX IF NOT EXISTS idx_produto_tipologia_prod     ON produto_tipologia(produto_codigo);

-- Enable RLS (policies to be added later for auth)
ALTER TABLE empreendimento    ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacote            ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipologia         ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartamento       ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto_tipologia ENABLE ROW LEVEL SECURITY;

-- Temporary: allow anon read for development (remove before production)
CREATE POLICY "anon_read_empreendimento"    ON empreendimento    FOR SELECT USING (true);
CREATE POLICY "anon_read_pacote"            ON pacote            FOR SELECT USING (true);
CREATE POLICY "anon_read_produto"           ON produto           FOR SELECT USING (true);
CREATE POLICY "anon_read_tipologia"         ON tipologia         FOR SELECT USING (true);
CREATE POLICY "anon_read_apartamento"       ON apartamento       FOR SELECT USING (true);
CREATE POLICY "anon_read_produto_tipologia" ON produto_tipologia FOR SELECT USING (true);
```

- [ ] **Step 2: Apply migration via Supabase dashboard**

1. Open https://supabase.com/dashboard/project/qnkhsgbqnnjkbehxxdny/sql/new
2. Paste the entire SQL from the file above
3. Click **Run**
4. Expected: "Success. No rows returned."

- [ ] **Step 3: Verify tables exist**

In Supabase SQL editor, run:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected output includes: `apartamento`, `empreendimento`, `pacote`, `produto`, `produto_tipologia`, `tipologia`, `simulator_leads`.

- [ ] **Step 4: Commit migration**

```bash
cd "C:/Users/Fabiano/Downloads/Site"
git add supabase/migrations/20260408000000_catalog_tables.sql
git commit -m "feat: add catalog tables migration to Supabase"
```

---

## Task 3: TypeScript Catalog Types

**Files:**
- Create: `src/types/catalog.ts`
- Modify: `src/integrationssupabase/types.ts`

- [ ] **Step 1: Create catalog domain types**

Create `src/types/catalog.ts`:

```typescript
export interface Empreendimento {
  id: number;
  codigo: number;
  descricao: string;
  cidade: string | null;
  estado: string | null;
}

export interface Pacote {
  id: number;
  codigo: number;
  descricao: string;
  abreviacao: string;
}

export interface Produto {
  id: number;
  codigo: number;
  nome: string;
  descricao: string | null;
  categoria_codigo: string | null;
  subcategoria_codigo: string | null;
  valor: number | null;
  imagem_url: string | null;
}

export interface Tipologia {
  id: number;
  codigo: number;
  empreendimento_codigo: number;
  descricao: string;
  tipo_letra: string | null;
  pacote_codigo: number | null;
  decor_tipo: string | null;
  decor_valor: number | null;
  decor_percent: number | null;
  adm_percent: number | null;
}

export interface Apartamento {
  id: number;
  codigo: number;
  empreendimento_codigo: number;
  apartamento_id: string;
  tipologia_codigo: number | null;
}

export interface ProdutoTipologia {
  id: number;
  tipologia_codigo: number;
  produto_codigo: number;
  quantidade: number;
  valor_unitario: number | null;
  item_adicional: boolean;
  produto: Produto | null;
}
```

- [ ] **Step 2: Add catalog tables to Supabase types**

In `src/integrationssupabase/types.ts`, replace the entire `Tables` section inside `public` with the following (keep everything else the same — only add the new tables before `simulator_leads`):

```typescript
      empreendimento: {
        Row: {
          id: number
          codigo: number
          descricao: string
          cidade: string | null
          estado: string | null
          endereco: string | null
          cep: string | null
          quantidade_unidades: number | null
          data_entrega: string | null
          created_at: string
        }
        Insert: {
          codigo: number
          descricao: string
          cidade?: string | null
          estado?: string | null
          endereco?: string | null
          cep?: string | null
          quantidade_unidades?: number | null
          data_entrega?: string | null
        }
        Update: Partial<{
          descricao: string
          cidade: string | null
          estado: string | null
        }>
        Relationships: []
      }
      pacote: {
        Row: {
          id: number
          codigo: number
          descricao: string
          abreviacao: string
          ativo: boolean
        }
        Insert: { codigo: number; descricao: string; abreviacao: string; ativo?: boolean }
        Update: Partial<{ descricao: string; abreviacao: string; ativo: boolean }>
        Relationships: []
      }
      produto: {
        Row: {
          id: number
          codigo: number
          nome: string
          descricao: string | null
          categoria_codigo: string | null
          subcategoria_codigo: string | null
          valor: number | null
          imagem_url: string | null
          link: string | null
          ativo: boolean
        }
        Insert: { codigo: number; nome: string; [key: string]: unknown }
        Update: Partial<{ nome: string; valor: number | null }>
        Relationships: []
      }
      tipologia: {
        Row: {
          id: number
          codigo: number
          empreendimento_codigo: number | null
          descricao: string
          tipo_letra: string | null
          pacote_codigo: number | null
          num_hospedes: number | null
          decor_tipo: string | null
          decor_valor: number | null
          decor_percent: number | null
          adm_tipo: string | null
          adm_percent: number | null
          adm_valor: number | null
        }
        Insert: { codigo: number; descricao: string; [key: string]: unknown }
        Update: Partial<{ tipo_letra: string | null; pacote_codigo: number | null }>
        Relationships: []
      }
      apartamento: {
        Row: {
          id: number
          codigo: number
          empreendimento_codigo: number | null
          apartamento_id: string
          tipologia_codigo: number | null
          created_at: string
        }
        Insert: { codigo: number; apartamento_id: string; [key: string]: unknown }
        Update: Partial<{ tipologia_codigo: number | null }>
        Relationships: []
      }
      produto_tipologia: {
        Row: {
          id: number
          codigo: number | null
          tipologia_codigo: number | null
          produto_codigo: number | null
          quantidade: number | null
          categoria_codigo: string | null
          subcategoria_codigo: string | null
          valor_unitario: number | null
          item_adicional: boolean | null
          created_at: string
        }
        Insert: { tipologia_codigo: number; produto_codigo: number; [key: string]: unknown }
        Update: Partial<{ quantidade: number; valor_unitario: number | null }>
        Relationships: []
      }
```

- [ ] **Step 3: Commit**

```bash
git add src/types/catalog.ts src/integrationssupabase/types.ts
git commit -m "feat: add TypeScript types for catalog tables"
```

---

## Task 4: Python Seed Script

**Files:**
- Create: `scripts/seed_supabase.py`
- Create: `scripts/requirements.txt`

- [ ] **Step 1: Create requirements.txt**

Create `scripts/requirements.txt`:
```
openpyxl==3.1.2
requests==2.31.0
```

- [ ] **Step 2: Install Python dependencies**

```bash
pip install -r scripts/requirements.txt
```

- [ ] **Step 3: Create seed script**

Create `scripts/seed_supabase.py`:

```python
"""
Seed Supabase catalog tables from Excel exports.

Excel files expected in C:/Users/Fabiano/Downloads/:
  - Empreendimentos.xlsx
  - Pacotes.xlsx
  - Produtos.xlsx
  - Tipologia.xlsx
  - Tipologia Apto.xlsx   (tipologia_apto linkage)

For produto_tipologia (db009_prodxtip, 92K rows):
  Export from Google Sheets as CSV to C:/Users/Fabiano/Downloads/prodxtip.csv
  Columns: codigo,tipologiaCodigo,produtoCodigo,quantidade,categoriaCodigo,
           subcategoriaCodigo,valorUnitario,itemAdicional,dataAtualizacao,dataCadastro

Run: python scripts/seed_supabase.py
"""
import re
import sys
import json
import requests
import openpyxl
import csv
from pathlib import Path

SUPABASE_URL = "https://qnkhsgbqnnjkbehxxdny.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFua2hzZ2Jxbm5qa2JlaHh4ZG55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTQ1ODgsImV4cCI6MjA4NTk3MDU4OH0.aY6azaem5UP2W5281oiT2HrVoQno2d3v4kWFo2eaYCY"
DOWNLOADS = Path("C:/Users/Fabiano/Downloads")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",
}

PACOTE_ABREV_TO_CODE = {"ES": 1, "PL": 2, "PR": 3, "HD1": 4, "AM": 5}

def upsert(table: str, rows: list[dict]) -> None:
    """Upsert rows into a Supabase table in batches of 500."""
    if not rows:
        print(f"  [skip] {table}: no rows")
        return
    batch_size = 500
    total = 0
    for i in range(0, len(rows), batch_size):
        batch = rows[i:i + batch_size]
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/{table}",
            headers=HEADERS,
            data=json.dumps(batch),
        )
        if resp.status_code not in (200, 201):
            print(f"  [error] {table} batch {i}: {resp.status_code} {resp.text[:200]}")
            sys.exit(1)
        total += len(batch)
    print(f"  [ok] {table}: {total} rows upserted")


def read_xlsx(path: Path) -> tuple[list[str], list[list]]:
    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    headers = [str(h).strip() if h else "" for h in rows[0]]
    return headers, rows[1:]


def to_float(val) -> float | None:
    if val is None or str(val).strip() == "":
        return None
    try:
        return float(str(val).replace(",", "."))
    except ValueError:
        return None


def to_int(val) -> int | None:
    f = to_float(val)
    return int(f) if f is not None else None


def to_bool(val) -> bool:
    if isinstance(val, bool):
        return val
    return str(val).strip().upper() in ("TRUE", "1", "SIM", "S")


def extract_tipo_letra(descricao: str) -> str | None:
    """
    Extract tipo_letra from tipologia descricao.
    Examples:
      "Lagoa Spot_B_ES"              → "B"
      "Itacaré Spot_Tipologia H_PL"  → "H"
      "Central Park_Tipologia A_ES"  → "A"
    """
    # Match last underscore-separated segment before package abbreviation
    parts = descricao.split("_")
    if len(parts) < 2:
        return None
    # Second-to-last part (before package abbreviation)
    tipo_part = parts[-2].strip()
    # Remove "Tipologia " prefix if present
    tipo_part = re.sub(r"(?i)tipologia\s*", "", tipo_part).strip()
    # Return single letter(s)
    if tipo_part:
        return tipo_part
    return None


def extract_pacote_codigo(descricao: str) -> int | None:
    """Extract pacote code from tipologia descricao last segment."""
    parts = descricao.split("_")
    abrev = parts[-1].strip().upper()
    return PACOTE_ABREV_TO_CODE.get(abrev)


# ── 1. PACOTES ──────────────────────────────────────────────────────────────
def seed_pacotes():
    print("Seeding pacotes...")
    rows = [
        {"codigo": 1, "descricao": "Essential", "abreviacao": "ES", "ativo": True},
        {"codigo": 2, "descricao": "Plus",      "abreviacao": "PL", "ativo": True},
        {"codigo": 3, "descricao": "Premium",   "abreviacao": "PR", "ativo": True},
        {"codigo": 4, "descricao": "HD1",       "abreviacao": "HD1","ativo": True},
        {"codigo": 5, "descricao": "Ampliada",  "abreviacao": "AM", "ativo": True},
    ]
    upsert("pacote", rows)


# ── 2. EMPREENDIMENTOS ──────────────────────────────────────────────────────
def seed_empreendimentos():
    print("Seeding empreendimentos...")
    path = DOWNLOADS / "Empreendimentos.xlsx"
    headers, data = read_xlsx(path)
    # columns: codigo,descricao,endereco,cidade,estado,cep,matriculaTerreno,
    #          quantidadeUnidades,pacotes,regiaoCodigo,dataAtualizacao,dataCadastro,
    #          dataEntrega,idExtratos
    col = {h: i for i, h in enumerate(headers)}
    rows = []
    for r in data:
        if not r[col.get("codigo", 0)]:
            continue
        rows.append({
            "codigo":               to_int(r[col["codigo"]]),
            "descricao":            str(r[col["descricao"]] or "").strip(),
            "endereco":             str(r[col.get("endereco", -1)] or "").strip() or None,
            "cidade":               str(r[col.get("cidade", -1)] or "").strip() or None,
            "estado":               str(r[col.get("estado", -1)] or "").strip() or None,
            "cep":                  str(r[col.get("cep", -1)] or "").strip() or None,
            "quantidade_unidades":  to_int(r[col.get("quantidadeUnidades", -1)]),
        })
    upsert("empreendimento", rows)


# ── 3. PRODUTOS ─────────────────────────────────────────────────────────────
def seed_produtos():
    print("Seeding produtos...")
    path = DOWNLOADS / "Produtos.xlsx"
    headers, data = read_xlsx(path)
    col = {h: i for i, h in enumerate(headers)}
    rows = []
    for r in data:
        if not r[col.get("codigo", 0)]:
            continue
        rows.append({
            "codigo":              to_int(r[col["codigo"]]),
            "nome":                str(r[col.get("nome", -1)] or "").strip(),
            "descricao":           str(r[col.get("descricao", -1)] or "").strip() or None,
            "categoria_codigo":    str(r[col.get("categoriaCodigo", -1)] or "").strip() or None,
            "subcategoria_codigo": str(r[col.get("subcategoriaCodigo", -1)] or "").strip() or None,
            "valor":               to_float(r[col.get("valor", -1)]),
            "imagem_url":          str(r[col.get("imagemUrl", -1)] or "").strip() or None,
            "link":                str(r[col.get("link", -1)] or "").strip() or None,
            "ativo":               to_bool(r[col.get("ativo", -1)]),
        })
    upsert("produto", rows)


# ── 4. TIPOLOGIAS ───────────────────────────────────────────────────────────
def seed_tipologias():
    print("Seeding tipologias...")
    path = DOWNLOADS / "Tipologia.xlsx"
    headers, data = read_xlsx(path)
    col = {h: i for i, h in enumerate(headers)}
    rows = []
    for r in data:
        if not r[col.get("codigo", 0)]:
            continue
        descricao = str(r[col["descricao"]] or "").strip()
        rows.append({
            "codigo":                 to_int(r[col["codigo"]]),
            "empreendimento_codigo":  to_int(r[col.get("empreendimentoCodigo", -1)]),
            "descricao":              descricao,
            "tipo_letra":             extract_tipo_letra(descricao),
            "pacote_codigo":          extract_pacote_codigo(descricao),
            "num_hospedes":           to_int(r[col.get("numHospedes", -1)]),
            "decor_tipo":             str(r[col.get("decorTipo", -1)] or "").strip() or None,
            "decor_valor":            to_float(r[col.get("decorValor", -1)]),
            "decor_percent":          to_float(r[col.get("decorPercent", -1)]),
            "adm_tipo":               str(r[col.get("admTipo", -1)] or "").strip() or None,
            "adm_percent":            to_float(r[col.get("admPercent", -1)]),
            "adm_valor":              to_float(r[col.get("admValor", -1)]),
        })
    upsert("tipologia", rows)


# ── 5. APARTAMENTOS (tipologia_apto → apartamento) ──────────────────────────
def seed_apartamentos():
    print("Seeding apartamentos...")
    path = DOWNLOADS / "Tipologia Apto.xlsx"
    headers, data = read_xlsx(path)
    col = {h: i for i, h in enumerate(headers)}
    rows = []
    for r in data:
        if not r[col.get("codigo", 0)]:
            continue
        rows.append({
            "codigo":                 to_int(r[col["codigo"]]),
            "empreendimento_codigo":  to_int(r[col.get("empreendimentoCodigo", -1)]),
            "apartamento_id":         str(r[col.get("apartamentoId", -1)] or "").strip(),
            "tipologia_codigo":       to_int(r[col.get("tipologiaCodigo", -1)]),
        })
    upsert("apartamento", rows)


# ── 6. PRODUTO × TIPOLOGIA (CSV export from Google Sheets) ──────────────────
def seed_produto_tipologia():
    csv_path = DOWNLOADS / "prodxtip.csv"
    if not csv_path.exists():
        print(f"  [skip] produto_tipologia: {csv_path} not found.")
        print("  Export db009_prodxtip from Google Sheets as CSV to that path and re-run.")
        return
    print("Seeding produto_tipologia (this may take a while — 92K rows)...")
    rows = []
    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append({
                "codigo":              to_int(row.get("codigo")),
                "tipologia_codigo":    to_int(row.get("tipologiaCodigo")),
                "produto_codigo":      to_int(row.get("produtoCodigo")),
                "quantidade":          to_float(row.get("quantidade")) or 1,
                "categoria_codigo":    row.get("categoriaCodigo") or None,
                "subcategoria_codigo": row.get("subcategoriaCodigo") or None,
                "valor_unitario":      to_float(row.get("valorUnitario")),
                "item_adicional":      to_bool(row.get("itemAdicional", "FALSE")),
            })
    upsert("produto_tipologia", rows)


if __name__ == "__main__":
    seed_pacotes()
    seed_empreendimentos()
    seed_produtos()
    seed_tipologias()
    seed_apartamentos()
    seed_produto_tipologia()
    print("\nDone!")
```

- [ ] **Step 4: Export db009_prodxtip from Google Sheets**

In Google Sheets, open the spreadsheet → go to tab `db009_prodxtip` → File → Download → CSV. Save as `C:\Users\Fabiano\Downloads\prodxtip.csv`.

- [ ] **Step 5: Run seed script**

```bash
cd "C:/Users/Fabiano/Downloads/Site"
python scripts/seed_supabase.py
```

Expected output:
```
Seeding pacotes...
  [ok] pacote: 5 rows upserted
Seeding empreendimentos...
  [ok] empreendimento: 60 rows upserted
Seeding produtos...
  [ok] produto: ~40 rows upserted
Seeding tipologias...
  [ok] tipologia: 862 rows upserted
Seeding apartamentos...
  [ok] apartamento: ~6000 rows upserted
Seeding produto_tipologia (this may take a while — 92K rows)...
  [ok] produto_tipologia: 92372 rows upserted
Done!
```

- [ ] **Step 6: Verify data in Supabase**

In Supabase SQL editor, run:
```sql
SELECT 'empreendimento' as t, COUNT(*) FROM empreendimento
UNION ALL SELECT 'pacote',            COUNT(*) FROM pacote
UNION ALL SELECT 'produto',           COUNT(*) FROM produto
UNION ALL SELECT 'tipologia',         COUNT(*) FROM tipologia
UNION ALL SELECT 'apartamento',       COUNT(*) FROM apartamento
UNION ALL SELECT 'produto_tipologia', COUNT(*) FROM produto_tipologia;
```

Expected: non-zero counts for each table.

- [ ] **Step 7: Commit**

```bash
git add scripts/
git commit -m "feat: add ETL seed script for catalog tables"
```

---

## Task 5: Data Hooks

**Files:**
- Create: `src/hooks/useEmpreendimentos.ts`
- Create: `src/hooks/useApartamentos.ts`
- Create: `src/hooks/useTipologiasDisponiveis.ts`
- Create: `src/hooks/useProdutosTipologia.ts`
- Create: `src/test/hooks/useEmpreendimentos.test.ts`
- Create: `src/test/hooks/useProdutosTipologia.test.ts`

- [ ] **Step 1: Write useEmpreendimentos hook test**

Create `src/test/hooks/useEmpreendimentos.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useEmpreendimentos } from '@/hooks/useEmpreendimentos';

vi.mock('@/integrationssupabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: 1, codigo: 100, descricao: 'Itacaré Spot', cidade: 'Itacaré', estado: 'BA' },
            { id: 2, codigo: 101, descricao: 'Lagoa Spot',   cidade: 'Florianópolis', estado: 'SC' },
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd "C:/Users/Fabiano/Downloads/Site"
npm test -- src/test/hooks/useEmpreendimentos.test.ts
```

Expected: FAIL — `Cannot find module '@/hooks/useEmpreendimentos'`

- [ ] **Step 3: Create useEmpreendimentos hook**

Create `src/hooks/useEmpreendimentos.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrationssupabase/client';
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- src/test/hooks/useEmpreendimentos.test.ts
```

Expected: PASS

- [ ] **Step 5: Create useApartamentos hook**

Create `src/hooks/useApartamentos.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrationssupabase/client';
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
```

- [ ] **Step 6: Create useTipologiasDisponiveis hook**

Each apartment has a `tipologia_codigo`. From that tipologia we know `empreendimento_codigo` + `tipo_letra`. This hook fetches all tipologias with the same `empreendimento_codigo` + `tipo_letra` so the user can see all available packages for their unit type.

Create `src/hooks/useTipologiasDisponiveis.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrationssupabase/client';
import type { Tipologia } from '@/types/catalog';

export function useTipologiasDisponiveis(tipologiaCodigo: number | null) {
  return useQuery<Tipologia[]>({
    queryKey: ['tipologias-disponiveis', tipologiaCodigo],
    enabled: tipologiaCodigo !== null,
    queryFn: async () => {
      // Step 1: get the base tipologia to know empreendimento + tipo_letra
      const { data: base, error: e1 } = await supabase
        .from('tipologia')
        .select('empreendimento_codigo, tipo_letra')
        .eq('codigo', tipologiaCodigo!)
        .single();
      if (e1) throw e1;

      // Step 2: get all tipologias with same empreendimento + tipo_letra (all packages)
      const { data, error: e2 } = await supabase
        .from('tipologia')
        .select('*, pacote:pacote_codigo(id, codigo, descricao, abreviacao)')
        .eq('empreendimento_codigo', base.empreendimento_codigo)
        .eq('tipo_letra', base.tipo_letra)
        .order('pacote_codigo');
      if (e2) throw e2;
      return data as Tipologia[];
    },
  });
}
```

- [ ] **Step 7: Write useProdutosTipologia test**

Create `src/test/hooks/useProdutosTipologia.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useProdutosTipologia } from '@/hooks/useProdutosTipologia';

vi.mock('@/integrationssupabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 1,
                tipologia_codigo: 12,
                produto_codigo: 6,
                quantidade: 1,
                valor_unitario: 300,
                item_adicional: false,
                produto: { id: 1, codigo: 6, nome: 'Cadeira', descricao: null,
                           categoria_codigo: '2.2', subcategoria_codigo: '2.2.10',
                           valor: 300, imagem_url: null },
              },
              {
                id: 2,
                tipologia_codigo: 12,
                produto_codigo: 29,
                quantidade: 1,
                valor_unitario: 400,
                item_adicional: true,
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
  it('returns products split by item_adicional', async () => {
    const { result } = renderHook(() => useProdutosTipologia(12), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.produtosPadrao).toHaveLength(1);
    expect(result.current.produtosAdicionais).toHaveLength(1);
    expect(result.current.produtosPadrao[0].produto?.nome).toBe('Cadeira');
    expect(result.current.produtosAdicionais[0].produto?.nome).toBe('Poltrona');
  });

  it('is disabled when tipologiaCodigo is null', () => {
    const { result } = renderHook(() => useProdutosTipologia(null), { wrapper });
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });
});
```

- [ ] **Step 8: Run test to verify it fails**

```bash
npm test -- src/test/hooks/useProdutosTipologia.test.ts
```

Expected: FAIL — `Cannot find module '@/hooks/useProdutosTipologia'`

- [ ] **Step 9: Create useProdutosTipologia hook**

Create `src/hooks/useProdutosTipologia.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrationssupabase/client';
import type { ProdutoTipologia } from '@/types/catalog';

interface ProdutosTipologiaResult {
  data: ProdutoTipologia[] | undefined;
  produtosPadrao: ProdutoTipologia[];
  produtosAdicionais: ProdutoTipologia[];
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | null;
}

export function useProdutosTipologia(tipologiaCodigo: number | null): ProdutosTipologiaResult {
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
            categoria_codigo, subcategoria_codigo, valor, imagem_url
          )
        `)
        .eq('tipologia_codigo', tipologiaCodigo!)
        .order('subcategoria_codigo');
      if (error) throw error;
      return data as ProdutoTipologia[];
    },
  });

  const data = query.data;
  return {
    ...query,
    produtosPadrao:     data?.filter(p => !p.item_adicional) ?? [],
    produtosAdicionais: data?.filter(p =>  p.item_adicional) ?? [],
  };
}
```

- [ ] **Step 10: Run test to verify it passes**

```bash
npm test -- src/test/hooks/useProdutosTipologia.test.ts
```

Expected: PASS (2 tests)

- [ ] **Step 11: Commit hooks**

```bash
git add src/hooks/ src/test/
git commit -m "feat: add catalog data hooks with unit tests"
```

---

## Task 6: Update FunnelContext

**Files:**
- Modify: `src/types/funnel.ts`
- Modify: `src/contexts/FunnelContext.tsx`

- [ ] **Step 1: Extend Unit type**

In `src/types/funnel.ts`, replace the `Unit` interface:

```typescript
export interface Unit {
  id: string;
  spot: string;
  deliveryDate: Date;
  tipologiaCodigo: number | null;      // add this
  empreendimentoCodigo: number | null; // add this
}
```

- [ ] **Step 2: Update FunnelContext**

In `src/contexts/FunnelContext.tsx`, make these changes:

**a)** Add `tipologia` to the interface and state. After the existing imports, add:

```typescript
import type { Tipologia } from '@/types/catalog';
```

**b)** Add to `FunnelContextType` interface (after `getTotalPrice`):

```typescript
  tipologiaSelecionada: Tipologia | null;
  setTipologiaSelecionada: (t: Tipologia | null) => void;
```

**c)** Add state inside `FunnelProvider` (after `contractSigned` state):

```typescript
  const [tipologiaSelecionada, setTipologiaSelecionada] = useState<Tipologia | null>(null);
```

**d)** Replace the hardcoded `getTotalPrice` function with real pricing:

```typescript
  const getTotalPrice = useCallback(() => {
    const produtosTotal = customizations
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0);

    const decorValor = tipologiaSelecionada?.decor_valor ?? 3000;
    const admPercent = (tipologiaSelecionada?.adm_percent ?? 13) / 100;

    return produtosTotal + decorValor + admPercent * produtosTotal;
  }, [customizations, tipologiaSelecionada]);
```

**e)** Update `resetFunnel` to clear tipologia:

```typescript
  const resetFunnel = useCallback(() => {
    setCurrentStep(0);
    setSelectedUnit(null);
    setSelectedPackage(null);
    setCustomizations(defaultCustomizations.map(item => ({ ...item, selected: false })));
    setSignatoryData(defaultSignatory);
    setTermsAccepted(false);
    setContractSigned(false);
    setTipologiaSelecionada(null); // add this line
  }, []);
```

**f)** Add `tipologiaSelecionada` and `setTipologiaSelecionada` to the Provider value object.

- [ ] **Step 3: Update CustomizationItem type for quantity**

In `src/types/funnel.ts`, add `quantity` to `CustomizationItem`:

```typescript
export interface CustomizationItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;  // add this
  category: "infraestrutura" | "mobiliario" | "tecnologia" | "acabamento";
  selected: boolean;
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npm run build 2>&1 | head -30
```

Expected: no TypeScript errors related to the changed files.

- [ ] **Step 5: Commit**

```bash
git add src/types/funnel.ts src/contexts/FunnelContext.tsx
git commit -m "feat: add tipologia state and real pricing to FunnelContext"
```

---

## Task 7: Update UnitSelector

**Files:**
- Modify: `src/components/funnel/UnitSelector.tsx`

- [ ] **Step 1: Replace mock data with real hooks**

Replace the entire content of `src/components/funnel/UnitSelector.tsx`:

```typescript
import { useState } from "react";
import { MapPin, Building2, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmpreendimentos } from "@/hooks/useEmpreendimentos";
import { useApartamentos } from "@/hooks/useApartamentos";
import { useFunnel } from "@/contexts/FunnelContext";
import type { Unit } from "@/types/funnel";

interface UnitSelectorProps {
  onComplete: () => void;
}

export function UnitSelector({ onComplete }: UnitSelectorProps) {
  const { selectUnit } = useFunnel();
  const [selectedEmpCodigo, setSelectedEmpCodigo] = useState<number | null>(null);
  const [selectedAptoCodigo, setSelectedAptoCodigo] = useState<number | null>(null);

  const { data: empreendimentos, isLoading: loadingEmps } = useEmpreendimentos();
  const { data: apartamentos, isLoading: loadingAptos } = useApartamentos(selectedEmpCodigo);

  const selectedEmp = empreendimentos?.find(e => e.codigo === selectedEmpCodigo);
  const selectedApto = apartamentos?.find(a => a.codigo === selectedAptoCodigo);

  const handleConfirm = () => {
    if (!selectedApto || !selectedEmp) return;
    const unit: Unit = {
      id: selectedApto.apartamento_id,
      spot: selectedEmp.descricao,
      deliveryDate: new Date(),
      tipologiaCodigo: selectedApto.tipologia_codigo,
      empreendimentoCodigo: selectedApto.empreendimento_codigo,
    };
    selectUnit(unit);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center p-4">
      <Card variant="glass" className="w-full max-w-lg">
        <CardHeader className="text-center pb-6">
          <Badge variant="coral" className="mx-auto mb-4">
            Acesso do Investidor
          </Badge>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Selecione sua Unidade
          </h2>
          <p className="text-muted-foreground">
            Escolha o empreendimento e a unidade para iniciar seu projeto
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Empreendimento Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4 text-seazone-coral" />
              Empreendimento
            </label>
            <Select
              value={selectedEmpCodigo?.toString() ?? ""}
              onValueChange={(v) => {
                setSelectedEmpCodigo(Number(v));
                setSelectedAptoCodigo(null);
              }}
              disabled={loadingEmps}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={
                  loadingEmps
                    ? "Carregando..."
                    : "Selecione o empreendimento"
                } />
              </SelectTrigger>
              <SelectContent>
                {empreendimentos?.map((emp) => (
                  <SelectItem key={emp.codigo} value={emp.codigo.toString()}>
                    {emp.descricao}
                    {emp.cidade ? ` — ${emp.cidade}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Apartment Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4 text-seazone-coral" />
              Unidade
            </label>
            <Select
              value={selectedAptoCodigo?.toString() ?? ""}
              onValueChange={(v) => setSelectedAptoCodigo(Number(v))}
              disabled={!selectedEmpCodigo || loadingAptos}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={
                  !selectedEmpCodigo
                    ? "Primeiro selecione o empreendimento"
                    : loadingAptos
                    ? "Carregando unidades..."
                    : "Selecione a unidade"
                } />
              </SelectTrigger>
              <SelectContent>
                {apartamentos?.map((apto) => (
                  <SelectItem key={apto.codigo} value={apto.codigo.toString()}>
                    {apto.apartamento_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Preview */}
          {selectedApto && selectedEmp && (
            <Card variant="elevated" className="bg-seazone-success/10 border-seazone-success/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-seazone-success" />
                  <div>
                    <p className="font-medium text-foreground">{selectedEmp.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      Unidade {selectedApto.apartamento_id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            variant="coral"
            size="lg"
            className="w-full"
            disabled={!selectedAptoCodigo}
            onClick={handleConfirm}
          >
            {loadingAptos ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</>
            ) : (
              "Iniciar Configuração"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npm run build 2>&1 | grep -i error | head -20
```

Expected: no errors in UnitSelector.tsx

- [ ] **Step 3: Commit**

```bash
git add src/components/funnel/UnitSelector.tsx
git commit -m "feat: UnitSelector now loads real empreendimentos and apartments from Supabase"
```

---

## Task 8: Update StepPackageSelection

**Files:**
- Modify: `src/components/funnel/steps/StepPackageSelection.tsx`

- [ ] **Step 1: Replace mock packages with real tipologias**

Replace the entire content of `src/components/funnel/steps/StepPackageSelection.tsx`:

```typescript
import { Check, Star, Package, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useFunnel } from "@/contexts/FunnelContext";
import { useTipologiasDisponiveis } from "@/hooks/useTipologiasDisponiveis";
import type { Tipologia } from "@/types/catalog";

const PACOTE_LABEL: Record<string, string> = {
  ES: "Essential", PL: "Plus", PR: "Premium", HD1: "HD1", AM: "Ampliada",
};

export function StepPackageSelection() {
  const { selectedUnit, selectPackage, setTipologiaSelecionada, selectedPackage, nextStep } = useFunnel();

  const tipologiaCodigo = selectedUnit?.tipologiaCodigo ?? null;
  const { data: tipologias, isLoading } = useTipologiasDisponiveis(tipologiaCodigo);

  const handleSelect = (tip: Tipologia & { pacote?: { abreviacao: string } }) => {
    const abrev = (tip as any).pacote?.abreviacao ?? "";
    selectPackage((PACOTE_LABEL[abrev]?.toLowerCase() ?? "essential") as any);
    setTipologiaSelecionada(tip);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-seazone-coral" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          Escolha seu Plano
        </h2>
        <p className="text-muted-foreground">
          Selecione o plano que melhor atende às necessidades do seu imóvel
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {(tipologias ?? []).map((tip: any) => {
          const abrev = tip.pacote?.abreviacao ?? "";
          const nome = PACOTE_LABEL[abrev] ?? tip.descricao;
          const isSelected = selectedPackage === nome.toLowerCase();
          const isRecommended = abrev === "PL";

          return (
            <Card
              key={tip.id}
              variant={isSelected ? "selected" : isRecommended ? "premium" : "elevated"}
              className={`relative cursor-pointer transition-all duration-300 ${
                isSelected ? "scale-[1.02]" : "hover:scale-[1.01]"
              }`}
              onClick={() => handleSelect(tip)}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="coral" className="shadow-coral">
                    <Star className="w-3 h-3 mr-1" /> Recomendado
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    abrev === "PR" ? "bg-premium-gradient" :
                    abrev === "PL" ? "bg-coral-gradient" : "bg-secondary"
                  }`}>
                    <Package className={`w-7 h-7 ${
                      abrev === "ES" ? "text-foreground" : "text-primary-foreground"
                    }`} />
                  </div>
                </div>
                <h3 className="text-xl font-display font-bold">{nome}</h3>
                <p className="text-sm text-muted-foreground">{abrev}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    Taxa Decor:{" "}
                    <span className="font-bold text-foreground">
                      {tip.decor_tipo === "absoluto"
                        ? `R$ ${(tip.decor_valor ?? 0).toLocaleString("pt-BR")}`
                        : `${tip.decor_percent ?? 0}%`}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Taxa Adm:{" "}
                    <span className="font-bold text-foreground">
                      {tip.adm_percent ?? 0}%
                    </span>
                  </div>
                </div>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full" onClick={(e) => e.stopPropagation()}>
                      Ver Detalhes
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle className="font-display">{nome}</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                      <p>Tipologia: {tip.descricao}</p>
                      <p>Tipo: {tip.tipo_letra}</p>
                      <p>Hóspedes: {tip.num_hospedes}</p>
                    </div>
                  </SheetContent>
                </Sheet>

                <Button
                  variant={isSelected ? "coral" : "outline"}
                  className="w-full"
                  onClick={(e) => { e.stopPropagation(); handleSelect(tip); }}
                >
                  {isSelected ? <><Check className="w-4 h-4" /> Selecionado</> : "Selecionar"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPackage && (
        <div className="flex justify-center">
          <Button variant="hero" size="xl" onClick={nextStep}>
            Continuar para Personalização
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | grep -i error | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/funnel/steps/StepPackageSelection.tsx
git commit -m "feat: StepPackageSelection loads real packages from Supabase via tipologia"
```

---

## Task 9: Update StepCustomization

**Files:**
- Modify: `src/components/funnel/steps/StepCustomization.tsx`

- [ ] **Step 1: Replace mock products with real Supabase data**

Replace the entire content of `src/components/funnel/steps/StepCustomization.tsx`:

```typescript
import { useState, useCallback } from "react";
import { Check, Plus, Minus, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useFunnel } from "@/contexts/FunnelContext";
import { useProdutosTipologia } from "@/hooks/useProdutosTipologia";
import type { ProdutoTipologia } from "@/types/catalog";

export function StepCustomization() {
  const { tipologiaSelecionada, nextStep, prevStep } = useFunnel();
  const [extras, setExtras] = useState<Set<number>>(new Set());

  const tipologiaCodigo = tipologiaSelecionada?.codigo ?? null;
  const { produtosPadrao, produtosAdicionais, isLoading } = useProdutosTipologia(tipologiaCodigo);

  const toggleExtra = useCallback((produtoCodigo: number) => {
    setExtras(prev => {
      const next = new Set(prev);
      next.has(produtoCodigo) ? next.delete(produtoCodigo) : next.add(produtoCodigo);
      return next;
    });
  }, []);

  const calcTotal = () => {
    const padrao = produtosPadrao.reduce(
      (sum, p) => sum + (p.valor_unitario ?? 0) * (p.quantidade ?? 1), 0
    );
    const adicional = produtosAdicionais
      .filter(p => extras.has(p.produto_codigo))
      .reduce((sum, p) => sum + (p.valor_unitario ?? 0) * (p.quantidade ?? 1), 0);
    const subtotal = padrao + adicional;
    const decorValor = tipologiaSelecionada?.decor_valor ?? 3000;
    const admPercent = (tipologiaSelecionada?.adm_percent ?? 13) / 100;
    return {
      subtotal,
      decorValor,
      admValor: admPercent * subtotal,
      total: subtotal + decorValor + admPercent * subtotal,
    };
  };

  const { subtotal, decorValor, admValor, total } = calcTotal();
  const extrasCount = extras.size;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-seazone-coral" />
      </div>
    );
  }

  const renderProduct = (item: ProdutoTipologia, isExtra: boolean) => {
    const selected = isExtra ? extras.has(item.produto_codigo) : true;
    return (
      <Card
        key={item.id}
        variant={selected ? "selected" : "elevated"}
        className={`transition-all duration-200 ${isExtra ? "cursor-pointer" : ""}`}
        onClick={isExtra ? () => toggleExtra(item.produto_codigo) : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {item.produto?.imagem_url ? (
              <img
                src={item.produto.imagem_url}
                alt={item.produto.nome}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-secondary flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-foreground truncate">
                  {item.produto?.nome ?? `Produto ${item.produto_codigo}`}
                </h4>
                {isExtra ? (
                  <Switch
                    checked={selected}
                    onCheckedChange={() => toggleExtra(item.produto_codigo)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Badge variant="secondary" className="text-xs">Incluído</Badge>
                )}
              </div>
              {item.produto?.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.produto.descricao}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Qtd: {item.quantidade} · {item.subcategoria_codigo ?? item.categoria_codigo}
                </span>
                <span className={`font-bold text-sm ${
                  isExtra && selected ? "text-seazone-coral" : "text-foreground"
                }`}>
                  R$ {((item.valor_unitario ?? 0) * (item.quantidade ?? 1)).toLocaleString("pt-BR", {
                    minimumFractionDigits: 2
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="text-center">
        <h2 className="text-3xl font-display font-bold text-foreground mb-2">
          Produtos do Plano
        </h2>
        <p className="text-muted-foreground">
          Itens incluídos e opções de personalização para sua unidade
        </p>
      </div>

      {/* Standard products */}
      {produtosPadrao.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Check className="w-5 h-5 text-seazone-success" />
            Itens Incluídos ({produtosPadrao.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {produtosPadrao.map(item => renderProduct(item, false))}
          </div>
        </div>
      )}

      {/* Additional products */}
      {produtosAdicionais.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-seazone-coral" />
            Itens Adicionais ({extrasCount} selecionados)
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {produtosAdicionais.map(item => renderProduct(item, true))}
          </div>
        </div>
      )}

      {/* Sticky summary */}
      <Card variant="navy" className="fixed bottom-0 left-0 right-0 z-50 rounded-none md:rounded-xl md:static md:bottom-auto">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 container mx-auto max-w-7xl">
            <div className="space-y-1 text-sm">
              <div className="flex gap-4">
                <span className="text-primary-foreground/60">Produtos:</span>
                <span className="text-primary-foreground font-medium">
                  R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-primary-foreground/60">Decor:</span>
                <span className="text-primary-foreground font-medium">
                  R$ {decorValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-primary-foreground/60">Adm ({tipologiaSelecionada?.adm_percent ?? 13}%):</span>
                <span className="text-primary-foreground font-medium">
                  R$ {admValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex gap-4 border-t border-primary-foreground/20 pt-1">
                <span className="text-primary-foreground/60">Total:</span>
                <span className="text-2xl font-bold text-seazone-coral">
                  R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="glass" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4" /> Voltar
              </Button>
              <Button variant="coral" onClick={nextStep}>
                Continuar <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | grep -i error | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/funnel/steps/StepCustomization.tsx
git commit -m "feat: StepCustomization shows real products with live pricing (Supabase)"
```

---

## Task 10: End-to-End Test

- [ ] **Step 1: Run dev server**

```bash
cd "C:/Users/Fabiano/Downloads/Site"
npm run dev
```

Open browser to `http://localhost:5173/funnel`

- [ ] **Step 2: Test UnitSelector**

1. Page shows "Selecione sua Unidade" card
2. Click empreendimento dropdown — should list real empreendimentos from Supabase (not the 4 mock spots)
3. Select an empreendimento
4. Click unidade dropdown — should list real apartments for that empreendimento
5. Select a unit → click "Iniciar Configuração"

- [ ] **Step 3: Test StepPackageSelection**

1. Should show real packages available for the unit's tipo_letra (not 3 hardcoded cards)
2. Each card shows decor and adm rates from real data
3. Click "Selecionar" on a package
4. Click "Continuar para Personalização"

- [ ] **Step 4: Test StepCustomization**

1. Should list real products (not the 8 mock items)
2. "Itens Incluídos" section shows non-toggleable products
3. "Itens Adicionais" section shows toggleable products
4. Toggle extras — total updates in real time
5. Total breakdown shows subtotal + decor + adm correctly

- [ ] **Step 5: Run all tests**

```bash
npm test
```

Expected: all tests pass (hook tests + existing example test).

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete catalog-driven quoting flow — UnitSelector, PackageSelection, Customization"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Tela 1: empreendimento → unidade (Task 7)
- ✅ Tela 2: pacotes disponíveis por tipologia (Task 8)
- ✅ Personalização: add/remove produtos com atualização de valor (Task 9)
- ✅ Total em tempo real: produtos + decor + adm% (Tasks 6 + 9)
- ✅ Banco de dados Supabase com todas as tabelas (Task 2)
- ✅ ETL de Excel/CSV → Supabase (Task 4)
- ✅ Testes unitários para hooks principais (Task 5)
- ⚠️ Auth (proprietário vs interno) — fora do escopo desta entrega, conforme spec

**Placeholder scan:** None found.

**Type consistency:**
- `Unit.tipologiaCodigo` introduced in Task 6, used in Tasks 7, 8, 9 — consistent.
- `ProdutoTipologia.produto` used in Task 9 matches definition in Task 3 — consistent.
- `Tipologia.adm_percent` used in Task 9 matches Task 3 definition — consistent.
