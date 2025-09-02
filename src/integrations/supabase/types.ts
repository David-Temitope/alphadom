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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      admin_stock_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          is_read: boolean | null
          product_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          product_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_stock_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      approved_dispatchers: {
        Row: {
          application_id: string
          created_at: string
          dispatch_name: string
          id: string
          is_active: boolean
          is_available: boolean
          phone_number: string
          rating: number
          success_rate: number
          total_deliveries: number
          total_earnings: number
          updated_at: string
          user_id: string
          vehicle_type: string
        }
        Insert: {
          application_id: string
          created_at?: string
          dispatch_name: string
          id?: string
          is_active?: boolean
          is_available?: boolean
          phone_number: string
          rating?: number
          success_rate?: number
          total_deliveries?: number
          total_earnings?: number
          updated_at?: string
          user_id: string
          vehicle_type: string
        }
        Update: {
          application_id?: string
          created_at?: string
          dispatch_name?: string
          id?: string
          is_active?: boolean
          is_available?: boolean
          phone_number?: string
          rating?: number
          success_rate?: number
          total_deliveries?: number
          total_earnings?: number
          updated_at?: string
          user_id?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      approved_vendors: {
        Row: {
          application_id: string
          created_at: string
          id: string
          is_active: boolean
          product_category: string
          store_name: string
          total_orders: number
          total_products: number
          total_revenue: number
          updated_at: string
          user_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          product_category: string
          store_name: string
          total_orders?: number
          total_products?: number
          total_revenue?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          product_category?: string
          store_name?: string
          total_orders?: number
          total_products?: number
          total_revenue?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approved_vendors_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "shop_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          is_like: boolean
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          is_like: boolean
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          is_like?: boolean
          user_id?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          admin_response: string | null
          created_at: string
          description: string
          id: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          description: string
          id?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          description?: string
          id?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      delivery_requests: {
        Row: {
          accepted_at: string | null
          delivered_at: string | null
          delivery_address: Json
          dispatcher_id: string | null
          dispatcher_notes: string | null
          id: string
          order_id: string
          pickup_address: Json
          product_details: Json
          requested_at: string
          shipping_fee: number
          status: string
          vendor_id: string
          vendor_notes: string | null
        }
        Insert: {
          accepted_at?: string | null
          delivered_at?: string | null
          delivery_address: Json
          dispatcher_id?: string | null
          dispatcher_notes?: string | null
          id?: string
          order_id: string
          pickup_address: Json
          product_details: Json
          requested_at?: string
          shipping_fee: number
          status?: string
          vendor_id: string
          vendor_notes?: string | null
        }
        Update: {
          accepted_at?: string | null
          delivered_at?: string | null
          delivery_address?: Json
          dispatcher_id?: string | null
          dispatcher_notes?: string | null
          id?: string
          order_id?: string
          pickup_address?: Json
          product_details?: Json
          requested_at?: string
          shipping_fee?: number
          status?: string
          vendor_id?: string
          vendor_notes?: string | null
        }
        Relationships: []
      }
      dispatch_activity_logs: {
        Row: {
          activity_details: Json | null
          activity_type: string
          created_at: string
          dispatcher_id: string
          id: string
        }
        Insert: {
          activity_details?: Json | null
          activity_type: string
          created_at?: string
          dispatcher_id: string
          id?: string
        }
        Update: {
          activity_details?: Json | null
          activity_type?: string
          created_at?: string
          dispatcher_id?: string
          id?: string
        }
        Relationships: []
      }
      dispatch_applications: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          availability: string
          coverage_areas: string[] | null
          created_at: string
          dispatch_name: string
          email: string
          emergency_contact: string | null
          experience_years: number | null
          id: string
          license_number: string | null
          payment_countdown_expires_at: string | null
          payment_due_date: string | null
          payment_received_at: string | null
          phone_number: string
          status: string
          updated_at: string
          user_id: string
          vehicle_type: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          availability: string
          coverage_areas?: string[] | null
          created_at?: string
          dispatch_name: string
          email: string
          emergency_contact?: string | null
          experience_years?: number | null
          id?: string
          license_number?: string | null
          payment_countdown_expires_at?: string | null
          payment_due_date?: string | null
          payment_received_at?: string | null
          phone_number: string
          status?: string
          updated_at?: string
          user_id: string
          vehicle_type: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          availability?: string
          coverage_areas?: string[] | null
          created_at?: string
          dispatch_name?: string
          email?: string
          emergency_contact?: string | null
          experience_years?: number | null
          id?: string
          license_number?: string | null
          payment_countdown_expires_at?: string | null
          payment_due_date?: string | null
          payment_received_at?: string | null
          phone_number?: string
          status?: string
          updated_at?: string
          user_id?: string
          vehicle_type?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id?: string | null
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          quantity?: number
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
          created_at: string | null
          id: string
          payment_method: string | null
          payment_status: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          status: string
          subtotal: number | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "approved_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      product_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          product_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          product_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          product_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_likes: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_likes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          eco_features: string[] | null
          full_description: string | null
          has_discount: boolean | null
          id: string
          image: string | null
          in_stock: boolean | null
          initial_stock_count: number | null
          last_stock_update: string | null
          name: string
          original_price: number | null
          price: number
          rating: number | null
          reviews: number | null
          shipping_fee: number | null
          shipping_type: string | null
          specifications: Json | null
          stock_count: number | null
          sustainability_score: number | null
          total_likes: number | null
          total_orders: number | null
          updated_at: string | null
          vendor_id: string | null
          vendor_user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          eco_features?: string[] | null
          full_description?: string | null
          has_discount?: boolean | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          initial_stock_count?: number | null
          last_stock_update?: string | null
          name: string
          original_price?: number | null
          price: number
          rating?: number | null
          reviews?: number | null
          shipping_fee?: number | null
          shipping_type?: string | null
          specifications?: Json | null
          stock_count?: number | null
          sustainability_score?: number | null
          total_likes?: number | null
          total_orders?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          vendor_user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          eco_features?: string[] | null
          full_description?: string | null
          has_discount?: boolean | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          initial_stock_count?: number | null
          last_stock_update?: string | null
          name?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          reviews?: number | null
          shipping_fee?: number | null
          shipping_type?: string | null
          specifications?: Json | null
          stock_count?: number | null
          sustainability_score?: number | null
          total_likes?: number | null
          total_orders?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          vendor_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "approved_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_banned: boolean
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_banned?: boolean
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_banned?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      shop_applications: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          bank_details: Json
          business_address: string | null
          business_description: string | null
          contact_phone: string | null
          created_at: string
          email: string
          id: string
          payment_countdown_expires_at: string | null
          payment_due_date: string | null
          payment_received_at: string | null
          price_range_max: number
          price_range_min: number
          product_category: string
          status: string
          store_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          bank_details: Json
          business_address?: string | null
          business_description?: string | null
          contact_phone?: string | null
          created_at?: string
          email: string
          id?: string
          payment_countdown_expires_at?: string | null
          payment_due_date?: string | null
          payment_received_at?: string | null
          price_range_max: number
          price_range_min: number
          product_category: string
          status?: string
          store_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          bank_details?: Json
          business_address?: string | null
          business_description?: string | null
          contact_phone?: string | null
          created_at?: string
          email?: string
          id?: string
          payment_countdown_expires_at?: string | null
          payment_due_date?: string | null
          payment_received_at?: string | null
          price_range_max?: number
          price_range_min?: number
          product_category?: string
          status?: string
          store_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_likes: {
        Row: {
          created_at: string
          id: string
          liked_user_id: string
          liker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          liked_user_id: string
          liker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          liked_user_id?: string
          liker_id?: string
        }
        Relationships: []
      }
      user_types: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
          user_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
          user_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
          user_type?: string
        }
        Relationships: []
      }
      vendor_activity_logs: {
        Row: {
          activity_details: Json | null
          activity_type: string
          created_at: string
          id: string
          vendor_id: string
        }
        Insert: {
          activity_details?: Json | null
          activity_type: string
          created_at?: string
          id?: string
          vendor_id: string
        }
        Update: {
          activity_details?: Json | null
          activity_type?: string
          created_at?: string
          id?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_analytics: {
        Row: {
          created_at: string
          customers_count: number
          date: string
          id: string
          orders_count: number
          products_added: number
          revenue: number
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          customers_count?: number
          date: string
          id?: string
          orders_count?: number
          products_added?: number
          revenue?: number
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          customers_count?: number
          date?: string
          id?: string
          orders_count?: number
          products_added?: number
          revenue?: number
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_analytics_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "approved_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_dashboard_access: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_dashboard_access_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "approved_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_products: {
        Row: {
          created_at: string
          id: string
          product_id: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "approved_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_order_totals: {
        Args: { shipping_address: Json; subtotal_amount: number }
        Returns: {
          shipping_cost: number
          tax_amount: number
          total_amount: number
        }[]
      }
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
