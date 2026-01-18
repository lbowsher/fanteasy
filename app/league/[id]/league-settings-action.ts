'use server';

import { createClient } from '../../utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface ScoringRules {
    rules: {
        passing?: Record<string, number>;
        rushing?: Record<string, number>;
        receiving?: Record<string, number>;
        kicking?: Record<string, number | null>;
        defense?: Record<string, number>;
        misc?: Record<string, number>;
    };
    scoring_type?: string;
}

interface LeagueSettingsData {
    name: string;
    num_weeks: number;
    scoring_type: string;
    custom_scoring_enabled: boolean;
    scoring_rules?: ScoringRules;
}

interface DraftSettingsData {
    draft_type: string;
    draft_date: string | null;
    time_per_pick: number;
    auto_pick_enabled: boolean;
}

interface UpdateLeagueSettingsParams {
    leagueId: string;
    leagueSettings: LeagueSettingsData;
    draftSettings?: DraftSettingsData;
}

interface ActionResult {
    success: boolean;
    error?: string;
}

export async function updateLeagueSettings({
    leagueId,
    leagueSettings,
    draftSettings,
}: UpdateLeagueSettingsParams): Promise<ActionResult> {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Not authenticated' };
    }

    // Verify user is the commissioner
    const { data: league, error: leagueError } = await supabase
        .from('leagues')
        .select('commish')
        .eq('id', leagueId)
        .single();

    if (leagueError || !league) {
        return { success: false, error: 'League not found' };
    }

    if (league.commish !== user.id) {
        return { success: false, error: 'Only the commissioner can edit league settings' };
    }

    // Update league settings
    const { error: updateLeagueError } = await supabase
        .from('leagues')
        .update({
            name: leagueSettings.name,
            num_weeks: leagueSettings.num_weeks,
            scoring_type: leagueSettings.scoring_type,
            custom_scoring_enabled: leagueSettings.custom_scoring_enabled,
            scoring_rules: leagueSettings.scoring_rules || {},
        })
        .eq('id', leagueId);

    if (updateLeagueError) {
        console.error('Error updating league:', updateLeagueError);
        return { success: false, error: 'Failed to update league settings' };
    }

    // Update draft settings if provided
    if (draftSettings) {
        const { error: updateDraftError } = await supabase
            .from('draft_settings')
            .update({
                draft_type: draftSettings.draft_type,
                draft_date: draftSettings.draft_date,
                time_per_pick: draftSettings.time_per_pick,
                auto_pick_enabled: draftSettings.auto_pick_enabled,
            })
            .eq('league_id', leagueId);

        if (updateDraftError) {
            console.error('Error updating draft settings:', updateDraftError);
            return { success: false, error: 'Failed to update draft settings' };
        }
    }

    // Revalidate the league page
    revalidatePath(`/league/${leagueId}`);

    return { success: true };
}
