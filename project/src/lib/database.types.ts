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
      profiles: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'student'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'student'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'student'
          created_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          created_at?: string
        }
      }
      trainings: {
        Row: {
          id: string
          title: string
          video_url: string
          order_number: number
          course_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          video_url: string
          order_number: number
          course_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          video_url?: string
          order_number?: number
          course_id?: string
          created_at?: string
        }
      }
      completed_lessons: {
        Row: {
          id: string
          user_id: string
          training_id: string
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          training_id: string
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          training_id?: string
          completed_at?: string
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
      user_role: 'admin' | 'student'
    }
  }
}