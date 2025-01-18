## Development Documentation
`/docs/development/scoring-implementation.md`

### Scoring Rules Format

#### NFL PPR Scoring Example
```json
{
  "scoring_type": "NFL_PPR",
  "rules": {
    "passing": {
      "yards": 0.04,
      "touchdown": 4,
      "interception": -2
    },
    "rushing": {
      "yards": 0.1,
      "touchdown": 6
    },
    "receiving": {
      "reception": 1,
      "yards": 0.1,
      "touchdown": 6
    },
    "fumble": -2,
    "two_point_conversion": 2
  }
}
```

#### NBA Points Scoring Example
```json
{
  "scoring_type": "NBA_POINTS",
  "rules": {
    "points": 1,
    "rebound": 1.2,
    "assist": 1.5,
    "steal": 2,
    "block": 2,
    "turnover": -1
  }
}
```

### Implementation Details

#### Scoring Calculation
Points are calculated using utility functions in `/utils/scoring.ts`:
- `calculateFantasyPoints`: Main entry point for scoring calculation
- `calculateNFLPoints`: NFL-specific scoring logic
- `calculateNBAPoints`: NBA-specific scoring logic
- `calculateTeamTotalScore`: Aggregates player scores for team totals

#### Type Definitions
Core types are defined in the database types file:
- `GameStats`: Raw game statistics
- `ScoringRules`: League scoring configuration
- `League`: Includes scoring rules

### Performance Considerations
- Points are calculated on-demand rather than stored
- Database indexes on game_stats table optimize queries
- Consider implementing caching for larger leagues
- Monitor query performance with large datasets