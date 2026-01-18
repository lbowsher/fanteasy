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
      missed_field_goal_max_distance?: number | null;
      missed_extra_point?: number;
    };
    defense?: {
      sack?: number;
      interception?: number;
      fumble_recovery?: number;
      forced_fumble?: number;
      safety?: number;
      touchdown?: number;
      blocked_kick?: number;
      // Points allowed tiers
      points_allowed_0?: number;
      points_allowed_1_10?: number;
      points_allowed_11_14?: number;
      points_allowed_15_17?: number;
      points_allowed_18_21?: number;
      points_allowed_22_30?: number;
      points_allowed_31_34?: number;
      points_allowed_35_41?: number;
      points_allowed_42_plus?: number;
      // Yards allowed tiers
      yards_allowed_0_199?: number;
      yards_allowed_200_249?: number;
      yards_allowed_250_299?: number;
      yards_allowed_300_349?: number;
      yards_allowed_350_399?: number;
      yards_allowed_400_449?: number;
      yards_allowed_450_499?: number;
      yards_allowed_500_plus?: number;
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

  // Helper function to calculate defensive scoring based on tiers
  const calculateDefensePoints = (stats: GameStats, defenseRules: NFLScoringRules['defense']): number => {
    if (!defenseRules) return 0;

    let points = 0;

    // Individual defensive stats
    points += (stats.sacks || 0) * (defenseRules.sack || 0);
    points += (stats.def_interceptions || 0) * (defenseRules.interception || 0);
    points += (stats.fumbles_recovered || 0) * (defenseRules.fumble_recovery || 0);
    points += (stats.fumbles_forced || 0) * (defenseRules.forced_fumble || 0);
    points += (stats.safeties || 0) * (defenseRules.safety || 0);
    points += (stats.defensive_touchdowns || 0) * (defenseRules.touchdown || 0);
    points += (stats.special_teams_touchdowns || 0) * (defenseRules.touchdown || 0);
    points += (stats.blocked_kicks || 0) * (defenseRules.blocked_kick || 0);

    // Points allowed tiers
    const pointsAllowed = stats.points_allowed;
    if (pointsAllowed !== null && pointsAllowed !== undefined) {
      if (pointsAllowed === 0 && defenseRules.points_allowed_0) {
        points += defenseRules.points_allowed_0;
      } else if (pointsAllowed <= 10 && defenseRules.points_allowed_1_10) {
        points += defenseRules.points_allowed_1_10;
      } else if (pointsAllowed <= 14 && defenseRules.points_allowed_11_14) {
        points += defenseRules.points_allowed_11_14;
      } else if (pointsAllowed <= 17 && defenseRules.points_allowed_15_17) {
        points += defenseRules.points_allowed_15_17;
      } else if (pointsAllowed <= 21 && defenseRules.points_allowed_18_21) {
        points += defenseRules.points_allowed_18_21;
      } else if (pointsAllowed <= 30 && defenseRules.points_allowed_22_30) {
        points += defenseRules.points_allowed_22_30;
      } else if (pointsAllowed <= 34 && defenseRules.points_allowed_31_34) {
        points += defenseRules.points_allowed_31_34;
      } else if (pointsAllowed <= 41 && defenseRules.points_allowed_35_41) {
        points += defenseRules.points_allowed_35_41;
      } else if (pointsAllowed >= 42 && defenseRules.points_allowed_42_plus) {
        points += defenseRules.points_allowed_42_plus;
      }
    }

    // Yards allowed tiers (cast to any since this column may need to be added to the database)
    const yardsAllowed = (stats as any).yards_allowed as number | null | undefined;
    if (yardsAllowed !== null && yardsAllowed !== undefined) {
      if (yardsAllowed < 200 && defenseRules.yards_allowed_0_199) {
        points += defenseRules.yards_allowed_0_199;
      } else if (yardsAllowed <= 249 && defenseRules.yards_allowed_200_249) {
        points += defenseRules.yards_allowed_200_249;
      } else if (yardsAllowed <= 299 && defenseRules.yards_allowed_250_299) {
        points += defenseRules.yards_allowed_250_299;
      } else if (yardsAllowed <= 349 && defenseRules.yards_allowed_300_349) {
        points += defenseRules.yards_allowed_300_349;
      } else if (yardsAllowed <= 399 && defenseRules.yards_allowed_350_399) {
        points += defenseRules.yards_allowed_350_399;
      } else if (yardsAllowed <= 449 && defenseRules.yards_allowed_400_449) {
        points += defenseRules.yards_allowed_400_449;
      } else if (yardsAllowed <= 499 && defenseRules.yards_allowed_450_499) {
        points += defenseRules.yards_allowed_450_499;
      } else if (yardsAllowed >= 500 && defenseRules.yards_allowed_500_plus) {
        points += defenseRules.yards_allowed_500_plus;
      }
    }

    return points;
  };

  export const calculateNFLPoints = (stats: GameStats | GameStats[], rules: NFLScoringRules, debug: boolean = false, position?: string): number => {
      // Convert single stat object to array for consistent handling
      const statsArray = Array.isArray(stats) ? stats : [stats];

      // Aggregate stats across all entries
      const aggregatedStats = statsArray.reduce((acc, stat) => ({
          passing_yards: (acc.passing_yards || 0) + (stat.passing_yards || 0),
          passing_tds: (acc.passing_tds || 0) + (stat.passing_tds || 0),
          interceptions: (acc.interceptions || 0) + (stat.interceptions || 0),
          passing_2pt_conversions: (acc.passing_2pt_conversions || 0) + (stat.passing_2pt_conversions || 0),
          rushing_yards: (acc.rushing_yards || 0) + (stat.rushing_yards || 0),
          rushing_tds: (acc.rushing_tds || 0) + (stat.rushing_tds || 0),
          rushing_2pt_conversions: (acc.rushing_2pt_conversions || 0) + (stat.rushing_2pt_conversions || 0),
          receptions: (acc.receptions || 0) + (stat.receptions || 0),
          receiving_yards: (acc.receiving_yards || 0) + (stat.receiving_yards || 0),
          receiving_tds: (acc.receiving_tds || 0) + (stat.receiving_tds || 0),
          receiving_2pt_conversions: (acc.receiving_2pt_conversions || 0) + (stat.receiving_2pt_conversions || 0),
          extra_points_made: (acc.extra_points_made || 0) + (stat.extra_points_made || 0),
          extra_points_attempted: (acc.extra_points_attempted || 0) + (stat.extra_points_attempted || 0),
          fumbles_lost: (acc.fumbles_lost || 0) + (stat.fumbles_lost || 0),
          two_point_conversions: (acc.two_point_conversions || 0) + (stat.two_point_conversions || 0),
      }), {} as GameStats);

      // Collect all field goal yard arrays across stat entries for kicking calculation
      const allFieldGoalsMade: number[] = [];
      const allFieldGoalsMissed: number[] = [];
      statsArray.forEach(stat => {
          const statAny = stat as any;
          if (statAny.field_goals_made_yards && Array.isArray(statAny.field_goals_made_yards)) {
              allFieldGoalsMade.push(...statAny.field_goals_made_yards);
          }
          if (statAny.field_goals_missed_yards && Array.isArray(statAny.field_goals_missed_yards)) {
              allFieldGoalsMissed.push(...statAny.field_goals_missed_yards);
          }
      });

      let points = 0;

      // Passing
      if (rules.passing) {
        points += (aggregatedStats.passing_yards || 0) * (rules.passing.yards || 0);
        points += (aggregatedStats.passing_tds || 0) * (rules.passing.touchdown || 0);
        points += (aggregatedStats.interceptions || 0) * (rules.passing.interception || 0);
        points += (aggregatedStats.passing_2pt_conversions || 0) * (rules.passing.two_point_conversion || 0);

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
        points += (aggregatedStats.rushing_2pt_conversions || 0) * (rules.rushing.two_point_conversion || 0);

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
        points += (aggregatedStats.receiving_2pt_conversions || 0) * (rules.receiving.two_point_conversion || 0);

        // Receiving yardage bonuses
        if (rules.receiving.bonus_100_yards && (aggregatedStats.receiving_yards || 0) >= 100) {
          points += rules.receiving.bonus_100_yards;
        }
        if (rules.receiving.bonus_200_yards && (aggregatedStats.receiving_yards || 0) >= 200) {
          points += rules.receiving.bonus_200_yards;
        }
      }

    // Kicking
    if (rules.kicking) {
      // Calculate points for each made field goal based on yardage tiers
      allFieldGoalsMade.forEach(yards => {
        if (yards >= 60) {
          points += rules.kicking!.field_goal_60_plus || 0;
        } else if (yards >= 50) {
          points += rules.kicking!.field_goal_50_59 || 0;
        } else if (yards >= 40) {
          points += rules.kicking!.field_goal_40_49 || 0;
        } else {
          points += rules.kicking!.field_goal_0_39 || 0;
        }
      });

      // Calculate points for missed field goals
      allFieldGoalsMissed.forEach((missedYards) => {
        const maxDistance = rules.kicking!.missed_field_goal_max_distance;
        // Only apply penalty if no max distance set, or if missed FG was within max distance
        if (maxDistance === undefined || maxDistance === null || missedYards <= maxDistance) {
          points += rules.kicking!.missed_field_goal || 0;
        }
      });

      // Extra points
      points += (aggregatedStats.extra_points_made || 0) * (rules.kicking.extra_point || 0);
      const missedExtraPoints = (aggregatedStats.extra_points_attempted || 0) - (aggregatedStats.extra_points_made || 0);
      points += missedExtraPoints * (rules.kicking.missed_extra_point || 0);
    }

    // Defense/Special Teams - only apply to D/ST position players
    if (rules.defense && position === 'D/ST') {
      statsArray.forEach(stat => {
        points += calculateDefensePoints(stat, rules.defense);
      });
    }

    // Misc
    if (rules.misc) {
      points += (aggregatedStats.fumbles_lost || 0) * (rules.misc.fumble_lost || 0);
      points += (aggregatedStats.two_point_conversions || 0) * (rules.misc.two_point_conversion || 0);
    }

    return points;
  };
  
  export const calculateNBAPoints = (stats: GameStats, rules: NBAScoringRules): number => {
    let points = 0;
    
    // Basic stats
    if (rules.points) {
      points += (stats.points || 0) * rules.points;
    }
    if (rules.rebound) {
      points += (stats.rebounds || 0) * rules.rebound;
    }
    if (rules.assist) {
      points += (stats.assists || 0) * rules.assist;
    }
    if (rules.steal) {
      points += (stats.steals || 0) * rules.steal;
    }
    if (rules.block) {
      points += (stats.blocks || 0) * rules.block;
    }
    if (rules.turnover) {
      points += (stats.turnovers || 0) * rules.turnover;
    }
    
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
    league: League,
    position?: string
  ): number => {
    const rules = league.scoring_rules as ScoringRules;

    let scoringRules;

    if (!rules || !rules.rules) {
      if (league.default_scoring_rules) {
        scoringRules = league.default_scoring_rules.rules;
      } else {
        console.error('Invalid scoring rules for league:', league.id);
        return 0;
      }
    }
    else {
      scoringRules = rules.rules;
    }

    switch (league.league) {
      case 'NBA':
      case 'NCAAM':
        return calculateNBAPoints(gameStats, scoringRules as NBAScoringRules);
      case 'NFL':
        return calculateNFLPoints(gameStats, scoringRules as NFLScoringRules, false, position);
      default:
        console.error('Unsupported league type:', league.league);
        return 0;
    }
  };
  
  export const calculatePlayerScore = (
    gameStats: GameStats[],
    league: League,
    position?: string
  ): number => {
    return gameStats.reduce((total, stats) =>
      total + calculateFantasyPoints(stats, league, position), 0);
  };

  export const calculateTeamTotalScore = (
    gameStats: GameStats[],
    league: League,
    position?: string
  ): number => {
    return gameStats.reduce((total, stats) =>
      total + calculateFantasyPoints(stats, league, position), 0);
  };

  // Helper function to calculate weekly team scores
  export const calculateWeeklyTeamScores = (
    gameStats: GameStats[],
    league: League,
    position?: string
  ): { [week: number]: number } => {
    const weeklyScores: { [week: number]: number } = {};

    gameStats.forEach(stats => {
      const week = stats.week_number || 1;
      if (!weeklyScores[week]) {
        weeklyScores[week] = 0;
      }
      weeklyScores[week] += calculateFantasyPoints(stats, league, position);
    });

    return weeklyScores;
  };