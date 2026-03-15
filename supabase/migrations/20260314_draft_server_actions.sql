-- Migration: Draft Server Actions + Postgres RPC
-- Adds timer_started_at column and make_draft_pick atomic RPC function

-- Step 1: Add timer_started_at column to draft_settings
ALTER TABLE draft_settings
ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMPTZ;

-- Step 2: Create the atomic make_draft_pick function
CREATE OR REPLACE FUNCTION make_draft_pick(
    p_draft_id UUID,
    p_team_id UUID,
    p_player_id TEXT,
    p_is_auto_pick BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_draft RECORD;
    v_pick_order UUID[];
    v_total_teams INT;
    v_current_index INT;
    v_expected_team_id UUID;
    v_total_picks INT;
    v_max_picks INT;
    v_new_pick_number INT;
    v_new_round INT;
    v_new_current_pick INT;
    v_pick_id UUID;
    v_is_snake BOOLEAN;
    v_next_index INT;
BEGIN
    -- Lock the draft_settings row to prevent concurrent picks
    SELECT *
    INTO v_draft
    FROM draft_settings
    WHERE id = p_draft_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Draft not found');
    END IF;

    -- Verify draft is in progress and not paused
    IF v_draft.draft_status != 'in_progress' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Draft is not in progress');
    END IF;

    IF v_draft.is_paused THEN
        RETURN jsonb_build_object('success', false, 'error', 'Draft is paused');
    END IF;

    -- Extract pick order array from JSONB
    SELECT ARRAY(
        SELECT (jsonb_array_elements_text(v_draft.pick_order->'order'))::UUID
    ) INTO v_pick_order;

    v_total_teams := array_length(v_pick_order, 1);

    IF v_total_teams IS NULL OR v_total_teams = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid pick order');
    END IF;

    -- Determine if snake draft
    v_is_snake := (v_draft.draft_type = 'snake');

    -- Calculate which team should be picking
    -- For snake drafts: odd rounds go forward, even rounds go backward
    v_current_index := ((v_draft.current_pick - 1) % v_total_teams) + 1;

    IF v_is_snake AND (v_draft.current_round % 2 = 0) THEN
        -- Even rounds go in reverse order
        v_expected_team_id := v_pick_order[v_total_teams - v_current_index + 1];
    ELSE
        v_expected_team_id := v_pick_order[v_current_index];
    END IF;

    -- Verify it's the correct team's turn
    IF v_expected_team_id != p_team_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not this team''s turn');
    END IF;

    -- Verify player hasn't already been drafted
    IF EXISTS (
        SELECT 1 FROM draft_picks
        WHERE draft_id = p_draft_id AND player_id = p_player_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Player already drafted');
    END IF;

    -- Verify player exists
    IF NOT EXISTS (
        SELECT 1 FROM players WHERE id = p_player_id
    ) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Player not found');
    END IF;

    -- Calculate pick number (overall pick number across all rounds)
    v_new_pick_number := ((v_draft.current_round - 1) * v_total_teams) + v_draft.current_pick;

    -- Insert the draft pick
    INSERT INTO draft_picks (draft_id, team_id, player_id, pick_number, round_number, is_auto_pick)
    VALUES (p_draft_id, p_team_id, p_player_id, v_new_pick_number, v_draft.current_round, p_is_auto_pick)
    RETURNING id INTO v_pick_id;

    -- Advance to next pick
    v_new_current_pick := v_draft.current_pick + 1;
    v_new_round := v_draft.current_round;

    IF v_new_current_pick > v_total_teams THEN
        -- Move to next round
        v_new_current_pick := 1;
        v_new_round := v_new_round + 1;
    END IF;

    -- Calculate max total picks based on number of rounds in draft
    -- Use the total_rounds from draft settings, or default to a reasonable number
    v_max_picks := v_total_teams * COALESCE(
        (v_draft.pick_order->>'total_rounds')::INT,
        15  -- default fallback
    );

    v_total_picks := (SELECT COUNT(*) FROM draft_picks WHERE draft_id = p_draft_id);

    -- Check if draft is complete
    IF v_total_picks >= v_max_picks THEN
        UPDATE draft_settings
        SET draft_status = 'completed',
            current_pick = v_new_current_pick,
            current_round = v_new_round,
            timer_started_at = NULL,
            updated_at = NOW()
        WHERE id = p_draft_id;

        RETURN jsonb_build_object(
            'success', true,
            'pick_id', v_pick_id,
            'draft_completed', true
        );
    END IF;

    -- Update draft settings for next pick
    UPDATE draft_settings
    SET current_pick = v_new_current_pick,
        current_round = v_new_round,
        timer_started_at = NOW(),
        updated_at = NOW()
    WHERE id = p_draft_id;

    RETURN jsonb_build_object(
        'success', true,
        'pick_id', v_pick_id,
        'draft_completed', false,
        'next_pick', v_new_current_pick,
        'next_round', v_new_round
    );
END;
$$;

-- Step 3: Create auto_pick_expired_drafts function for server-side auto-pick
CREATE OR REPLACE FUNCTION auto_pick_expired_drafts()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_draft RECORD;
    v_pick_order UUID[];
    v_total_teams INT;
    v_current_index INT;
    v_current_team_id UUID;
    v_selected_player_id TEXT;
    v_is_snake BOOLEAN;
BEGIN
    -- Find all drafts where the timer has expired
    FOR v_draft IN
        SELECT *
        FROM draft_settings
        WHERE draft_status = 'in_progress'
          AND is_paused = false
          AND timer_started_at IS NOT NULL
          AND NOW() - timer_started_at > (time_per_pick * INTERVAL '1 second')
        FOR UPDATE SKIP LOCKED
    LOOP
        -- Extract pick order
        SELECT ARRAY(
            SELECT (jsonb_array_elements_text(v_draft.pick_order->'order'))::UUID
        ) INTO v_pick_order;

        v_total_teams := array_length(v_pick_order, 1);
        IF v_total_teams IS NULL OR v_total_teams = 0 THEN
            CONTINUE;
        END IF;

        v_is_snake := (v_draft.draft_type = 'snake');
        v_current_index := ((v_draft.current_pick - 1) % v_total_teams) + 1;

        IF v_is_snake AND (v_draft.current_round % 2 = 0) THEN
            v_current_team_id := v_pick_order[v_total_teams - v_current_index + 1];
        ELSE
            v_current_team_id := v_pick_order[v_current_index];
        END IF;

        -- Use existing auto_pick_player function to select best player
        SELECT auto_pick_player(v_draft.id, v_current_team_id) INTO v_selected_player_id;

        IF v_selected_player_id IS NOT NULL THEN
            -- Use make_draft_pick to atomically make the pick
            PERFORM make_draft_pick(v_draft.id, v_current_team_id, v_selected_player_id, true);
        END IF;
    END LOOP;
END;
$$;

-- Step 4: Grant execute permissions
GRANT EXECUTE ON FUNCTION make_draft_pick(UUID, UUID, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION auto_pick_expired_drafts() TO service_role;

-- Note: pg_cron setup (run in Supabase SQL editor if pg_cron is available):
-- SELECT cron.schedule('draft-auto-pick', '5 seconds', 'SELECT auto_pick_expired_drafts()');
-- If pg_cron is not available, use Vercel CRON or the auto-pick API route as fallback.
