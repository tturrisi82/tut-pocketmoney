// Manually maintained until you run:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.types.ts

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'parent' | 'child'
          display_name: string
          email: string | null
          created_at: string
        }
        Insert: {
          id: string
          role: 'parent' | 'child'
          display_name: string
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'parent' | 'child'
          display_name?: string
          email?: string | null
          created_at?: string
        }
        Relationships: []
      }
      chores: {
        Row: {
          id: string
          title: string
          description: string | null
          frequency: 'daily' | 'weekly'
          day_of_week: number | null
          is_active: boolean
          category_id: string | null
          sort_order: number
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          frequency: 'daily' | 'weekly'
          day_of_week?: number | null
          is_active?: boolean
          category_id?: string | null
          sort_order?: number
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          frequency?: 'daily' | 'weekly'
          day_of_week?: number | null
          is_active?: boolean
          category_id?: string | null
          sort_order?: number
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chores_created_by_fkey'
            columns: ['created_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      chore_instances: {
        Row: {
          id: string
          chore_id: string
          due_date: string
          status: 'pending' | 'pending_approval' | 'approved' | 'rejected'
          completed_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          rejection_note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          chore_id: string
          due_date: string
          status?: 'pending' | 'pending_approval' | 'approved' | 'rejected'
          completed_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rejection_note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          chore_id?: string
          due_date?: string
          status?: 'pending' | 'pending_approval' | 'approved' | 'rejected'
          completed_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          rejection_note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chore_instances_chore_id_fkey'
            columns: ['chore_id']
            isOneToOne: false
            referencedRelation: 'chores'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'chore_instances_reviewed_by_fkey'
            columns: ['reviewed_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          sort_order: number
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: number
          weekly_target: number
          updated_at: string
        }
        Insert: {
          id?: number
          weekly_target?: number
          updated_at?: string
        }
        Update: {
          id?: number
          weekly_target?: number
          updated_at?: string
        }
        Relationships: []
      }
      notification_log: {
        Row: {
          id: string
          chore_instance_id: string
          notification_type: string
          sent_at: string
          phone_to: string
          success: boolean
          error_message: string | null
        }
        Insert: {
          id?: string
          chore_instance_id: string
          notification_type: string
          sent_at?: string
          phone_to: string
          success?: boolean
          error_message?: string | null
        }
        Update: {
          id?: string
          chore_instance_id?: string
          notification_type?: string
          sent_at?: string
          phone_to?: string
          success?: boolean
          error_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'notification_log_chore_instance_id_fkey'
            columns: ['chore_instance_id']
            isOneToOne: false
            referencedRelation: 'chore_instances'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
