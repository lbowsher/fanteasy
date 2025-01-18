// utils/scoring.ts

export type ScoringRules = {
  scoring_type: string;
  rules: {
    // NFL Rules
    passing?: {
      yards?: number;
      touchdown?: number;
      interception?: number;
    };
    rushing?: {
      yards?: number;
      touchdown?: number;
    };
    receiving?: {
      reception?: number;
      yards?: number;
      touchdown?: number;
    };
    fumble?: number;
    two_point_conversion?: number;
    
    // NBA Rules
    points?: number;
    rebound?: number;
    assist?: number;
    steal?: number;
    block?: number;
    turnover?: number;
  };
};

export const calculateNFLPoints = (stats: GameStats, rules: ScoringRules['rules']): number => {
  let points = 0;
  
  // Passing
  if (rules.passing) {
    points += (stats.passing_yards || 0) * (rules.passing.yards || 0);
    points += (stats.passing_tds || 0) * (rules.passing.touchdown || 0);
    points += (stats.interceptions || 0) * (rules.passing.interception || 0);
  }
  
  // Rushing
  if (rules.rushing) {
    points += (stats.rushing_yards || 0) * (rules.rushing.yards || 0);
    points += (stats.rushing_tds || 0) * (rules.rushing.touchdown || 0);
  }
  
  // Receiving
  if (rules.receiving) {
    points += (stats.receptions || 0) * (rules.receiving.reception || 0);
    points += (stats.receiving_yards || 0) * (rules.receiving.yards || 0);
    points += (stats.receiving_tds || 0) * (rules.receiving.touchdown || 0);
  }
  
  // Misc
  points += (stats.fumbles || 0) * (rules.fumble || 0);
  points += (stats.two_point_conversions || 0) * (rules.two_point_conversion || 0);

  //TODO: add kicking and defense scoring
  
  return points;
};

export const calculateNBAPoints = (stats: GameStats, rules: ScoringRules['rules']): number => {
  let points = 0;
  
  points += (stats.points || 0) * (rules.points || 0);
  points += (stats.rebounds || 0) * (rules.rebound || 0);
  points += (stats.assists || 0) * (rules.assist || 0);
  points += (stats.steals || 0) * (rules.steal || 0);
  points += (stats.blocks || 0) * (rules.block || 0);
  points += (stats.turnovers || 0) * (rules.turnover || 0);
  
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
      return calculateNBAPoints(gameStats, rules.rules); // TODO do ncaam
    case 'NFL':
      return calculateNFLPoints(gameStats, rules.rules);
    default:
      console.error('Unsupported league type:', league.league);
      return 0;
  }
};

export const calculateTeamTotalScore = (
  gameStats: GameStats[],
  league: League
): number => {
  return gameStats.reduce((total, stats) => 
    total + calculateFantasyPoints(stats, league), 0);
};