# Weekly Picks System

## Overview
The Weekly Picks system manages NFL Playoff fantasy team selections, enforcing rules about player usage and lineup requirements.

## Database Structure

### weekly_picks Table
```sql
CREATE TABLE weekly_picks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id uuid REFERENCES teams(id) NOT NULL,
    player_id uuid REFERENCES players(id) NOT NULL,
    week_number integer NOT NULL CHECK (week_number BETWEEN 1 AND 4),
    slot_position text NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL
);
```

### Constraints
- Each player can only be picked once per team (unique team_id, player_id)
- One pick per position per week (unique team_id, week_number, slot_position)
- Valid slot positions enforced by check constraint

## Component Architecture

### WeeklyPicks Component
```typescript
type WeeklyPicksProps = {
    team: TeamWithPlayers;
    currentWeek: number;
};
```

### Key Features
1. Position Validation
   - Validates players against allowed positions
   - Special handling for FLEX position
   - Prevents duplicate player selections

2. Week Management
   - Tracks current playoff week
   - Maintains history of picks
   - Prevents modifications to past weeks

3. UI Organization
   - Grouped by position
   - Shows available players
   - Displays current selections

## Business Rules

### Lineup Requirements
- 1 QB
- 2 RB
- 2 WR
- 1 TE
- 1 FLEX (RB/WR/TE)
- 1 K
- 1 D/ST

### Player Usage Rules
- Each player can only be used once per team across all weeks
- FLEX position cannot duplicate a player already picked in their primary position
- Picks are locked when games begin

## Implementation Details

### Player Selection Flow
1. Fetch available players
2. Filter by position
3. Remove previously used players
4. Validate selection
5. Update UI
6. Save to database

### Error Handling
- Position validation errors
- Duplicate player checks
- Missing required positions
- Database operation failures

## Future Enhancements

### Planned Features
1. Score Tracking
   - Real-time scoring updates
   - Historical performance view
   - Weekly summaries

2. Pick Management
   - Bulk pick submission
   - Pick suggestions
   - Injury updates

3. User Experience
   - Player statistics
   - Pick confirmation
   - Lock time warnings

### Technical Debt
- Add transaction support for pick submission
- Implement caching for player data
- Add batch operations for performance
- Improve error handling granularity