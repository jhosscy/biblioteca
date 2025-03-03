export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          title: string
          type: string
          tags: string[]
          date_added: string
          favorite: boolean
          category: string | null
          background_color: string
          user_id: string | null
          content: string | null
          storage_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          type: string
          tags?: string[]
          date_added?: string
          favorite?: boolean
          category?: string | null
          background_color?: string
          user_id?: string | null
          content?: string | null
          storage_path?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: string
          tags?: string[]
          date_added?: string
          favorite?: boolean
          category?: string | null
          background_color?: string
          user_id?: string | null
          content?: string | null
          storage_path?: string | null
          created_at?: string
        }
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
  }
}