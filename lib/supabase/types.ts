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
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_email: string
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_email?: string
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
          quantity: number
          quotation_id: string | null
          total_amount: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_per_unit?: number | null
          product_id?: string | null
          quantity: number
          quotation_id?: string | null
          total_amount?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price_per_unit?: number | null
          product_id?: string | null
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
          client_id: string | null
          created_at: string | null
          created_by: string | null
          discount: number | null
          final_amount: number | null
          id: string
          status: Database["public"]["Enums"]["quotation_status"] | null
          total_amount: number | null
          valid_until: string | null
          vat: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount?: number | null
          final_amount?: number | null
          id?: string
          status?: Database["public"]["Enums"]["quotation_status"] | null
          total_amount?: number | null
          valid_until?: string | null
          vat?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          discount?: number | null
          final_amount?: number | null
          id?: string
          status?: Database["public"]["Enums"]["quotation_status"] | null
          total_amount?: number | null
          valid_until?: string | null
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
        Args: {
          email_address: string
        }
        Returns: boolean
      }
      check_phone_exists: {
        Args: {
          phone_number: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_role: "admin" | "staff"
      order_status: "confirmed" | "processing" | "delivered" | "cancelled"
      payment_status: "pending" | "partial" | "paid"
      product_type: "paint" | "equipment"
      quotation_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
