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
      admin_activity_logs: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_user_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      admin_login_attempts: {
        Row: {
          attempted_at: string | null
          email: string
          id: string
          ip_address: string | null
          success: boolean
        }
        Insert: {
          attempted_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          success: boolean
        }
        Update: {
          attempted_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean
        }
        Relationships: []
      }
      admin_password_hashes: {
        Row: {
          admin_role_id: string
          created_at: string | null
          id: string
          password_hash: string
          updated_at: string | null
        }
        Insert: {
          admin_role_id: string
          created_at?: string | null
          id?: string
          password_hash: string
          updated_at?: string | null
        }
        Update: {
          admin_role_id?: string
          created_at?: string | null
          id?: string
          password_hash?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_password_hashes_admin_role_id_fkey"
            columns: ["admin_role_id"]
            isOneToOne: true
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_password_resets: {
        Row: {
          admin_id: string
          created_at: string | null
          expires_at: string
          id: string
          reset_token: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          reset_token: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          reset_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_password_resets_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          is_locked: boolean | null
          last_login: string | null
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_locked?: boolean | null
          last_login?: string | null
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_locked?: boolean | null
          last_login?: string | null
          role?: Database["public"]["Enums"]["admin_role"]
          user_id?: string
        }
        Relationships: []
      }
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
          linked_vendor_id: string | null
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
          linked_vendor_id?: string | null
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
          linked_vendor_id?: string | null
          phone_number?: string
          rating?: number
          success_rate?: number
          total_deliveries?: number
          total_earnings?: number
          updated_at?: string
          user_id?: string
          vehicle_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "approved_dispatchers_linked_vendor_id_fkey"
            columns: ["linked_vendor_id"]
            isOneToOne: false
            referencedRelation: "approved_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      approved_vendors: {
        Row: {
          application_id: string
          commission_rate: number | null
          cover_image: string | null
          created_at: string
          free_ads_remaining: number | null
          gift_commission_rate: number | null
          gift_plan: string | null
          gift_plan_expires_at: string | null
          has_home_visibility: boolean | null
          id: string
          is_active: boolean
          is_suspended: boolean | null
          paystack_subaccount_code: string | null
          product_category: string
          product_limit: number | null
          product_slots: number | null
          store_name: string
          subscription_days_remaining: number | null
          subscription_end_date: string | null
          subscription_paused_at: string | null
          subscription_plan: string | null
          subscription_start_date: string | null
          total_orders: number
          total_products: number
          total_revenue: number
          updated_at: string
          used_slots: number | null
          user_id: string
        }
        Insert: {
          application_id: string
          commission_rate?: number | null
          cover_image?: string | null
          created_at?: string
          free_ads_remaining?: number | null
          gift_commission_rate?: number | null
          gift_plan?: string | null
          gift_plan_expires_at?: string | null
          has_home_visibility?: boolean | null
          id?: string
          is_active?: boolean
          is_suspended?: boolean | null
          paystack_subaccount_code?: string | null
          product_category: string
          product_limit?: number | null
          product_slots?: number | null
          store_name: string
          subscription_days_remaining?: number | null
          subscription_end_date?: string | null
          subscription_paused_at?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          total_orders?: number
          total_products?: number
          total_revenue?: number
          updated_at?: string
          used_slots?: number | null
          user_id: string
        }
        Update: {
          application_id?: string
          commission_rate?: number | null
          cover_image?: string | null
          created_at?: string
          free_ads_remaining?: number | null
          gift_commission_rate?: number | null
          gift_plan?: string | null
          gift_plan_expires_at?: string | null
          has_home_visibility?: boolean | null
          id?: string
          is_active?: boolean
          is_suspended?: boolean | null
          paystack_subaccount_code?: string | null
          product_category?: string
          product_limit?: number | null
          product_slots?: number | null
          store_name?: string
          subscription_days_remaining?: number | null
          subscription_end_date?: string | null
          subscription_paused_at?: string | null
          subscription_plan?: string | null
          subscription_start_date?: string | null
          total_orders?: number
          total_products?: number
          total_revenue?: number
          updated_at?: string
          used_slots?: number | null
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
          {
            foreignKeyName: "approved_vendors_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "shop_applications_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          additional_images: string[] | null
          author_name: string
          content: string
          created_at: string
          featured_image_url: string | null
          id: string
          published: boolean
          published_at: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          additional_images?: string[] | null
          author_name: string
          content: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          additional_images?: string[] | null
          author_name?: string
          content?: string
          created_at?: string
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      contact_messages: {
        Row: {
          admin_response: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          responded_at: string | null
          status: string | null
          subject: string | null
          user_id: string | null
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          responded_at?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string | null
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          responded_at?: string | null
          status?: string | null
          subject?: string | null
          user_id?: string | null
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
          linked_vendor_id: string | null
          payment_countdown_expires_at: string | null
          payment_due_date: string | null
          payment_received_at: string | null
          phone_number: string
          status: string
          updated_at: string
          user_id: string
          vehicle_type: string
          vendor_approval_status: string | null
          vendor_approved_at: string | null
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
          linked_vendor_id?: string | null
          payment_countdown_expires_at?: string | null
          payment_due_date?: string | null
          payment_received_at?: string | null
          phone_number: string
          status?: string
          updated_at?: string
          user_id: string
          vehicle_type: string
          vendor_approval_status?: string | null
          vendor_approved_at?: string | null
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
          linked_vendor_id?: string | null
          payment_countdown_expires_at?: string | null
          payment_due_date?: string | null
          payment_received_at?: string | null
          phone_number?: string
          status?: string
          updated_at?: string
          user_id?: string
          vehicle_type?: string
          vendor_approval_status?: string | null
          vendor_approved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispatch_applications_linked_vendor_id_fkey"
            columns: ["linked_vendor_id"]
            isOneToOne: false
            referencedRelation: "approved_vendors"
            referencedColumns: ["id"]
          },
        ]
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
      order_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          order_id: string
          sender_id: string
          sender_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          order_id: string
          sender_id: string
          sender_type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          order_id?: string
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          added_by_user_id: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          payment_method: string | null
          payment_status: string | null
          receipt_image: string | null
          self_delivery: boolean | null
          shipping_address: Json | null
          shipping_cost: number | null
          status: string
          subtotal: number | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
          vendor_id: string | null
          vendor_owner_id: string | null
        }
        Insert: {
          added_by_user_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          receipt_image?: string | null
          self_delivery?: boolean | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
          vendor_owner_id?: string | null
        }
        Update: {
          added_by_user_id?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          receipt_image?: string | null
          self_delivery?: boolean | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
          vendor_id?: string | null
          vendor_owner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "vendor_profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "approved_vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_owner_id_fkey"
            columns: ["vendor_owner_id"]
            isOneToOne: false
            referencedRelation: "approved_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_ads: {
        Row: {
          animation_type: string | null
          created_at: string
          cta_text: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          priority: number | null
          target_page: string | null
          target_product_id: string | null
          target_url: string | null
          target_vendor_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          animation_type?: string | null
          created_at?: string
          cta_text?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          target_page?: string | null
          target_product_id?: string | null
          target_url?: string | null
          target_vendor_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          animation_type?: string | null
          created_at?: string
          cta_text?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          target_page?: string | null
          target_product_id?: string | null
          target_url?: string | null
          target_vendor_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_ads_target_product_id_fkey"
            columns: ["target_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_ads_target_vendor_id_fkey"
            columns: ["target_vendor_id"]
            isOneToOne: false
            referencedRelation: "approved_vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          order_id: string | null
          payment_method: string | null
          reference: string | null
          status: string | null
          transaction_type: string
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string | null
          reference?: string | null
          status?: string | null
          transaction_type: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string | null
          reference?: string | null
          status?: string | null
          transaction_type?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: []
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
      product_ratings: {
        Row: {
          created_at: string
          id: string
          product_id: string
          stars: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          stars: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          stars?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_ratings_product_id_fkey"
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
          colors: string[] | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          eco_features: string[] | null
          full_description: string | null
          gender: string | null
          has_discount: boolean | null
          id: string
          image: string | null
          in_stock: boolean | null
          initial_stock_count: number | null
          last_stock_update: string | null
          material: string | null
          name: string
          original_price: number | null
          price: number
          product_type: string | null
          rating: number | null
          reviews: number | null
          shipping_fee: number | null
          shipping_fee_2km_5km: number | null
          shipping_fee_over_5km: number | null
          shipping_fee_zone1: number | null
          shipping_fee_zone2: number | null
          shipping_fee_zone3: number | null
          shipping_type: string | null
          sizes: string[] | null
          specifications: Json | null
          stock_count: number | null
          sustainability_score: number | null
          tags: string[] | null
          thickness: string | null
          total_likes: number | null
          total_orders: number | null
          updated_at: string | null
          vendor_id: string | null
          vendor_user_id: string | null
        }
        Insert: {
          category: string
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          eco_features?: string[] | null
          full_description?: string | null
          gender?: string | null
          has_discount?: boolean | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          initial_stock_count?: number | null
          last_stock_update?: string | null
          material?: string | null
          name: string
          original_price?: number | null
          price: number
          product_type?: string | null
          rating?: number | null
          reviews?: number | null
          shipping_fee?: number | null
          shipping_fee_2km_5km?: number | null
          shipping_fee_over_5km?: number | null
          shipping_fee_zone1?: number | null
          shipping_fee_zone2?: number | null
          shipping_fee_zone3?: number | null
          shipping_type?: string | null
          sizes?: string[] | null
          specifications?: Json | null
          stock_count?: number | null
          sustainability_score?: number | null
          tags?: string[] | null
          thickness?: string | null
          total_likes?: number | null
          total_orders?: number | null
          updated_at?: string | null
          vendor_id?: string | null
          vendor_user_id?: string | null
        }
        Update: {
          category?: string
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          eco_features?: string[] | null
          full_description?: string | null
          gender?: string | null
          has_discount?: boolean | null
          id?: string
          image?: string | null
          in_stock?: boolean | null
          initial_stock_count?: number | null
          last_stock_update?: string | null
          material?: string | null
          name?: string
          original_price?: number | null
          price?: number
          product_type?: string | null
          rating?: number | null
          reviews?: number | null
          shipping_fee?: number | null
          shipping_fee_2km_5km?: number | null
          shipping_fee_over_5km?: number | null
          shipping_fee_zone1?: number | null
          shipping_fee_zone2?: number | null
          shipping_fee_zone3?: number | null
          shipping_type?: string | null
          sizes?: string[] | null
          specifications?: Json | null
          stock_count?: number | null
          sustainability_score?: number | null
          tags?: string[] | null
          thickness?: string | null
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
          ai_access_blocked: boolean | null
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          is_banned: boolean
          role: string | null
          updated_at: string | null
        }
        Insert: {
          ai_access_blocked?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          is_banned?: boolean
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_access_blocked?: boolean | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          is_banned?: boolean
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shop_applications: {
        Row: {
          admin_notes: string | null
          agreed_policies: Json | null
          approved_at: string | null
          bank_details: Json
          business_address: string | null
          business_description: string | null
          business_type: string | null
          contact_phone: string | null
          created_at: string
          email: string
          id: string
          id_image_url: string | null
          id_number: string | null
          id_type: string | null
          is_registered: boolean | null
          payment_countdown_expires_at: string | null
          payment_due_date: string | null
          payment_received_at: string | null
          price_range_max: number
          price_range_min: number
          product_category: string
          status: string
          store_name: string
          subscription_plan: string | null
          tin_number: string | null
          updated_at: string
          user_id: string
          vendor_bank_details: Json | null
        }
        Insert: {
          admin_notes?: string | null
          agreed_policies?: Json | null
          approved_at?: string | null
          bank_details: Json
          business_address?: string | null
          business_description?: string | null
          business_type?: string | null
          contact_phone?: string | null
          created_at?: string
          email: string
          id?: string
          id_image_url?: string | null
          id_number?: string | null
          id_type?: string | null
          is_registered?: boolean | null
          payment_countdown_expires_at?: string | null
          payment_due_date?: string | null
          payment_received_at?: string | null
          price_range_max: number
          price_range_min: number
          product_category: string
          status?: string
          store_name: string
          subscription_plan?: string | null
          tin_number?: string | null
          updated_at?: string
          user_id: string
          vendor_bank_details?: Json | null
        }
        Update: {
          admin_notes?: string | null
          agreed_policies?: Json | null
          approved_at?: string | null
          bank_details?: Json
          business_address?: string | null
          business_description?: string | null
          business_type?: string | null
          contact_phone?: string | null
          created_at?: string
          email?: string
          id?: string
          id_image_url?: string | null
          id_number?: string | null
          id_type?: string | null
          is_registered?: boolean | null
          payment_countdown_expires_at?: string | null
          payment_due_date?: string | null
          payment_received_at?: string | null
          price_range_max?: number
          price_range_min?: number
          product_category?: string
          status?: string
          store_name?: string
          subscription_plan?: string | null
          tin_number?: string | null
          updated_at?: string
          user_id?: string
          vendor_bank_details?: Json | null
        }
        Relationships: []
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
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
      user_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
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
      vendor_sensitive_data: {
        Row: {
          application_id: string
          bank_details: Json | null
          created_at: string
          id: string
          id_image_url: string | null
          id_number: string | null
          id_type: string | null
          tin_number: string | null
          updated_at: string
          user_id: string
          vendor_bank_details: Json | null
        }
        Insert: {
          application_id: string
          bank_details?: Json | null
          created_at?: string
          id?: string
          id_image_url?: string | null
          id_number?: string | null
          id_type?: string | null
          tin_number?: string | null
          updated_at?: string
          user_id: string
          vendor_bank_details?: Json | null
        }
        Update: {
          application_id?: string
          bank_details?: Json | null
          created_at?: string
          id?: string
          id_image_url?: string | null
          id_number?: string | null
          id_type?: string | null
          tin_number?: string | null
          updated_at?: string
          user_id?: string
          vendor_bank_details?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_sensitive_data_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "shop_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_sensitive_data_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "shop_applications_safe"
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
      shop_applications_safe: {
        Row: {
          admin_notes: string | null
          agreed_policies: Json | null
          approved_at: string | null
          business_address: string | null
          business_description: string | null
          business_type: string | null
          contact_phone: string | null
          created_at: string | null
          email: string | null
          id: string | null
          is_registered: boolean | null
          payment_countdown_expires_at: string | null
          payment_due_date: string | null
          payment_received_at: string | null
          price_range_max: number | null
          price_range_min: number | null
          product_category: string | null
          status: string | null
          store_name: string | null
          subscription_plan: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          agreed_policies?: Json | null
          approved_at?: string | null
          business_address?: string | null
          business_description?: string | null
          business_type?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          is_registered?: boolean | null
          payment_countdown_expires_at?: string | null
          payment_due_date?: string | null
          payment_received_at?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          product_category?: string | null
          status?: string | null
          store_name?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          agreed_policies?: Json | null
          approved_at?: string | null
          business_address?: string | null
          business_description?: string | null
          business_type?: string | null
          contact_phone?: string | null
          created_at?: string | null
          email?: string | null
          id?: string | null
          is_registered?: boolean | null
          payment_countdown_expires_at?: string | null
          payment_due_date?: string | null
          payment_received_at?: string | null
          price_range_max?: number | null
          price_range_min?: number | null
          product_category?: string | null
          status?: string | null
          store_name?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vendor_profiles_public: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          product_category: string | null
          store_name: string | null
          total_orders: number | null
          total_products: number | null
          vendor_since: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_delete_out_of_stock_products: { Args: never; Returns: undefined }
      calculate_order_totals: {
        Args: { shipping_address: Json; subtotal_amount: number }
        Returns: {
          shipping_cost: number
          tax_amount: number
          total_amount: number
        }[]
      }
      can_access_sensitive_shop_data: {
        Args: { app_user_id: string }
        Returns: boolean
      }
      can_view_shop_applications_safe: { Args: never; Returns: boolean }
      generate_sitemap_data: {
        Args: never
        Returns: {
          changefreq: string
          lastmod: string
          priority: number
          url: string
        }[]
      }
      get_admin_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      get_order_customer_contact: {
        Args: { _order_id: string }
        Returns: {
          customer_name: string
          customer_phone: string
        }[]
      }
      has_admin_role: {
        Args: {
          _role: Database["public"]["Enums"]["admin_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      track_admin_login_attempt: {
        Args: { _email: string; _ip_address?: string; _success: boolean }
        Returns: undefined
      }
      verify_admin_access: {
        Args: { _required_role?: Database["public"]["Enums"]["admin_role"] }
        Returns: boolean
      }
    }
    Enums: {
      admin_role:
        | "super_admin"
        | "vendor_admin"
        | "dispatch_admin"
        | "user_admin"
        | "orders_admin"
        | "customer_service"
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
    Enums: {
      admin_role: [
        "super_admin",
        "vendor_admin",
        "dispatch_admin",
        "user_admin",
        "orders_admin",
        "customer_service",
      ],
    },
  },
} as const
