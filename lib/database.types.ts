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
      game_stats: {
        Row: {
          assists: number | null
          blocks: number | null
          created_at: string
          fumbles: number | null
          game_date: string | null
          id: string
          interceptions: number | null
          minutes_played: number | null
          passing_tds: number | null
          passing_yards: number | null
          player_id: string
          points: number | null
          rebounds: number | null
          receiving_tds: number | null
          receiving_yards: number | null
          receptions: number | null
          rushing_tds: number | null
          rushing_yards: number | null
          season_year: number | null
          steals: number | null
          turnovers: number | null
          two_point_conversions: number | null
          week_number: number | null
        }
        Insert: {
          assists?: number | null
          blocks?: number | null
          created_at?: string
          fumbles?: number | null
          game_date?: string | null
          id?: string
          interceptions?: number | null
          minutes_played?: number | null
          passing_tds?: number | null
          passing_yards?: number | null
          player_id: string
          points?: number | null
          rebounds?: number | null
          receiving_tds?: number | null
          receiving_yards?: number | null
          receptions?: number | null
          rushing_tds?: number | null
          rushing_yards?: number | null
          season_year?: number | null
          steals?: number | null
          turnovers?: number | null
          two_point_conversions?: number | null
          week_number?: number | null
        }
        Update: {
          assists?: number | null
          blocks?: number | null
          created_at?: string
          fumbles?: number | null
          game_date?: string | null
          id?: string
          interceptions?: number | null
          minutes_played?: number | null
          passing_tds?: number | null
          passing_yards?: number | null
          player_id?: string
          points?: number | null
          rebounds?: number | null
          receiving_tds?: number | null
          receiving_yards?: number | null
          receptions?: number | null
          rushing_tds?: number | null
          rushing_yards?: number | null
          season_year?: number | null
          steals?: number | null
          turnovers?: number | null
          two_point_conversions?: number | null
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          commish: string
          created_at: string
          id: string
          league: string
          name: string
          num_teams: number
          scoring_rules: Json
          scoring_type: string
        }
        Insert: {
          commish: string
          created_at?: string
          id?: string
          league: string
          name: string
          num_teams: number
          scoring_rules?: Json
          scoring_type: string
        }
        Update: {
          commish?: string
          created_at?: string
          id?: string
          league?: string
          name?: string
          num_teams?: number
          scoring_rules?: Json
          scoring_type?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          attempts: number | null
          carries: number | null
          college: string | null
          completions: number | null
          created_at: string
          external_id: string | null
          fumbles: number | null
          games: number | null
          height: string | null
          id: string
          interceptions: number | null
          name: string
          number: number | null
          passing_tds: number | null
          passing_yards: number | null
          pic_url: string | null
          position: string
          receiving_tds: number | null
          receiving_yards: number | null
          receptions: number | null
          rushing_tds: number | null
          rushing_yards: number | null
          season: string | null
          targets: number | null
          team_id: string | null
          team_name: string
          weight: number | null
        }
        Insert: {
          attempts?: number | null
          carries?: number | null
          college?: string | null
          completions?: number | null
          created_at?: string
          external_id?: string | null
          fumbles?: number | null
          games?: number | null
          height?: string | null
          id?: string
          interceptions?: number | null
          name: string
          number?: number | null
          passing_tds?: number | null
          passing_yards?: number | null
          pic_url?: string | null
          position: string
          receiving_tds?: number | null
          receiving_yards?: number | null
          receptions?: number | null
          rushing_tds?: number | null
          rushing_yards?: number | null
          season?: string | null
          targets?: number | null
          team_id?: string | null
          team_name: string
          weight?: number | null
        }
        Update: {
          attempts?: number | null
          carries?: number | null
          college?: string | null
          completions?: number | null
          created_at?: string
          external_id?: string | null
          fumbles?: number | null
          games?: number | null
          height?: string | null
          id?: string
          interceptions?: number | null
          name?: string
          number?: number | null
          passing_tds?: number | null
          passing_yards?: number | null
          pic_url?: string | null
          position?: string
          receiving_tds?: number | null
          receiving_yards?: number | null
          receptions?: number | null
          rushing_tds?: number | null
          rushing_yards?: number | null
          season?: string | null
          targets?: number | null
          team_id?: string | null
          team_name?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          id: string
          is_commish: boolean
          league_id: string
          name: string
          team_players: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_commish?: boolean
          league_id: string
          name: string
          team_players?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_commish?: boolean
          league_id?: string
          name?: string
          team_players?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_picks: {
        Row: {
          created_at: string
          id: string
          player_id: string
          slot_position: string
          team_id: string
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          player_id: string
          slot_position: string
          team_id: string
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          player_id?: string
          slot_position?: string
          team_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "weekly_picks_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_picks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
