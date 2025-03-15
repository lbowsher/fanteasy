# Fantasy Draft System Documentation

## Overview

This document outlines the fantasy draft system implementation for the fantasy sports application built with Next.js, Tailwind CSS, and Supabase.

## System Architecture

The fantasy draft system consists of:

1. **Database Schema** - Tables and relationships in Supabase
2. **Row-Level Security** - Access control policies for secure data operations
3. **Automated Triggers** - Database functions for maintaining data integrity
4. **Real-time Communication** - Supabase Realtime for synchronizing the draft experience

## Database Schema

### Draft Settings Table

Stores configuration for each league's draft.

```sql
CREATE TABLE public.draft_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  draft_type TEXT NOT NULL CHECK (draft_type IN ('snake', 'linear', 'auction')),
  draft_status TEXT NOT NULL DEFAULT 'scheduled' CHECK (draft_status IN ('scheduled', 'in_progress', 'completed')),
  draft_date TIMESTAMP WITH TIME ZONE,
  time_per_pick INTEGER NOT NULL DEFAULT 60,
  auto_pick_enabled BOOLEAN NOT NULL DEFAULT true,
  pick_order JSONB,
  current_pick INTEGER,
  current_round INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(league_id)
);
```

### Draft Picks Table

Records each selection made during the draft.

```sql
CREATE TABLE public.draft_picks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draft_id UUID NOT NULL REFERENCES public.draft_settings(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  pick_number INTEGER NOT NULL,
  round_number INTEGER NOT NULL,
  pick_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_auto_pick BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(draft_id, pick_number),
  UNIQUE(draft_id, player_id)
);
```

### Draft Queue Table

Allows users to prioritize players they want to draft.

```sql
CREATE TABLE public.draft_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_id, player_id),
  UNIQUE(team_id, priority)
);
```

## Row-Level Security Policies

### Draft Settings RLS

```sql
-- Only commissioners can create and update draft settings
CREATE POLICY draft_settings_insert ON public.draft_settings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.leagues
      WHERE leagues.id = league_id AND leagues.commish = auth.uid()
    )
  );

CREATE POLICY draft_settings_update ON public.draft_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.leagues
      WHERE leagues.id = league_id AND leagues.commish = auth.uid()
    )
  );

-- Only league members can view draft settings
CREATE POLICY draft_settings_select ON public.draft_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.league_id = league_id AND teams.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.leagues
      WHERE leagues.id = league_id AND leagues.commish = auth.uid()
    )
  );
```

### Draft Picks RLS

```sql
-- Only the current team and commissioner can insert draft picks
CREATE POLICY draft_picks_insert ON public.draft_picks
  FOR INSERT WITH CHECK (
    (
      -- Current team's turn
      EXISTS (
        SELECT 1 FROM public.draft_settings ds
        JOIN public.teams t ON t.league_id = ds.league_id
        WHERE ds.id = draft_id
        AND ds.current_pick = pick_number
        AND t.id = team_id
        AND t.user_id = auth.uid()
      )
    ) OR (
      -- Commissioner can make picks
      EXISTS (
        SELECT 1 FROM public.draft_settings ds
        JOIN public.leagues l ON l.id = ds.league_id
        WHERE ds.id = draft_id AND l.commish = auth.uid()
      )
    )
  );

-- No direct updates to draft picks
CREATE POLICY draft_picks_update ON public.draft_picks
  FOR UPDATE USING (false);

-- Everyone in the league can view all draft picks
CREATE POLICY draft_picks_select ON public.draft_picks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.draft_settings ds
      JOIN public.teams t ON t.league_id = ds.league_id
      WHERE ds.id = draft_id AND t.user_id = auth.uid()
    ) OR (
      EXISTS (
        SELECT 1 FROM public.draft_settings ds
        JOIN public.leagues l ON l.id = ds.league_id
        WHERE ds.id = draft_id AND l.commish = auth.uid()
      )
    )
  );
```

### Draft Queue RLS

```sql
-- Users can only manage their own draft queue
CREATE POLICY draft_queue_insert ON public.draft_queue
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_id AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY draft_queue_update ON public.draft_queue
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_id AND teams.user_id = auth.uid()
    )
  );

CREATE POLICY draft_queue_delete ON public.draft_queue
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_id AND teams.user_id = auth.uid()
    )
  );

-- Users can only view their own draft queue
CREATE POLICY draft_queue_select ON public.draft_queue
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_id AND teams.user_id = auth.uid()
    )
  );
```

