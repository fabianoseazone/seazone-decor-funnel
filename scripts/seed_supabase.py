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

SUPABASE_URL = "https://cukvbchfroyaxcalakdj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1a3ZiY2hmcm95YXhjYWxha2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODYyNzcsImV4cCI6MjA5MTI2MjI3N30.EdkVuff4VoLZCz-3oqN02s67smaFmnxGBDDx8J48VcA"
DOWNLOADS = Path("C:/Users/Fabiano/Downloads")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",
}

PACOTE_ABREV_TO_CODE = {"ES": 1, "PL": 2, "PR": 3, "HD1": 4, "AM": 5}


def deduplicate(rows: list[dict]) -> list[dict]:
    """Remove duplicate rows by 'codigo' field, keeping last occurrence."""
    seen: dict = {}
    for r in rows:
        key = r.get("codigo")
        if key is not None:
            seen[key] = r
        else:
            seen[id(r)] = r
    return list(seen.values())


def upsert(table: str, rows: list[dict]) -> None:
    if not rows:
        print(f"  [skip] {table}: no rows")
        return
    rows = deduplicate(rows)
    batch_size = 200
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
    parts = descricao.split("_")
    if len(parts) < 2:
        return None
    tipo_part = parts[-2].strip()
    tipo_part = re.sub(r"(?i)tipologia\s*", "", tipo_part).strip()
    return tipo_part if tipo_part else None


def extract_pacote_codigo(descricao: str) -> int | None:
    parts = descricao.split("_")
    abrev = parts[-1].strip().upper()
    return PACOTE_ABREV_TO_CODE.get(abrev)


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


def seed_empreendimentos():
    print("Seeding empreendimentos...")
    path = DOWNLOADS / "Empreendimentos.xlsx"
    headers, data = read_xlsx(path)
    col = {h: i for i, h in enumerate(headers)}
    rows = []
    for r in data:
        if not r[col.get("codigo", 0)]:
            continue
        rows.append({
            "codigo":              to_int(r[col["codigo"]]),
            "descricao":           str(r[col["descricao"]] or "").strip(),
            "endereco":            str(r[col.get("endereco", -1)] or "").strip() or None,
            "cidade":              str(r[col.get("cidade", -1)] or "").strip() or None,
            "estado":              str(r[col.get("estado", -1)] or "").strip() or None,
            "cep":                 str(r[col.get("cep", -1)] or "").strip() or None,
            "quantidade_unidades": to_int(r[col.get("quantidadeUnidades", -1)]),
        })
    upsert("empreendimento", rows)


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
            "codigo":                to_int(r[col["codigo"]]),
            "empreendimento_codigo": to_int(r[col.get("empreendimentoCodigo", -1)]),
            "descricao":             descricao,
            "tipo_letra":            extract_tipo_letra(descricao),
            "pacote_codigo":         extract_pacote_codigo(descricao),
            "num_hospedes":          to_int(r[col.get("numHospedes", -1)]),
            "decor_tipo":            str(r[col.get("decorTipo", -1)] or "").strip() or None,
            "decor_valor":           to_float(r[col.get("decorValor", -1)]),
            "decor_percent":         to_float(r[col.get("decorPercent", -1)]),
            "adm_tipo":              str(r[col.get("admTipo", -1)] or "").strip() or None,
            "adm_percent":           to_float(r[col.get("admPercent", -1)]),
            "adm_valor":             to_float(r[col.get("admValor", -1)]),
        })
    upsert("tipologia", rows)


def get_valid_tipologia_codigos() -> set:
    """Query Supabase for all valid tipologia codes."""
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/tipologia?select=codigo",
        headers={**HEADERS, "Prefer": ""},
    )
    if resp.status_code != 200:
        return set()
    return {r["codigo"] for r in resp.json()}


def seed_apartamentos():
    print("Seeding apartamentos...")
    valid_tipologias = get_valid_tipologia_codigos()
    path = DOWNLOADS / "Tipologia Apto.xlsx"
    headers, data = read_xlsx(path)
    col = {h: i for i, h in enumerate(headers)}
    rows = []
    skipped = 0
    for r in data:
        if not r[col.get("codigo", 0)]:
            continue
        tip_code = to_int(r[col.get("tipologiaCodigo", -1)])
        if tip_code and tip_code not in valid_tipologias:
            tip_code = None
            skipped += 1
        rows.append({
            "codigo":                to_int(r[col["codigo"]]),
            "empreendimento_codigo": to_int(r[col.get("empreendimentoCodigo", -1)]),
            "apartamento_id":        str(r[col.get("apartamentoId", -1)] or "").strip(),
            "tipologia_codigo":      tip_code,
        })
    if skipped:
        print(f"  [warn] {skipped} apartamentos com tipologia_codigo invalido -> definido como NULL")
    upsert("apartamento", rows)


def seed_produto_tipologia():
    csv_path = DOWNLOADS / "prodxtip.csv"
    if not csv_path.exists():
        print(f"  [skip] produto_tipologia: {csv_path} not found.")
        print("  Export db009_prodxtip from Google Sheets as CSV to that path and re-run.")
        return
    print("Seeding produto_tipologia (this may take a while)...")
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
