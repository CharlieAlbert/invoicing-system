export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account: {
        Row: {
          auth_id: string | null
          avatar: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["account_role"]
          updated_at: string | null
        }
        Insert: {
          auth_id?: string | null
          avatar?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["account_role"]
          updated_at?: string | null
        }
        Update: {
          auth_id?: string | null
          avatar?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["account_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      client: {
        Row: {
          address: string | null
          company_email: string
          company_name: string
          contact_person: string | null
          created_at: string | null
          id: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          company_email: string
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          company_email?: string
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          invoice_id: string
          price_per_unit: number
          product_id: string
          product_variant_id: string | null
          quantity: number
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id: string
          price_per_unit: number
          product_id: string
          product_variant_id?: string | null
          quantity: number
          total_amount: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          invoice_id?: string
          price_per_unit?: number
          product_id?: string
          product_variant_id?: string | null
          quantity?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          client_id: string
          created_at: string | null
          created_by: string | null
          discount: number | null
          due_date: string
          final_amount: number
          id: string
          invoice_date: string
          invoice_number: string | null
          notes: string | null
          payment_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          quotation_id: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          total_amount: number
          vat: number | null
        }
        Insert: {
          amount_paid?: number | null
          client_id: string
          created_at?: string | null
          created_by?: string | null
          discount?: number | null
          due_date: string
          final_amount: number
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          total_amount: number
          vat?: number | null
        }
        Update: {
          amount_paid?: number | null
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          discount?: number | null
          due_date?: string
          final_amount?: number
          id?: string
          invoice_date?: string
          invoice_number?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          total_amount?: number
          vat?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      new_batch: {
        Row: {
          batch_number: string
          created_at: string | null
          created_by: string | null
          id: string
          product_id: string
          production_cost: number | null
          production_date: string
          quantity_produced: number
        }
        Insert: {
          batch_number: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          product_id: string
          production_cost?: number | null
          production_date: string
          quantity_produced: number
        }
        Update: {
          batch_number?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          product_id?: string
          production_cost?: number | null
          production_date?: string
          quantity_produced?: number
        }
        Relationships: [
          {
            foreignKeyName: "new_batch_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_batch_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price_per_unit: number | null
          product_id: string | null
          quantity: number
          total_amount: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price_per_unit?: number | null
          product_id?: string | null
          quantity: number
          total_amount?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price_per_unit?: number | null
          product_id?: string | null
          quantity?: number
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          discount: number | null
          final_amount: number | null
          id: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          quotation_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          vat: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount?: number | null
          final_amount?: number | null
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          vat?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount?: number | null
          final_amount?: number | null
          id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          quotation_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          vat?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      product_inventory: {
        Row: {
          id: string
          last_restocked: string | null
          product_id: string | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          id?: string
          last_restocked?: string | null
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          id?: string
          last_restocked?: string | null
          product_id?: string | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          cost_price: number | null
          created_at: string | null
          id: string
          product_id: string
          selling_price: number
          size: number
          sku: string | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          cost_price?: number | null
          created_at?: string | null
          id?: string
          product_id: string
          selling_price: number
          size: number
          sku?: string | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          cost_price?: number | null
          created_at?: string | null
          id?: string
          product_id?: string
          selling_price?: number
          size?: number
          sku?: string | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      production_materials: {
        Row: {
          batch_id: string | null
          created_at: string | null
          id: string
          material_id: string | null
          quantity_used: number
        }
        Insert: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          quantity_used: number
        }
        Update: {
          batch_id?: string | null
          created_at?: string | null
          id?: string
          material_id?: string | null
          quantity_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "production_materials_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "new_batch"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["product_type"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type: Database["public"]["Enums"]["product_type"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["product_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          created_at: string | null
          id: string
          price_per_unit: number | null
          product_id: string | null
          product_variant_id: string | null
          quantity: number
          quotation_id: string | null
          total_amount: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_per_unit?: number | null
          product_id?: string | null
          product_variant_id?: string | null
          quantity: number
          quotation_id?: string | null
          total_amount?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price_per_unit?: number | null
          product_id?: string | null
          product_variant_id?: string | null
          quantity?: number
          quotation_id?: string | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          client_id: string
          created_at: string
          created_by: string
          discount: number | null
          final_amount: number
          id: string
          quotation_number: string
          status: Database["public"]["Enums"]["quotation_status"]
          total_amount: number
          valid_until: string
          vat: number | null
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by: string
          discount?: number | null
          final_amount: number
          id?: string
          quotation_number: string
          status?: Database["public"]["Enums"]["quotation_status"]
          total_amount: number
          valid_until: string
          vat?: number | null
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by?: string
          discount?: number | null
          final_amount?: number
          id?: string
          quotation_number?: string
          status?: Database["public"]["Enums"]["quotation_status"]
          total_amount?: number
          valid_until?: string
          vat?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "client"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_material_inventory: {
        Row: {
          id: string
          last_purchased: string | null
          material_id: string | null
          quantity: number
          updated_at: string | null
        }
        Insert: {
          id?: string
          last_purchased?: string | null
          material_id?: string | null
          quantity?: number
          updated_at?: string | null
        }
        Update: {
          id?: string
          last_purchased?: string | null
          material_id?: string | null
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_material_inventory_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_material_procurement: {
        Row: {
          created_at: string | null
          id: string
          material_id: string | null
          purchase_date: string
          quantity: number
          supplier: string | null
          unit_cost: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          material_id?: string | null
          purchase_date: string
          quantity: number
          supplier?: string | null
          unit_cost: number
        }
        Update: {
          created_at?: string | null
          id?: string
          material_id?: string | null
          purchase_date?: string
          quantity?: number
          supplier?: string | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "raw_material_procurement_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "raw_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_materials: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          supplier: string | null
          unit: string
          unit_cost: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          supplier?: string | null
          unit: string
          unit_cost: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          supplier?: string | null
          unit?: string
          unit_cost?: number
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_email_exists: {
        Args: { email_address: string }
        Returns: boolean
      }
      check_phone_exists: {
        Args: { phone_number: string }
        Returns: boolean
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      account_role: "admin" | "staff"
      invoice_status:
        | "pending"
        | "paid"
        | "overdue"
        | "partially_paid"
        | "cancelled"
      order_status: "confirmed" | "processing" | "delivered" | "cancelled"
      payment_method:
        | "cash"
        | "bank_transfer"
        | "credit_card"
        | "check"
        | "mobile_money"
      payment_status: "pending" | "partial" | "paid"
      product_type: "paint" | "equipment"
      quotation_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_role: ["admin", "staff"],
      invoice_status: [
        "pending",
        "paid",
        "overdue",
        "partially_paid",
        "cancelled",
      ],
      order_status: ["confirmed", "processing", "delivered", "cancelled"],
      payment_method: [
        "cash",
        "bank_transfer",
        "credit_card",
        "check",
        "mobile_money",
      ],
      payment_status: ["pending", "partial", "paid"],
      product_type: ["paint", "equipment"],
      quotation_status: ["pending", "approved", "rejected"],
    },
  },
} as const
