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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      creators: {
        Row: {
          created_at: string
          creator_handle: string
          creator_kuerzel: string
          email: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creator_handle: string
          creator_kuerzel: string
          email: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creator_handle?: string
          creator_kuerzel?: string
          email?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          creator_id: string
          event_name: string
          event_source: string
          id: string
          ip_hash: string | null
          properties: Json | null
          user_agent: string | null
          video_id: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          event_name: string
          event_source?: string
          id?: string
          ip_hash?: string | null
          properties?: Json | null
          user_agent?: string | null
          video_id?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          event_name?: string
          event_source?: string
          id?: string
          ip_hash?: string | null
          properties?: Json | null
          user_agent?: string | null
          video_id?: string | null
        }
        Relationships: []
      }
      hotspots: {
        Row: {
          card_style: string | null
          click_behavior: string | null
          countdown_enabled: boolean | null
          countdown_position: string | null
          countdown_style: string | null
          created_at: string
          cta_label: string | null
          id: string
          product_currency: string | null
          product_description: string | null
          product_id: string | null
          product_image_url: string | null
          product_price: string | null
          product_promo_code: string | null
          product_title: string | null
          product_url: string | null
          scale: number | null
          style: string | null
          template_family: string | null
          time_end_ms: number
          time_start_ms: number
          toolbar_offset_x: number | null
          toolbar_offset_y: number | null
          updated_at: string
          video_id: string
          x: number
          y: number
        }
        Insert: {
          card_style?: string | null
          click_behavior?: string | null
          countdown_enabled?: boolean | null
          countdown_position?: string | null
          countdown_style?: string | null
          created_at?: string
          cta_label?: string | null
          id?: string
          product_currency?: string | null
          product_description?: string | null
          product_id?: string | null
          product_image_url?: string | null
          product_price?: string | null
          product_promo_code?: string | null
          product_title?: string | null
          product_url?: string | null
          scale?: number | null
          style?: string | null
          template_family?: string | null
          time_end_ms?: number
          time_start_ms?: number
          toolbar_offset_x?: number | null
          toolbar_offset_y?: number | null
          updated_at?: string
          video_id: string
          x?: number
          y?: number
        }
        Update: {
          card_style?: string | null
          click_behavior?: string | null
          countdown_enabled?: boolean | null
          countdown_position?: string | null
          countdown_style?: string | null
          created_at?: string
          cta_label?: string | null
          id?: string
          product_currency?: string | null
          product_description?: string | null
          product_id?: string | null
          product_image_url?: string | null
          product_price?: string | null
          product_promo_code?: string | null
          product_title?: string | null
          product_url?: string | null
          scale?: number | null
          style?: string | null
          template_family?: string | null
          time_end_ms?: number
          time_start_ms?: number
          toolbar_offset_x?: number | null
          toolbar_offset_y?: number | null
          updated_at?: string
          video_id?: string
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "hotspots_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_api_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          partner_id: string
          scopes: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          partner_id: string
          scopes?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          partner_id?: string
          scopes?: string[]
        }
        Relationships: []
      }
      partner_hotspots: {
        Row: {
          created_at: string
          id: string
          is_draft: boolean
          partner_id: string
          payload: Json
          t_end: number
          t_start: number
          type: string
          updated_at: string
          video_id: string
          x: number
          y: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_draft?: boolean
          partner_id: string
          payload?: Json
          t_end: number
          t_start: number
          type?: string
          updated_at?: string
          video_id: string
          x: number
          y: number
        }
        Update: {
          created_at?: string
          id?: string
          is_draft?: boolean
          partner_id?: string
          payload?: Json
          t_end?: number
          t_start?: number
          type?: string
          updated_at?: string
          video_id?: string
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_hotspots_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "partner_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_idempotency_keys: {
        Row: {
          created_at: string
          endpoint: string
          expires_at: string
          id: string
          idempotency_key: string
          partner_id: string
          response_body: Json
          response_status: number
        }
        Insert: {
          created_at?: string
          endpoint: string
          expires_at?: string
          id?: string
          idempotency_key: string
          partner_id: string
          response_body: Json
          response_status: number
        }
        Update: {
          created_at?: string
          endpoint?: string
          expires_at?: string
          id?: string
          idempotency_key?: string
          partner_id?: string
          response_body?: Json
          response_status?: number
        }
        Relationships: []
      }
      partner_published_revisions: {
        Row: {
          created_at: string
          id: string
          manifest_json: Json
          partner_id: string
          public_url: string
          state: string
          tiny_url: string | null
          version: number
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          manifest_json: Json
          partner_id: string
          public_url: string
          state?: string
          tiny_url?: string | null
          version: number
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          manifest_json?: Json
          partner_id?: string
          public_url?: string
          state?: string
          tiny_url?: string | null
          version?: number
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_published_revisions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "partner_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_videos: {
        Row: {
          created_at: string
          external_id: string | null
          external_url: string | null
          id: string
          partner_id: string
          source: string
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          external_url?: string | null
          id?: string
          partner_id: string
          source?: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          external_url?: string | null
          id?: string
          partner_id?: string
          source?: string
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          caption: string | null
          created_at: string
          creator_id: string
          custom_slug: string | null
          file_url: string | null
          id: string
          original_video_key: string | null
          render_status: string | null
          rendered_video_key: string | null
          slug_finalized: boolean | null
          state: string
          title: string
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          creator_id: string
          custom_slug?: string | null
          file_url?: string | null
          id?: string
          original_video_key?: string | null
          render_status?: string | null
          rendered_video_key?: string | null
          slug_finalized?: boolean | null
          state?: string
          title: string
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          creator_id?: string
          custom_slug?: string | null
          file_url?: string | null
          id?: string
          original_video_key?: string | null
          render_status?: string | null
          rendered_video_key?: string | null
          slug_finalized?: boolean | null
          state?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "creators"
            referencedColumns: ["id"]
          },
        ]
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
