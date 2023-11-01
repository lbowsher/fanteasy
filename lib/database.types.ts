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
      leagues: {
        Row: {
          id: string
          is_bestball: boolean
          league: string
          name: string
          num_teams: number
        }
        Insert: {
          id?: string
          is_bestball?: boolean
          league?: string
          name: string
          num_teams: number
        }
        Update: {
          id?: string
          is_bestball?: boolean
          league?: string
          name?: string
          num_teams?: number
        }
        Relationships: []
      }
      players: {
        Row: {
          id: string
          name: string
          pic_url: string | null
          position: string
          scores: number[]
          team_name: string
        }
        Insert: {
          id?: string
          name: string
          pic_url?: string | null
          position: string
          scores?: number[]
          team_name?: string
        }
        Update: {
          id?: string
          name?: string
          pic_url?: string | null
          position?: string
          scores?: number[]
          team_name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string
          id: string
          name: string
          username: string
        }
        Insert: {
          avatar_url: string
          id: string
          name: string
          username: string
        }
        Update: {
          avatar_url?: string
          id?: string
          name?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          id: number
          is_commish: boolean
          league_id: string | null
          name: string
          players: string[] | null
          user_id: string | null
        }
        Insert: {
          id?: number
          is_commish?: boolean
          league_id?: string | null
          name?: string
          players?: string[] | null
          user_id?: string | null
        }
        Update: {
          id?: number
          is_commish?: boolean
          league_id?: string | null
          name?: string
          players?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_league_id_fkey"
            columns: ["league_id"]
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
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
