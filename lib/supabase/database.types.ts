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
      ai_image_results: {
        Row: {
          ai_result_id: string
          created_at: string
          id: string
          image_id: string
          implicit_age: number | null
          implicit_age_gap: number | null
          implicit_age_map: Json | null
          surprise_map: Json | null
          triage_score: number
        }
        Insert: {
          ai_result_id: string
          created_at?: string
          id?: string
          image_id: string
          implicit_age?: number | null
          implicit_age_gap?: number | null
          implicit_age_map?: Json | null
          surprise_map?: Json | null
          triage_score: number
        }
        Update: {
          ai_result_id?: string
          created_at?: string
          id?: string
          image_id?: string
          implicit_age?: number | null
          implicit_age_gap?: number | null
          implicit_age_map?: Json | null
          surprise_map?: Json | null
          triage_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_image_results_ai_result_id_fkey"
            columns: ["ai_result_id"]
            isOneToOne: false
            referencedRelation: "ai_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_image_results_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "images"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_results: {
        Row: {
          age_band: string | null
          completed_at: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          id: string
          inference_time_ms: number | null
          model_version: string
          priority_percentile: number | null
          started_at: string
          status: Database["public"]["Enums"]["ai_run_status"]
          study_id: string
          triage_score: number | null
        }
        Insert: {
          age_band?: string | null
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          inference_time_ms?: number | null
          model_version: string
          priority_percentile?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["ai_run_status"]
          study_id: string
          triage_score?: number | null
        }
        Update: {
          age_band?: string | null
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          inference_time_ms?: number | null
          model_version?: string
          priority_percentile?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["ai_run_status"]
          study_id?: string
          triage_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_results_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "studies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_results_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "worklist_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          study_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          study_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          study_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "studies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_events_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "worklist_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      images: {
        Row: {
          byte_size: number | null
          checksum_sha256: string | null
          created_at: string
          height: number | null
          id: string
          laterality: Database["public"]["Enums"]["laterality_type"]
          mime_type: string | null
          object_key: string
          original_filename: string | null
          sort_order: number
          storage_status: Database["public"]["Enums"]["storage_status"]
          study_id: string
          uploaded_at: string | null
          view: Database["public"]["Enums"]["image_view"]
          width: number | null
        }
        Insert: {
          byte_size?: number | null
          checksum_sha256?: string | null
          created_at?: string
          height?: number | null
          id?: string
          laterality: Database["public"]["Enums"]["laterality_type"]
          mime_type?: string | null
          object_key: string
          original_filename?: string | null
          sort_order?: number
          storage_status?: Database["public"]["Enums"]["storage_status"]
          study_id: string
          uploaded_at?: string | null
          view: Database["public"]["Enums"]["image_view"]
          width?: number | null
        }
        Update: {
          byte_size?: number | null
          checksum_sha256?: string | null
          created_at?: string
          height?: number | null
          id?: string
          laterality?: Database["public"]["Enums"]["laterality_type"]
          mime_type?: string | null
          object_key?: string
          original_filename?: string | null
          sort_order?: number
          storage_status?: Database["public"]["Enums"]["storage_status"]
          study_id?: string
          uploaded_at?: string | null
          view?: Database["public"]["Enums"]["image_view"]
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "images_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "studies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "images_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: false
            referencedRelation: "worklist_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          outcome: Database["public"]["Enums"]["review_outcome"]
          reviewed_at: string
          reviewer_id: string | null
          study_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          outcome: Database["public"]["Enums"]["review_outcome"]
          reviewed_at?: string
          reviewer_id?: string | null
          study_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          outcome?: Database["public"]["Enums"]["review_outcome"]
          reviewed_at?: string
          reviewer_id?: string | null
          study_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: true
            referencedRelation: "studies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_study_id_fkey"
            columns: ["study_id"]
            isOneToOne: true
            referencedRelation: "worklist_studies"
            referencedColumns: ["id"]
          },
        ]
      }
      studies: {
        Row: {
          age_years: number
          arrived_at: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          patient_ref: string | null
          sex: Database["public"]["Enums"]["sex_type"]
          status: Database["public"]["Enums"]["study_status"]
          study_code: string
          updated_at: string
        }
        Insert: {
          age_years: number
          arrived_at?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          patient_ref?: string | null
          sex: Database["public"]["Enums"]["sex_type"]
          status?: Database["public"]["Enums"]["study_status"]
          study_code: string
          updated_at?: string
        }
        Update: {
          age_years?: number
          arrived_at?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          patient_ref?: string | null
          sex?: Database["public"]["Enums"]["sex_type"]
          status?: Database["public"]["Enums"]["study_status"]
          study_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "studies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      worklist_studies: {
        Row: {
          age_years: number | null
          arrived_at: string | null
          created_at: string | null
          id: string | null
          patient_ref: string | null
          priority_percentile: number | null
          sex: Database["public"]["Enums"]["sex_type"] | null
          status: Database["public"]["Enums"]["study_status"] | null
          study_code: string | null
          triage_score: number | null
          updated_at: string | null
          views: string[] | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_analytics: { Args: never; Returns: Json }
      get_system_status: { Args: never; Returns: Json }
      is_active_user: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      ai_run_status: "processing" | "success" | "failed"
      image_view: "PA" | "AP" | "LATERAL" | "OTHER" | "UNKNOWN"
      laterality_type: "left" | "right" | "unknown"
      review_outcome: "fracture" | "no_fracture" | "uncertain"
      sex_type: "male" | "female" | "unknown"
      storage_status: "pending" | "uploaded" | "verified" | "failed" | "deleted"
      study_status:
        | "draft"
        | "uploading"
        | "queued"
        | "processing"
        | "ready"
        | "ai_failed"
        | "reviewed"
      user_role: "radiologist" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export const Constants = {
  public: {
    Enums: {
      ai_run_status: ["processing", "success", "failed"],
      image_view: ["PA", "AP", "LATERAL", "OTHER", "UNKNOWN"],
      laterality_type: ["left", "right", "unknown"],
      review_outcome: ["fracture", "no_fracture", "uncertain"],
      sex_type: ["male", "female", "unknown"],
      storage_status: ["pending", "uploaded", "verified", "failed", "deleted"],
      study_status: [
        "draft",
        "uploading",
        "queued",
        "processing",
        "ready",
        "ai_failed",
        "reviewed",
      ],
      user_role: ["radiologist", "admin"],
    },
  },
} as const
