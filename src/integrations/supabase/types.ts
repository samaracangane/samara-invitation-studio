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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
lovable-sync
      invites: {
        Row: {
          category: string

      invite_designs: {
        Row: {
          design_json: Json
          id: string
          invite_id: string
          order_id: string
          updated_at: string
        }
        Insert: {
          design_json?: Json
          id?: string
          invite_id: string
          order_id: string
          updated_at?: string
        }
        Update: {
          design_json?: Json
          id?: string
          invite_id?: string
          order_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_designs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          category: string
          checkout_url: string | null
main
          created_at: string
          description: string
          fields: Json
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          slug: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category: string
 lovable-sync

          checkout_url?: string | null
main
          created_at?: string
          description?: string
          fields?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price?: number
          slug: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
lovable-sync

          checkout_url?: string | null
main
          created_at?: string
          description?: string
          fields?: Json
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          slug?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
lovable-sync

      orders: {
        Row: {
          access_token_hash: string | null
          amount_cents: number
          checkout_url: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          event_details: Json
          final_image_path: string | null
          final_pdf_path: string | null
          final_video_path: string | null
          fulfilled_at: string | null
          fulfillment_status: string
          id: string
          idempotency_key: string
          invite_id: string
          invite_name: string
          offer_id: string | null
          paid_at: string | null
          payment_provider: string
          payment_status: string
          provider_checkout_id: string | null
          provider_payment_id: string | null
          updated_at: string
        }
        Insert: {
          access_token_hash?: string | null
          amount_cents: number
          checkout_url?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          event_details?: Json
          final_image_path?: string | null
          final_pdf_path?: string | null
          final_video_path?: string | null
          fulfilled_at?: string | null
          fulfillment_status?: string
          id?: string
          idempotency_key: string
          invite_id: string
          invite_name: string
          offer_id?: string | null
          paid_at?: string | null
          payment_provider?: string
          payment_status?: string
          provider_checkout_id?: string | null
          provider_payment_id?: string | null
          updated_at?: string
        }
        Update: {
          access_token_hash?: string | null
          amount_cents?: number
          checkout_url?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          event_details?: Json
          final_image_path?: string | null
          final_pdf_path?: string | null
          final_video_path?: string | null
          fulfilled_at?: string | null
          fulfillment_status?: string
          id?: string
          idempotency_key?: string
          invite_id?: string
          invite_name?: string
          offer_id?: string | null
          paid_at?: string | null
          payment_provider?: string
          payment_status?: string
          provider_checkout_id?: string | null
          provider_payment_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "wiapy_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      wiapy_offers: {
        Row: {
          checkout_id: string
          checkout_url: string
          created_at: string
          id: string
          is_active: boolean
          price_cents: number
          updated_at: string
        }
        Insert: {
          checkout_id: string
          checkout_url: string
          created_at?: string
          id?: string
          is_active?: boolean
          price_cents: number
          updated_at?: string
        }
        Update: {
          checkout_id?: string
          checkout_url?: string
          created_at?: string
          id?: string
          is_active?: boolean
          price_cents?: number
          updated_at?: string
        }
        Relationships: []
      }
      wiapy_webhook_events: {
        Row: {
          amount_cents: number | null
          id: string
          matched_order_id: string | null
          provider_checkout_id: string | null
          provider_payment_id: string
          provider_status: string
          received_at: string
        }
        Insert: {
          amount_cents?: number | null
          id?: string
          matched_order_id?: string | null
          provider_checkout_id?: string | null
          provider_payment_id: string
          provider_status: string
          received_at?: string
        }
        Update: {
          amount_cents?: number | null
          id?: string
          matched_order_id?: string | null
          provider_checkout_id?: string | null
          provider_payment_id?: string
          provider_status?: string
          received_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiapy_webhook_events_matched_order_id_fkey"
            columns: ["matched_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
 main
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
