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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      draft_picks: {
        Row: {
          created_at: string | null
          draft_id: string
          id: string
          is_auto_pick: boolean | null
          pick_number: number
          pick_time: string | null
          player_id: string
          round_number: number
          team_id: string
        }
        Insert: {
          created_at?: string | null
          draft_id: string
          id?: string
          is_auto_pick?: boolean | null
          pick_number: number
          pick_time?: string | null
          player_id: string
          round_number: number
          team_id: string
        }
        Update: {
          created_at?: string | null
          draft_id?: string
          id?: string
          is_auto_pick?: boolean | null
          pick_number?: number
          pick_time?: string | null
          player_id?: string
          round_number?: number
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_picks_draft_id_fkey"
            columns: ["draft_id"]
            isOneToOne: false
            referencedRelation: "draft_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_picks_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_picks_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_queue: {
        Row: {
          created_at: string | null
          id: string
          player_id: string
          priority: number
          team_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          player_id: string
          priority: number
          team_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          player_id?: string
          priority?: number
          team_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "draft_queue_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_queue_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_settings: {
        Row: {
          auto_pick_enabled: boolean
          created_at: string | null
          current_pick: number | null
          current_round: number | null
          draft_date: string | null
          draft_status: string
          draft_type: string
          id: string
          is_paused: boolean
          league_id: string
          pick_order: Json | null
          time_per_pick: number
          updated_at: string | null
        }
        Insert: {
          auto_pick_enabled?: boolean
          created_at?: string | null
          current_pick?: number | null
          current_round?: number | null
          draft_date?: string | null
          draft_status?: string
          draft_type: string
          id?: string
          is_paused?: boolean
          league_id: string
          pick_order?: Json | null
          time_per_pick?: number
          updated_at?: string | null
        }
        Update: {
          auto_pick_enabled?: boolean
          created_at?: string | null
          current_pick?: number | null
          current_round?: number | null
          draft_date?: string | null
          draft_status?: string
          draft_type?: string
          id?: string
          is_paused?: boolean
          league_id?: string
          pick_order?: Json | null
          time_per_pick?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "draft_settings_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: true
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      game_stats: {
        Row: {
          assists: number | null
          blocked_kicks: number | null
          blocks: number | null
          created_at: string
          def_interceptions: number | null
          defensive_touchdowns: number | null
          extra_points_attempted: number | null
          extra_points_made: number | null
          field_goals_attempted: number | null
          field_goals_longest: number | null
          field_goals_made: number | null
          field_goals_made_0_39: number | null
          field_goals_made_40_49: number | null
          field_goals_made_50_plus: number | null
          fumbles: number | null
          fumbles_forced: number | null
          fumbles_lost: number | null
          fumbles_recovered: number | null
          game_date: string | null
          game_id: string | null
          home_team: boolean | null
          id: string
          interceptions: number | null
          kicking_points: number | null
          minutes_played: number | null
          opponent: string | null
          passing_2pt_conversions: number | null
          passing_attempts: number | null
          passing_completions: number | null
          passing_tds: number | null
          passing_yards: number | null
          player_id: string
          points: number | null
          points_allowed: number | null
          rebounds: number | null
          receiving_2pt_conversions: number | null
          receiving_tds: number | null
          receiving_yards: number | null
          receptions: number | null
          rushing_2pt_conversions: number | null
          rushing_tds: number | null
          rushing_yards: number | null
          sacks: number | null
          safeties: number | null
          season_year: number | null
          special_teams_touchdowns: number | null
          started: boolean | null
          steals: number | null
          tackles_total: number | null
          turnovers: number | null
          two_point_conversions: number | null
          week_number: number | null
          yards_allowed: number | null
        }
        Insert: {
          assists?: number | null
          blocked_kicks?: number | null
          blocks?: number | null
          created_at?: string
          def_interceptions?: number | null
          defensive_touchdowns?: number | null
          extra_points_attempted?: number | null
          extra_points_made?: number | null
          field_goals_attempted?: number | null
          field_goals_longest?: number | null
          field_goals_made?: number | null
          field_goals_made_0_39?: number | null
          field_goals_made_40_49?: number | null
          field_goals_made_50_plus?: number | null
          fumbles?: number | null
          fumbles_forced?: number | null
          fumbles_lost?: number | null
          fumbles_recovered?: number | null
          game_date?: string | null
          game_id?: string | null
          home_team?: boolean | null
          id?: string
          interceptions?: number | null
          kicking_points?: number | null
          minutes_played?: number | null
          opponent?: string | null
          passing_2pt_conversions?: number | null
          passing_attempts?: number | null
          passing_completions?: number | null
          passing_tds?: number | null
          passing_yards?: number | null
          player_id: string
          points?: number | null
          points_allowed?: number | null
          rebounds?: number | null
          receiving_2pt_conversions?: number | null
          receiving_tds?: number | null
          receiving_yards?: number | null
          receptions?: number | null
          rushing_2pt_conversions?: number | null
          rushing_tds?: number | null
          rushing_yards?: number | null
          sacks?: number | null
          safeties?: number | null
          season_year?: number | null
          special_teams_touchdowns?: number | null
          started?: boolean | null
          steals?: number | null
          tackles_total?: number | null
          turnovers?: number | null
          two_point_conversions?: number | null
          week_number?: number | null
          yards_allowed?: number | null
        }
        Update: {
          assists?: number | null
          blocked_kicks?: number | null
          blocks?: number | null
          created_at?: string
          def_interceptions?: number | null
          defensive_touchdowns?: number | null
          extra_points_attempted?: number | null
          extra_points_made?: number | null
          field_goals_attempted?: number | null
          field_goals_longest?: number | null
          field_goals_made?: number | null
          field_goals_made_0_39?: number | null
          field_goals_made_40_49?: number | null
          field_goals_made_50_plus?: number | null
          fumbles?: number | null
          fumbles_forced?: number | null
          fumbles_lost?: number | null
          fumbles_recovered?: number | null
          game_date?: string | null
          game_id?: string | null
          home_team?: boolean | null
          id?: string
          interceptions?: number | null
          kicking_points?: number | null
          minutes_played?: number | null
          opponent?: string | null
          passing_2pt_conversions?: number | null
          passing_attempts?: number | null
          passing_completions?: number | null
          passing_tds?: number | null
          passing_yards?: number | null
          player_id?: string
          points?: number | null
          points_allowed?: number | null
          rebounds?: number | null
          receiving_2pt_conversions?: number | null
          receiving_tds?: number | null
          receiving_yards?: number | null
          receptions?: number | null
          rushing_2pt_conversions?: number | null
          rushing_tds?: number | null
          rushing_yards?: number | null
          sacks?: number | null
          safeties?: number | null
          season_year?: number | null
          special_teams_touchdowns?: number | null
          started?: boolean | null
          steals?: number | null
          tackles_total?: number | null
          turnovers?: number | null
          two_point_conversions?: number | null
          week_number?: number | null
          yards_allowed?: number | null
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
          custom_scoring_enabled: boolean | null
          default_scoring_rules: Json | null
          id: string
          league: string
          name: string
          num_teams: number
          num_weeks: number
          scoring_rules: Json
          scoring_type: string
        }
        Insert: {
          commish: string
          created_at?: string
          custom_scoring_enabled?: boolean | null
          default_scoring_rules?: Json | null
          id?: string
          league: string
          name: string
          num_teams: number
          num_weeks?: number
          scoring_rules?: Json
          scoring_type: string
        }
        Update: {
          commish?: string
          created_at?: string
          custom_scoring_enabled?: boolean | null
          default_scoring_rules?: Json | null
          id?: string
          league?: string
          name?: string
          num_teams?: number
          num_weeks?: number
          scoring_rules?: Json
          scoring_type?: string
        }
        Relationships: []
      }
      player_rankings: {
        Row: {
          created_at: string | null
          id: string
          league_type: string
          overall_rank: number
          player_id: string
          position_rank: number
          season_year: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          league_type: string
          overall_rank: number
          player_id: string
          position_rank: number
          season_year?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          league_type?: string
          overall_rank?: number
          player_id?: string
          position_rank?: number
          season_year?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_rankings_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          attempts: number | null
          carries: number | null
          completions: number | null
          created_at: string
          external_id: string | null
          fumbles: number | null
          games: number | null
          height: string | null
          id: string
          interceptions: number | null
          league: string | null
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
          summary: string | null
          targets: number | null
          team_id: string | null
          team_name: string
          weight: number | null
          year: string | null
        }
        Insert: {
          attempts?: number | null
          carries?: number | null
          completions?: number | null
          created_at?: string
          external_id?: string | null
          fumbles?: number | null
          games?: number | null
          height?: string | null
          id?: string
          interceptions?: number | null
          league?: string | null
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
          summary?: string | null
          targets?: number | null
          team_id?: string | null
          team_name: string
          weight?: number | null
          year?: string | null
        }
        Update: {
          attempts?: number | null
          carries?: number | null
          completions?: number | null
          created_at?: string
          external_id?: string | null
          fumbles?: number | null
          games?: number | null
          height?: string | null
          id?: string
          interceptions?: number | null
          league?: string | null
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
          summary?: string | null
          targets?: number | null
          team_id?: string | null
          team_name?: string
          weight?: number | null
          year?: string | null
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
      scoring_rules: {
        Row: {
          created_at: string
          id: string
          is_default: boolean | null
          league_id: string | null
          name: string
          rules: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          league_id?: string | null
          name: string
          rules: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean | null
          league_id?: string | null
          name?: string
          rules?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scoring_rules_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          auto_pick_preference: boolean | null
          created_at: string
          id: string
          is_commish: boolean
          league_id: string
          name: string
          team_players: string[] | null
          user_id: string | null
        }
        Insert: {
          auto_pick_preference?: boolean | null
          created_at?: string
          id?: string
          is_commish?: boolean
          league_id: string
          name: string
          team_players?: string[] | null
          user_id?: string | null
        }
        Update: {
          auto_pick_preference?: boolean | null
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
      auto_pick_player: {
        Args: { draft_id: string; team_id: string }
        Returns: string
      }
      insert_default_scoring_rules: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
