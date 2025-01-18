# Fantasy Scoring System

## Architecture Documentation
`/docs/architecture/scoring-system.md`

The fantasy scoring system is designed to handle multiple sports (NFL, NBA) with flexible, configurable scoring rules stored at the league level.

### Database Structure

#### Leagues Table
- Added `scoring_rules` JSONB column to store sport-specific scoring configurations
- Each league can have its own custom scoring rules
- Rules are stored in a structured JSON format for flexibility

#### Game Stats Table (formerly Scores)
Stores raw game statistics for all supported sports:

**Common Fields:**
- `id` (UUID): Primary key
- `player_id` (UUID): Reference to players table
- `game_number` (integer): Game identifier
- `game_date` (date): Date of the game
- `season_year` (integer): Season year
- `week_number` (integer): Week number (NFL-specific)

**Basketball Stats:**
- `points` (integer)
- `rebounds` (integer)
- `assists` (integer)
- `steals` (integer)
- `blocks` (integer)
- `turnovers` (integer)
- `minutes_played` (integer)

**Football Stats:**
- `passing_yards` (integer)
- `passing_tds` (integer)
- `interceptions` (integer)
- `rushing_yards` (integer)
- `rushing_tds` (integer)
- `receptions` (integer)
- `receiving_yards` (integer)
- `receiving_tds` (integer)
- `fumbles` (integer)
- `two_point_conversions` (integer)

### Scoring Calculation Flow
1. League scoring rules are stored in the league record
2. Raw game stats are stored in the game_stats table
3. Fantasy points are calculated on-demand using the scoring rules
4. Points are not stored but computed when viewing league/team scores