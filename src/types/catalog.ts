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
  grupo_substituicao_codigo: number | null;
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
