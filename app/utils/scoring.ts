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
  
  export const calculateNFLPoints = (stats: GameStats, rules: NFLScoringRules): number => {
      let points = 0;
      
      // Passing
      if (rules.passing) {
        points += (stats.passing_yards || 0) * (rules.passing.yards || 0);
        points += (stats.passing_tds || 0) * (rules.passing.touchdown || 0);
        points += (stats.interceptions || 0) * (rules.passing.interception || 0);
        
        // Passing yardage bonuses
        if (rules.passing.bonus_300_yards && (stats.passing_yards || 0) >= 300) {
          points += rules.passing.bonus_300_yards;
        }
        if (rules.passing.bonus_400_yards && (stats.passing_yards || 0) >= 400) {
          points += rules.passing.bonus_400_yards;
        }
      }
      
      // Rushing
      if (rules.rushing) {
        points += (stats.rushing_yards || 0) * (rules.rushing.yards || 0);
        points += (stats.rushing_tds || 0) * (rules.rushing.touchdown || 0);
        
        // Rushing yardage bonuses
        if (rules.rushing.bonus_100_yards && (stats.rushing_yards || 0) >= 100) {
          points += rules.rushing.bonus_100_yards;
        }
        if (rules.rushing.bonus_200_yards && (stats.rushing_yards || 0) >= 200) {
          points += rules.rushing.bonus_200_yards;
        }
      }
      
      // Receiving
      if (rules.receiving) {
        points += (stats.receptions || 0) * (rules.receiving.reception || 0);
        points += (stats.receiving_yards || 0) * (rules.receiving.yards || 0);
        points += (stats.receiving_tds || 0) * (rules.receiving.touchdown || 0);
        
        // Receiving yardage bonuses
        if (rules.receiving.bonus_100_yards && (stats.receiving_yards || 0) >= 100) {
          points += rules.receiving.bonus_100_yards;
        }
        if (rules.receiving.bonus_200_yards && (stats.receiving_yards || 0) >= 200) {
          points += rules.receiving.bonus_200_yards;
        }
      }
    
    // Kicking
    if (rules.kicking && stats.field_goals) {
      points += (stats.field_goals_0_39 || 0) * (rules.kicking.field_goal_0_39 || 0);
      points += (stats.field_goals_40_49 || 0) * (rules.kicking.field_goal_40_49 || 0);
      points += (stats.field_goals_50_59 || 0) * (rules.kicking.field_goal_50_59 || 0);
      points += (stats.field_goals_60_plus || 0) * (rules.kicking.field_goal_60_plus || 0);
      points += (stats.extra_points || 0) * (rules.kicking.extra_point || 0);
      points += (stats.missed_field_goals || 0) * (rules.kicking.missed_field_goal || 0);
      points += (stats.missed_extra_points || 0) * (rules.kicking.missed_extra_point || 0);
    }
    
    // Defense/Special Teams
    if (rules.defense) {
      // Add defense scoring based on your stats tracking
      // points += calculateDefensePoints(stats, rules.defense);
    }
    
    // Misc
    if (rules.misc) {
      points += (stats.fumbles || 0) * (rules.misc.fumble_lost || 0);
      points += (stats.two_point_conversions || 0) * (rules.misc.two_point_conversion || 0);
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