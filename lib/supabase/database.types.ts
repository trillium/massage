/**
 * Supabase Database Types
 *
 * TypeScript types for database tables and functions.
 * These provide type safety when querying Supabase.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'user' | 'admin'
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type ReminderChannel = 'email' | 'sms' | 'push' | 'whatsapp'
export type ReminderStatus = 'scheduled' | 'sent' | 'failed' | 'cancelled'
export type ReminderType = '24h_before' | '2h_before' | 'follow_up' | 'custom'

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
      appointments: {
        Row: {
          id: string
          calendar_event_id: string | null
          client_email: string
          client_phone: string | null
          client_first_name: string
          client_last_name: string
          start_time: string
          end_time: string
          duration_minutes: number
          timezone: string
          location: string | null
          price: number | null
          status: AppointmentStatus
          promo: string | null
          booking_url: string | null
          slug_config: Json | null
          source: string | null
          instant_confirm: boolean
          created_at: string
          updated_at: string
          confirmed_at: string | null
          cancelled_at: string | null
        }
        Insert: {
          id?: string
          calendar_event_id?: string | null
          client_email: string
          client_phone?: string | null
          client_first_name: string
          client_last_name: string
          start_time: string
          end_time: string
          duration_minutes: number
          timezone?: string
          location?: string | null
          price?: number | null
          status?: AppointmentStatus
          promo?: string | null
          booking_url?: string | null
          slug_config?: Json | null
          source?: string | null
          instant_confirm?: boolean
          created_at?: string
          updated_at?: string
          confirmed_at?: string | null
          cancelled_at?: string | null
        }
        Update: {
          id?: string
          calendar_event_id?: string | null
          client_email?: string
          client_phone?: string | null
          client_first_name?: string
          client_last_name?: string
          start_time?: string
          end_time?: string
          duration_minutes?: number
          timezone?: string
          location?: string | null
          price?: number | null
          status?: AppointmentStatus
          promo?: string | null
          booking_url?: string | null
          slug_config?: Json | null
          source?: string | null
          instant_confirm?: boolean
          created_at?: string
          updated_at?: string
          confirmed_at?: string | null
          cancelled_at?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          id: string
          appointment_id: string
          channel: ReminderChannel
          reminder_type: ReminderType
          status: ReminderStatus
          scheduled_for: string
          sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          channel: ReminderChannel
          reminder_type: ReminderType
          status?: ReminderStatus
          scheduled_for: string
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          channel?: ReminderChannel
          reminder_type?: ReminderType
          status?: ReminderStatus
          scheduled_for?: string
          sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reminders_appointment_id_fkey'
            columns: ['appointment_id']
            referencedRelation: 'appointments'
            referencedColumns: ['id']
          },
        ]
      }
      reminder_logs: {
        Row: {
          id: string
          reminder_id: string
          channel: ReminderChannel
          recipient: string
          status: string
          error_message: string | null
          response_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          reminder_id: string
          channel: ReminderChannel
          recipient: string
          status: string
          error_message?: string | null
          response_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          reminder_id?: string
          channel?: ReminderChannel
          recipient?: string
          status?: string
          error_message?: string | null
          response_data?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reminder_logs_reminder_id_fkey'
            columns: ['reminder_id']
            referencedRelation: 'reminders'
            referencedColumns: ['id']
          },
        ]
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
      appointment_status: AppointmentStatus
      reminder_channel: ReminderChannel
      reminder_status: ReminderStatus
      reminder_type: ReminderType
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type AdminEmail = Database['public']['Tables']['admin_emails']['Row']
export type AdminEmailInsert = Database['public']['Tables']['admin_emails']['Insert']

export type Appointment = Database['public']['Tables']['appointments']['Row']
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update']

export type Reminder = Database['public']['Tables']['reminders']['Row']
export type ReminderInsert = Database['public']['Tables']['reminders']['Insert']

export type ReminderLog = Database['public']['Tables']['reminder_logs']['Row']
export type ReminderLogInsert = Database['public']['Tables']['reminder_logs']['Insert']

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