## Database Trigger Function

Automatically updates draft state and team rosters after each pick.

```sql
CREATE OR REPLACE FUNCTION public.update_draft_after_pick()
RETURNS TRIGGER AS $$
DECLARE
  draft_record public.draft_settings;
  next_pick INTEGER;
  next_round INTEGER;
  total_teams INTEGER;
  draft_type TEXT;
BEGIN
  -- Get draft information
  SELECT * INTO draft_record FROM public.draft_settings WHERE id = NEW.draft_id;
  
  -- Get total teams in league
  SELECT COUNT(*) INTO total_teams FROM public.teams WHERE league_id = draft_record.league_id;
  
  -- Set next pick and round
  next_pick := NEW.pick_number + 1;
  next_round := NEW.round_number;
  
  -- Calculate next pick based on draft type
  IF draft_record.draft_type = 'snake' THEN
    -- If end of round, increment round
    IF next_pick % total_teams = 0 THEN
      next_round := next_round + 1;
    END IF;
    
    -- Check if we need to reverse direction (snake draft)
    IF (next_round % 2 = 0) THEN
      -- Even rounds go in reverse order
      next_pick := (next_round * total_teams) - (next_pick - ((next_round-1) * total_teams)) + 1;
    END IF;
  ELSE 
    -- Linear draft just increments pick
    IF next_pick % total_teams = 0 THEN
      next_round := next_round + 1;
    END IF;
  END IF;
  
  -- Update draft settings with next pick information
  UPDATE public.draft_settings 
  SET 
    current_pick = next_pick,
    current_round = next_round,
    updated_at = now(),
    -- Check if draft is completed
    draft_status = CASE 
                     WHEN next_round > (draft_record.pick_order::jsonb->>'total_rounds')::int THEN 'completed'
                     ELSE 'in_progress'
                   END
  WHERE id = NEW.draft_id;
  
  -- Update team_players array to include the drafted player
  UPDATE public.teams
  SET team_players = array_append(COALESCE(team_players, ARRAY[]::uuid[]), NEW.player_id::uuid)
  WHERE id = NEW.team_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run after draft pick insertion
CREATE TRIGGER after_draft_pick_insert
  AFTER INSERT ON public.draft_picks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_draft_after_pick();
```

## Benefits of Database Triggers

The draft system uses a database trigger for several important reasons:

1. **Data Consistency** - Ensures atomic updates when a draft pick is made
2. **Concurrency Control** - Eliminates race conditions during simultaneous user actions
3. **Single Source of Truth** - Centralizes complex draft rules
4. **Reduced Network Traffic** - Minimizes round trips between app and database
5. **Simplified Client Code** - Keeps business logic at the database level

## Real-time Communication

Supabase Realtime has been enabled for the draft tables through the Supabase dashboard. This allows all connected clients to receive real-time updates when:

- Draft settings change (e.g., draft starts or advances to next pick)
- A pick is made by any team
- Draft queue changes

## Frontend Implementation Considerations

For the Next.js frontend, implement:

1. **Draft Room Component** - Main interface for the draft
2. **Player Search/Filter** - For finding available players
3. **Draft Queue Management** - For pre-draft preparation
4. **Draft Timer** - Client-side timer synced with server
5. **Auto-pick Logic** - For handling when a user's time expires

## Type Definitions

Add these types to your `global.d.ts` file:

```typescript
type DraftSettings = Database['public']['Tables']['draft_settings']['Row']
type DraftPick = Database['public']['Tables']['draft_picks']['Row']
type DraftQueue = Database['public']['Tables']['draft_queue']['Row']

// Enhanced types with relationships
type DraftSettingsWithLeague = DraftSettings & {
  league: League;
}

type DraftPickWithDetails = DraftPick & {
  team: Team;
  player: Player;
}
```

## Next Steps

1. Create the draft room UI components
2. Implement draft state management in React
3. Set up real-time subscriptions to draft changes
4. Add commissioner controls for managing the draft
5. Implement auto-pick functionality for absent users