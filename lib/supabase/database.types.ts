/**
 * Supabase Database Types
 *
 * TypeScript types for database tables and functions.
 * These provide type safety when querying Supabase.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'user' | 'admin'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: UserRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: UserRole
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_emails: {
        Row: {
          email: string
          added_at: string
          added_by: string | null
        }
        Insert: {
          email: string
          added_at?: string
          added_by?: string | null
        }
        Update: {
          email?: string
          added_at?: string
          added_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'admin_emails_added_by_fkey'
            columns: ['added_by']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      reviews: {
        Row: {
          id: number
          rating: number
          date: string
          name: string
          source: string
          comment: string | null
          type: string | null
          helpful: number | null
          spellcheck: string | null
        }
        Insert: {
          id?: number
          rating: number
          date: string
          name: string
          source: string
          comment?: string | null
          type?: string | null
          helpful?: number | null
          spellcheck?: string | null
        }
        Update: {
          id?: number
          rating?: number
          date?: string
          name?: string
          source?: string
          comment?: string | null
          type?: string | null
          helpful?: number | null
          spellcheck?: string | null
        }
        Relationships: []
      }
      sandbox_sessions: {
        Row: {
          session_id: string
          events: Json
          emails: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          session_id: string
          events?: Json
          emails?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          session_id?: string
          events?: Json
          emails?: Json
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      promote_to_admin: {
        Args: {
          user_id: string
        }
        Returns: void
      }
      demote_to_user: {
        Args: {
          user_id: string
        }
        Returns: void
      }
      get_my_profile: {
        Args: Record<string, never>
        Returns: {
          id: string
          email: string
          role: UserRole
          created_at: string
          updated_at: string
        }[]
      }
      add_admin_email: {
        Args: {
          admin_email: string
        }
        Returns: void
      }
      remove_admin_email: {
        Args: {
          admin_email: string
        }
        Returns: void
      }
      sandbox_add_event: {
        Args: {
          p_session_id: string
          p_event: Json
          p_max_events?: number
        }
        Returns: void
      }
      sandbox_add_email: {
        Args: {
          p_session_id: string
          p_email: Json
          p_max_emails?: number
        }
        Returns: void
      }
      sandbox_update_event_status: {
        Args: {
          p_session_id: string
          p_calendar_event_id: string
          p_status: string
        }
        Returns: Json
      }
      sandbox_update_event_description: {
        Args: {
          p_session_id: string
          p_calendar_event_id: string
          p_description: string
        }
        Returns: void
      }
    }
    Enums: {
      user_role: UserRole
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type AdminEmail = Database['public']['Tables']['admin_emails']['Row']
export type AdminEmailInsert = Database['public']['Tables']['admin_emails']['Insert']

// Auth user type (from Supabase Auth)
export interface AuthUser {
  id: string
  email?: string
  email_confirmed_at?: string
  created_at?: string
  updated_at?: string
}

// Combined user profile (auth + profile data)
export interface UserProfile extends Profile {
  email_verified: boolean
}
