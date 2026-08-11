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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          job_id: string | null
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          job_id?: string | null
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          job_id?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_files: {
        Row: {
          created_at: string
          file_name: string
          id: string
          job_id: string
          kind: string
          size_bytes: number | null
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          job_id: string
          kind?: string
          size_bytes?: number | null
          storage_path: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          job_id?: string
          kind?: string
          size_bytes?: number | null
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_files_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          additional_bw: boolean
          admin_notes: string | null
          authorize_extra: boolean
          color_requirement: string | null
          color_scheme: string | null
          color_separations: boolean
          completed_at: string | null
          created_at: string
          credits_used: number
          customer_id: string
          design_height: string | null
          design_units: string | null
          design_width: string | null
          garment_type: string | null
          id: string
          instructions: string | null
          job_category: string
          job_reference: string | null
          job_type: number
          logo_location: string | null
          max_stitch_count: string | null
          need_quote: boolean
          need_sew_out: boolean
          notify_email: string
          output_other: string | null
          output_raster: string | null
          output_vector: string | null
          po_number: string | null
          primary_output_formats: string[] | null
          product: string | null
          service: string | null
          status: Database["public"]["Enums"]["job_status"]
          updated_at: string
        }
        Insert: {
          additional_bw?: boolean
          admin_notes?: string | null
          authorize_extra?: boolean
          color_requirement?: string | null
          color_scheme?: string | null
          color_separations?: boolean
          completed_at?: string | null
          created_at?: string
          credits_used?: number
          customer_id: string
          design_height?: string | null
          design_units?: string | null
          design_width?: string | null
          garment_type?: string | null
          id?: string
          instructions?: string | null
          job_category?: string
          job_reference?: string | null
          job_type: number
          logo_location?: string | null
          max_stitch_count?: string | null
          need_quote?: boolean
          need_sew_out?: boolean
          notify_email: string
          output_other?: string | null
          output_raster?: string | null
          output_vector?: string | null
          po_number?: string | null
          primary_output_formats?: string[] | null
          product?: string | null
          service?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
        }
        Update: {
          additional_bw?: boolean
          admin_notes?: string | null
          authorize_extra?: boolean
          color_requirement?: string | null
          color_scheme?: string | null
          color_separations?: boolean
          completed_at?: string | null
          created_at?: string
          credits_used?: number
          customer_id?: string
          design_height?: string | null
          design_units?: string | null
          design_width?: string | null
          garment_type?: string | null
          id?: string
          instructions?: string | null
          job_category?: string
          job_reference?: string | null
          job_type?: number
          logo_location?: string | null
          max_stitch_count?: string | null
          need_quote?: boolean
          need_sew_out?: boolean
          notify_email?: string
          output_other?: string | null
          output_raster?: string | null
          output_vector?: string | null
          po_number?: string | null
          primary_output_formats?: string[] | null
          product?: string | null
          service?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company: string | null
          country: string | null
          created_at: string
          credits_balance: number
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          plan_name: string | null
          plan_type: Database["public"]["Enums"]["plan_type"]
          postcode: string | null
          updated_at: string
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          credits_balance?: number
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          plan_name?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"]
          postcode?: string | null
          updated_at?: string
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company?: string | null
          country?: string | null
          created_at?: string
          credits_balance?: number
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          plan_name?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"]
          postcode?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      revisions: {
        Row: {
          created_at: string
          id: string
          job_id: string
          message: string
          requested_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          message: string
          requested_by: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          message?: string
          requested_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "revisions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      support_leads: {
        Row: {
          created_at: string
          email: string
          handled: boolean
          id: string
          name: string | null
          question: string
        }
        Insert: {
          created_at?: string
          email: string
          handled?: boolean
          id?: string
          name?: string | null
          question: string
        }
        Update: {
          created_at?: string
          email?: string
          handled?: boolean
          id?: string
          name?: string | null
          question?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_adjust_credits: {
        Args: { p_amount: number; p_reason: string; p_user: string }
        Returns: undefined
      }
      admin_grant_role: {
        Args: {
          p_role: Database["public"]["Enums"]["app_role"]
          p_user: string
        }
        Returns: undefined
      }
      admin_set_plan: {
        Args: {
          p_plan: Database["public"]["Enums"]["plan_type"]
          p_plan_name?: string
          p_user: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      submit_job_v2: { Args: { p_payload: Json }; Returns: string }
    }
    Enums: {
      app_role: "customer" | "admin" | "production" | "qa"
      job_status:
        | "submitted"
        | "under_production"
        | "in_review"
        | "completed"
        | "revision_requested"
      plan_type: "credit" | "unlimited_monthly" | "none"
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
      app_role: ["customer", "admin", "production", "qa"],
      job_status: [
        "submitted",
        "under_production",
        "in_review",
        "completed",
        "revision_requested",
      ],
      plan_type: ["credit", "unlimited_monthly", "none"],
    },
  },
} as const
