// utils/scoring.ts

export type NFLScoringRules = {
    passing?: {
      yards?: number;
      touchdown?: number;
      interception?: number;
      two_point_conversion?: number;
      bonus_300_yards?: number;
      bonus_400_yards?: number;
    };
    rushing?: {
      yards?: number;
      touchdown?: number;
      two_point_conversion?: number;
      bonus_100_yards?: number;
      bonus_200_yards?: number;
    };
    receiving?: {
      reception?: number;
      yards?: number;
      touchdown?: number;
      two_point_conversion?: number;
      bonus_100_yards?: number;
      bonus_200_yards?: number;
    };
    kicking?: {
      field_goal_0_39?: number;
      field_goal_40_49?: number;
      field_goal_50_59?: number;
      field_goal_60_plus?: number;
      extra_point?: number;
      missed_field_goal?: number;
      missed_extra_point?: number;
    };
    defense?: {
      sack?: number;
      interception?: number;
      fumble_recovery?: number;
      safety?: number;
      touchdown?: number;
      points_allowed_0?: number;
      points_allowed_1_6?: number;
      points_allowed_7_13?: number;
      points_allowed_14_20?: number;
      points_allowed_21_27?: number;
      points_allowed_28_34?: number;
      points_allowed_35_plus?: number;
    };
    misc?: {
      fumble_lost?: number;
      two_point_conversion?: number;
    };
  };
  
  export type NBAScoringRules = {
    points?: number;
    rebound?: number;
    assist?: number;
    steal?: number;
    block?: number;
    turnover?: number;
    three_pointer?: number;
    double_double?: number;
    triple_double?: number;
    minutes_played?: number;
  };
  
  export type ScoringRules = {
    scoring_type: string;
    rules: NFLScoringRules | NBAScoringRules;
  };

  export const calculateNFLPoints = (stats: GameStats | GameStats[], rules: NFLScoringRules): number => {
      // Convert single stat object to array for consistent handling
      const statsArray = Array.isArray(stats) ? stats : [stats];
      
      // Aggregate stats across all entries
      const aggregatedStats = statsArray.reduce((acc, stat) => ({
          passing_yards: (acc.passing_yards || 0) + (stat.passing_yards || 0),
          passing_tds: (acc.passing_tds || 0) + (stat.passing_tds || 0),
          interceptions: (acc.interceptions || 0) + (stat.interceptions || 0),
          rushing_yards: (acc.rushing_yards || 0) + (stat.rushing_yards || 0),
          rushing_tds: (acc.rushing_tds || 0) + (stat.rushing_tds || 0),
          receptions: (acc.receptions || 0) + (stat.receptions || 0),
          receiving_yards: (acc.receiving_yards || 0) + (stat.receiving_yards || 0),
          receiving_tds: (acc.receiving_tds || 0) + (stat.receiving_tds || 0),
          field_goals_0_39: (acc.field_goals_0_39 || 0) + (stat.field_goals_0_39 || 0),
          field_goals_40_49: (acc.field_goals_40_49 || 0) + (stat.field_goals_40_49 || 0),
          field_goals_50_59: (acc.field_goals_50_59 || 0) + (stat.field_goals_50_59 || 0),
          field_goals_60_plus: (acc.field_goals_60_plus || 0) + (stat.field_goals_60_plus || 0),
          extra_points: (acc.extra_points || 0) + (stat.extra_points || 0),
          missed_field_goals: (acc.missed_field_goals || 0) + (stat.missed_field_goals || 0),
          missed_extra_points: (acc.missed_extra_points || 0) + (stat.missed_extra_points || 0),
          fumbles: (acc.fumbles || 0) + (stat.fumbles || 0),
          two_point_conversions: (acc.two_point_conversions || 0) + (stat.two_point_conversions || 0),
      }), {} as GameStats);

      let points = 0;
      
      // Passing
      if (rules.passing) {
        points += (aggregatedStats.passing_yards || 0) * (rules.passing.yards || 0);
        points += (aggregatedStats.passing_tds || 0) * (rules.passing.touchdown || 0);
        points += (aggregatedStats.interceptions || 0) * (rules.passing.interception || 0);
        
        // Passing yardage bonuses
        if (rules.passing.bonus_300_yards && (aggregatedStats.passing_yards || 0) >= 300) {
          points += rules.passing.bonus_300_yards;
        }
        if (rules.passing.bonus_400_yards && (aggregatedStats.passing_yards || 0) >= 400) {
          points += rules.passing.bonus_400_yards;
        }
      }
      
      // Rushing
      if (rules.rushing) {
        points += (aggregatedStats.rushing_yards || 0) * (rules.rushing.yards || 0);
        points += (aggregatedStats.rushing_tds || 0) * (rules.rushing.touchdown || 0);
        
        // Rushing yardage bonuses
        if (rules.rushing.bonus_100_yards && (aggregatedStats.rushing_yards || 0) >= 100) {
          points += rules.rushing.bonus_100_yards;
        }
        if (rules.rushing.bonus_200_yards && (aggregatedStats.rushing_yards || 0) >= 200) {
          points += rules.rushing.bonus_200_yards;
        }
      }
      
      // Receiving
      if (rules.receiving) {
        points += (aggregatedStats.receptions || 0) * (rules.receiving.reception || 0);
        points += (aggregatedStats.receiving_yards || 0) * (rules.receiving.yards || 0);
        points += (aggregatedStats.receiving_tds || 0) * (rules.receiving.touchdown || 0);
        
        // Receiving yardage bonuses
        if (rules.receiving.bonus_100_yards && (aggregatedStats.receiving_yards || 0) >= 100) {
          points += rules.receiving.bonus_100_yards;
        }
        if (rules.receiving.bonus_200_yards && (aggregatedStats.receiving_yards || 0) >= 200) {
          points += rules.receiving.bonus_200_yards;
        }
      }
    
    // Kicking
    if (rules.kicking && aggregatedStats.field_goals) {
      points += (aggregatedStats.field_goals_0_39 || 0) * (rules.kicking.field_goal_0_39 || 0);
      points += (aggregatedStats.field_goals_40_49 || 0) * (rules.kicking.field_goal_40_49 || 0);
      points += (aggregatedStats.field_goals_50_59 || 0) * (rules.kicking.field_goal_50_59 || 0);
      points += (aggregatedStats.field_goals_60_plus || 0) * (rules.kicking.field_goal_60_plus || 0);
      points += (aggregatedStats.extra_points || 0) * (rules.kicking.extra_point || 0);
      points += (aggregatedStats.missed_field_goals || 0) * (rules.kicking.missed_field_goal || 0);
      points += (aggregatedStats.missed_extra_points || 0) * (rules.kicking.missed_extra_point || 0);
    }
    
    // Defense/Special Teams
    if (rules.defense) {
      // Add defense scoring based on your stats tracking
      // points += calculateDefensePoints(stats, rules.defense);
    }
    
    // Misc
    if (rules.misc) {
      points += (aggregatedStats.fumbles || 0) * (rules.misc.fumble_lost || 0);
      points += (aggregatedStats.two_point_conversions || 0) * (rules.misc.two_point_conversion || 0);
    }
    
    return points;
  };
  
  export const calculateNBAPoints = (stats: GameStats, rules: NBAScoringRules): number => {
    let points = 0;
    
    // Basic stats
    points += (stats.points || 0) * (rules.points || 0);
    points += (stats.rebounds || 0) * (rules.rebound || 0);
    points += (stats.assists || 0) * (rules.assist || 0);
    points += (stats.steals || 0) * (rules.steal || 0);
    points += (stats.blocks || 0) * (rules.block || 0);
    points += (stats.turnovers || 0) * (rules.turnover || 0);
    
    // Advanced stats
    if (rules.three_pointer) {
      points += (stats.three_pointers || 0) * rules.three_pointer;
    }
    
    // Double-double bonus
    if (rules.double_double) {
      const doubleDigitCategories = [
        stats.points || 0,
        stats.rebounds || 0,
        stats.assists || 0,
        stats.steals || 0,
        stats.blocks || 0
      ].filter(stat => stat >= 10).length;
      
      if (doubleDigitCategories >= 2) {
        points += rules.double_double;
      }
      
      // Triple-double bonus
      if (doubleDigitCategories >= 3 && rules.triple_double) {
        points += rules.triple_double;
      }
    }
    
    // Minutes played bonus if applicable
    if (rules.minutes_played && stats.minutes_played) {
      points += stats.minutes_played * rules.minutes_played;
    }
    
    return points;
  };
  
  export const calculateFantasyPoints = (
    gameStats: GameStats,
    league: League
  ): number => {
    const rules = league.scoring_rules as ScoringRules;
    
    if (!rules || !rules.rules) {
      console.error('Invalid scoring rules for league:', league.id);
      return 0;
    }
    
    switch (league.league) {
      case 'NBA':
      case 'NCAAM':
        return calculateNBAPoints(gameStats, rules.rules as NBAScoringRules);
      case 'NFL':
        return calculateNFLPoints(gameStats, rules.rules as NFLScoringRules);
      default:
        console.error('Unsupported league type:', league.league);
        return 0;
    }
  };
  
  export const calculatePlayerScore = (
    gameStats: GameStats[],
    league: League
  ): number => {
    return gameStats.reduce((total, stats) => 
      total + calculateFantasyPoints(stats, league), 0);
  };
  
  export const calculateTeamTotalScore = (
    gameStats: GameStats[],
    league: League
  ): number => {
    return gameStats.reduce((total, stats) => 
      total + calculateFantasyPoints(stats, league), 0);
  };
  
  // Helper function to calculate weekly team scores
  export const calculateWeeklyTeamScores = (
    gameStats: GameStats[],
    league: League
  ): { [week: number]: number } => {
    const weeklyScores: { [week: number]: number } = {};
    
    gameStats.forEach(stats => {
      const week = stats.week_number || 1;
      if (!weeklyScores[week]) {
        weeklyScores[week] = 0;
      }
      weeklyScores[week] += calculateFantasyPoints(stats, league);
    });
    
    return weeklyScores;
  };