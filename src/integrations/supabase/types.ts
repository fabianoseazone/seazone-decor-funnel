export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
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
        Update: {
          descricao?: string
          cidade?: string | null
          estado?: string | null
        }
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
        Update: { descricao?: string; abreviacao?: string; ativo?: boolean }
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
        Update: { nome?: string; valor?: number | null }
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
        Update: { tipo_letra?: string | null; pacote_codigo?: number | null }
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
        Update: { tipologia_codigo?: number | null }
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
        Update: { quantidade?: number; valor_unitario?: number | null }
        Relationships: []
      }
      simulator_leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          investor_profile: string | null
          is_spot: boolean | null
          name: string
          phone: string | null
          recommended_package: string | null
          total_price: number | null
          unit_price: number | null
          units: number | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          investor_profile?: string | null
          is_spot?: boolean | null
          name: string
          phone?: string | null
          recommended_package?: string | null
          total_price?: number | null
          unit_price?: number | null
          units?: number | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          investor_profile?: string | null
          is_spot?: boolean | null
          name?: string
          phone?: string | null
          recommended_package?: string | null
          total_price?: number | null
          unit_price?: number | null
          units?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
