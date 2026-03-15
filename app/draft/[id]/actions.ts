'use server';

import { createClient } from '@/app/utils/supabase/server';

interface ActionResult {
    success: boolean;
    error?: string;
    data?: any;
}

export async function makePick(draftId: string, playerId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get draft settings to find the league
    const { data: draft, error: draftError } = await supabase
        .from('draft_settings')
        .select('league_id, pick_order, current_pick, current_round, draft_type')
        .eq('id', draftId)
        .single();

    if (draftError || !draft) {
        return { success: false, error: 'Draft not found' };
    }

    // Check if user is commissioner
    const { data: league } = await supabase
        .from('leagues')
        .select('commish')
        .eq('id', draft.league_id)
        .single();

    const isCommissioner = league?.commish === user.id;

    // Get user's team in this league
    const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('league_id', draft.league_id)
        .eq('user_id', user.id)
        .single();

    // Calculate current team from pick order
    const pickOrder = (draft.pick_order as any)?.order || [];
    const totalTeams = pickOrder.length;
    
    let currentTeamId: string | null = null;
    if (totalTeams > 0) {
        const currentIndex = ((draft.current_pick! - 1) % totalTeams);
        const isSnake = draft.draft_type === 'snake';
        const isEvenRound = draft.current_round! % 2 === 0;

        if (isSnake && isEvenRound) {
            currentTeamId = pickOrder[totalTeams - 1 - currentIndex];
        } else {
            currentTeamId = pickOrder[currentIndex];
        }
    }

    // Determine which team to pick for
    let pickingTeamId: string;
    
    if (team && team.id === currentTeamId) {
        // It's the user's turn - pick for their own team
        pickingTeamId = team.id;
    } else if (isCommissioner && currentTeamId) {
        // Commissioner picking for the current team (not their turn)
        pickingTeamId = currentTeamId;
    } else if (!team && isCommissioner && currentTeamId) {
        // Commissioner with no team - pick for current team
        pickingTeamId = currentTeamId;
    } else if (!team) {
        return { success: false, error: 'No team found in this league' };
    } else {
        return { success: false, error: 'Not your turn to pick' };
    }

    const { data: result, error: rpcError } = await supabase.rpc('make_draft_pick', {
        p_draft_id: draftId,
        p_team_id: pickingTeamId,
        p_player_id: playerId,
        p_is_auto_pick: false,
    });

    if (rpcError) {
        return { success: false, error: rpcError.message };
    }

    const rpcResult = result as any;
    if (!rpcResult?.success) {
        return { success: false, error: rpcResult?.error || 'Pick failed' };
    }

    return { success: true, data: rpcResult };
}

export async function startDraft(draftId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Verify commissioner
    const { data: draft } = await supabase
        .from('draft_settings')
        .select('league_id')
        .eq('id', draftId)
        .single();

    if (!draft) {
        return { success: false, error: 'Draft not found' };
    }

    const { data: league } = await supabase
        .from('leagues')
        .select('commish')
        .eq('id', draft.league_id)
        .single();

    if (!league || league.commish !== user.id) {
        return { success: false, error: 'Only the commissioner can start the draft' };
    }

    const { error } = await supabase
        .from('draft_settings')
        .update({
            draft_status: 'in_progress',
            timer_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', draftId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function togglePause(draftId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Verify commissioner
    const { data: draft } = await supabase
        .from('draft_settings')
        .select('league_id, is_paused')
        .eq('id', draftId)
        .single();

    if (!draft) {
        return { success: false, error: 'Draft not found' };
    }

    const { data: league } = await supabase
        .from('leagues')
        .select('commish')
        .eq('id', draft.league_id)
        .single();

    if (!league || league.commish !== user.id) {
        return { success: false, error: 'Only the commissioner can pause/resume the draft' };
    }

    const newPausedState = !draft.is_paused;

    const updateData: any = {
        is_paused: newPausedState,
        updated_at: new Date().toISOString(),
    };

    // Reset timer on resume
    if (!newPausedState) {
        updateData.timer_started_at = new Date().toISOString();
    } else {
        updateData.timer_started_at = null;
    }

    const { error } = await supabase
        .from('draft_settings')
        .update(updateData)
        .eq('id', draftId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: { isPaused: newPausedState } };
}

export async function toggleAutoPick(teamId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Verify user owns this team
    const { data: team } = await supabase
        .from('teams')
        .select('id, user_id, auto_pick_preference')
        .eq('id', teamId)
        .single();

    if (!team) {
        return { success: false, error: 'Team not found' };
    }

    if (team.user_id !== user.id) {
        return { success: false, error: 'You do not own this team' };
    }

    const newValue = !team.auto_pick_preference;

    const { error } = await supabase
        .from('teams')
        .update({ auto_pick_preference: newValue })
        .eq('id', teamId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: { autoPickEnabled: newValue } };
}

export async function triggerAutoPick(draftId: string, teamId: string): Promise<ActionResult> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Get auto-pick player from existing RPC
    const { data: selectedPlayerId, error: autoPickError } = await supabase
        .rpc('auto_pick_player', { draft_id: draftId, team_id: teamId });

    if (autoPickError || !selectedPlayerId) {
        return { success: false, error: autoPickError?.message || 'No available player for auto-pick' };
    }

    // Use the atomic make_draft_pick RPC
    const { data: result, error: rpcError } = await supabase.rpc('make_draft_pick', {
        p_draft_id: draftId,
        p_team_id: teamId,
        p_player_id: selectedPlayerId,
        p_is_auto_pick: true,
    });

    if (rpcError) {
        return { success: false, error: rpcError.message };
    }

    const rpcResult = result as any;
    if (!rpcResult?.success) {
        return { success: false, error: rpcResult?.error || 'Auto-pick failed' };
    }

    return { success: true, data: rpcResult };
}
