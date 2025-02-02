# Fantasy Scoring System

## Architecture Documentation
`/docs/architecture/scoring-system.md`

The fantasy scoring system is designed to handle multiple sports (NFL, NBA) with flexible, configurable scoring rules stored at the league level.

### Database Structure

#### Leagues Table
- `scoring_rules` JSONB column stores sport-specific scoring configurations
- `custom_scoring_enabled` boolean flag for enabling custom scoring
- `default_scoring_rules` JSONB column for storing default rules
- Each league can have its own custom scoring rules
- Rules are stored in a structured JSON format for flexibility

#### Game Stats Table
Stores raw game statistics for all supported sports:

**Common Fields:**
- `id` (UUID): Primary key
- `player_id` (UUID): Reference to players table
- `game_id` (string): Game identifier
- `game_date` (date): Date of the game
- `season_year` (integer): Season year
- `week_number` (integer): Week number
- `opponent` (string): Opposing team
- `home_team` (boolean): Whether player was on home team
- `started` (boolean): Whether player started the game
- `points` (integer): Total points scored
- `points_allowed` (integer): Points allowed (defense)

**Basketball Stats:**
- `minutes_played` (integer)
- `points` (integer)
- `rebounds` (integer) 
- `assists` (integer)
- `steals` (integer)
- `blocks` (integer)
- `turnovers` (integer)

**Football Stats:**
- Passing:
  - `passing_yards` (integer)
  - `passing_attempts` (integer)
  - `passing_completions` (integer) 
  - `passing_tds` (integer)
  - `passing_2pt_conversions` (integer)

- Rushing:
  - `rushing_yards` (integer)
  - `rushing_tds` (integer)
  - `rushing_2pt_conversions` (integer)

- Receiving:
  - `receptions` (integer)
  - `receiving_yards` (integer)
  - `receiving_tds` (integer)
  - `receiving_2pt_conversions` (integer)

- Kicking:
  - `field_goals_attempted` (integer)
  - `field_goals_made_0_39` (integer)
  - `field_goals_made_40_49` (integer)
  - `field_goals_made_50_plus` (integer)
  - `extra_points_attempted` (integer)
  - `extra_points_made` (integer)

- Defense/Special Teams:
  - `sacks` (integer)
  - `interceptions` (integer)
  - `fumbles_recovered` (integer)
  - `safeties` (integer)
  - `blocked_kicks` (integer)
  - `defensive_touchdowns` (integer)
  - `special_teams_touchdowns` (integer)

### Scoring Rules Structure
The scoring rules are defined in TypeScript interfaces: