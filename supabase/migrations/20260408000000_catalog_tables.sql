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
  abreviacao TEXT NOT NULL,
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
  tipo_letra            TEXT,
  pacote_codigo         INTEGER REFERENCES pacote(codigo),
  num_hospedes          INTEGER,
  decor_tipo            TEXT,
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
  apartamento_id        TEXT NOT NULL,
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

-- Enable RLS
ALTER TABLE empreendimento    ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacote            ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipologia         ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartamento       ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto_tipologia ENABLE ROW LEVEL SECURITY;

-- Allow anon read for development
CREATE POLICY "anon_read_empreendimento"    ON empreendimento    FOR SELECT USING (true);
CREATE POLICY "anon_read_pacote"            ON pacote            FOR SELECT USING (true);
CREATE POLICY "anon_read_produto"           ON produto           FOR SELECT USING (true);
CREATE POLICY "anon_read_tipologia"         ON tipologia         FOR SELECT USING (true);
CREATE POLICY "anon_read_apartamento"       ON apartamento       FOR SELECT USING (true);
CREATE POLICY "anon_read_produto_tipologia" ON produto_tipologia FOR SELECT USING (true);
