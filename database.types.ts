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
      agent: {
        Row: {
          created_at: string
          id: number
          isAbsent: boolean | null
          maxSlotsPerDay: number | null
          name: string | null
          rotation_parity: string | null
          working_days: Database["public"]["Enums"]["days"][] | null
        }
        Insert: {
          created_at?: string
          id?: number
          isAbsent?: boolean | null
          maxSlotsPerDay?: number | null
          name?: string | null
          rotation_parity?: string | null
          working_days?: Database["public"]["Enums"]["days"][] | null
        }
        Update: {
          created_at?: string
          id?: number
          isAbsent?: boolean | null
          maxSlotsPerDay?: number | null
          name?: string | null
          rotation_parity?: string | null
          working_days?: Database["public"]["Enums"]["days"][] | null
        }
        Relationships: []
      }
      constraintes: {
        Row: {
          additional_service: string | null
          allowed_days: Database["public"]["Enums"]["days"][] | null
          bill: Database["public"]["Enums"]["type_bill"] | null
          created_at: string
          debiting: number | null
          disallow_days: Database["public"]["Enums"]["days"][] | null
          id: string
          per_month: number | null
          resident_id: string | null
          schedule_hours: Database["public"]["Enums"]["hours"][] | null
        }
        Insert: {
          additional_service?: string | null
          allowed_days?: Database["public"]["Enums"]["days"][] | null
          bill?: Database["public"]["Enums"]["type_bill"] | null
          created_at?: string
          debiting?: number | null
          disallow_days?: Database["public"]["Enums"]["days"][] | null
          id?: string
          per_month?: number | null
          resident_id?: string | null
          schedule_hours?: Database["public"]["Enums"]["hours"][] | null
        }
        Update: {
          additional_service?: string | null
          allowed_days?: Database["public"]["Enums"]["days"][] | null
          bill?: Database["public"]["Enums"]["type_bill"] | null
          created_at?: string
          debiting?: number | null
          disallow_days?: Database["public"]["Enums"]["days"][] | null
          id?: string
          per_month?: number | null
          resident_id?: string | null
          schedule_hours?: Database["public"]["Enums"]["hours"][] | null
        }
        Relationships: [
          {
            foreignKeyName: "constraintes_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: true
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      planning: {
        Row: {
          created_at: string
          data: Json | null
          date: string | null
          id: number
          month: number
          year: number
        }
        Insert: {
          created_at?: string
          data?: Json | null
          date?: string | null
          id?: number
          month: number
          year: number
        }
        Update: {
          created_at?: string
          data?: Json | null
          date?: string | null
          id?: number
          month?: number
          year?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          id: string
          role?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      recents_menages: {
        Row: {
          completed_at: string | null
          created_at: string
          date: string | null
          heure: string | null
          id: string
          resident_id: string | null
          started_at: string | null
          statut: Database["public"]["Enums"]["status"] | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          date?: string | null
          heure?: string | null
          id?: string
          resident_id?: string | null
          started_at?: string | null
          statut?: Database["public"]["Enums"]["status"] | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          date?: string | null
          heure?: string | null
          id?: string
          resident_id?: string | null
          started_at?: string | null
          statut?: Database["public"]["Enums"]["status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "recents_menages_resident_id_fkey"
            columns: ["resident_id"]
            isOneToOne: false
            referencedRelation: "residents"
            referencedColumns: ["id"]
          },
        ]
      }
      residents: {
        Row: {
          building: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          prefix: string | null
          room: string | null
        }
        Insert: {
          building?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          prefix?: string | null
          room?: string | null
        }
        Update: {
          building?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          prefix?: string | null
          room?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      validate_cleaning: {
        Args: { p_menage_id: string }
        Returns: {
          completed_at: string | null
          created_at: string
          date: string | null
          heure: string | null
          id: string
          resident_id: string | null
          started_at: string | null
          statut: Database["public"]["Enums"]["status"] | null
        }
        SetofOptions: {
          from: "*"
          to: "recents_menages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      days: "Lundi" | "Mardi" | "Mercredi" | "Jeudi" | "Vendredi"
      hours:
        | "8h00"
        | "8h30"
        | "9h00"
        | "9h30"
        | "10h00"
        | "10h30"
        | "11h00"
        | "11h30"
        | "12h00"
        | "12h30"
        | "13h00"
        | "13h30"
        | "14h00"
        | "14h30"
        | "15h00"
        | "15h30"
        | "16h00"
        | "16h30"
        | "17h00"
      status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
      type_bill: "mail" | "papier"
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
    Enums: {
      days: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"],
      hours: [
        "8h00",
        "8h30",
        "9h00",
        "9h30",
        "10h00",
        "10h30",
        "11h00",
        "11h30",
        "12h00",
        "12h30",
        "13h00",
        "13h30",
        "14h00",
        "14h30",
        "15h00",
        "15h30",
        "16h00",
        "16h30",
        "17h00",
      ],
      status: ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      type_bill: ["mail", "papier"],
    },
  },
} as const
