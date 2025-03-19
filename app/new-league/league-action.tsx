"use server";

import { createClient } from '../utils/supabase/server';
import { redirect } from "next/navigation";
import { revalidatePath } from 'next/cache';

export async function addLeague(formData: FormData) {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        redirect('/login');
    }
    
    const league_name = String(formData.get('LeagueName'));
    const num_teams = parseInt(String(formData.get('NumTeams')));
    const scoring_type = String(formData.get('ScoringType'));
    const sports_league = String(formData.get('SportsLeague'));
    
    const {data, error: leagueError} = await supabase.from('leagues').insert({
        name: league_name, 
        num_teams: num_teams, 
        scoring_type: scoring_type, 
        league: sports_league,
        commish: user.id,
        num_weeks: 17, // Default NFL season weeks
    }).select('id');

    if (leagueError) {
        console.error("League creation error:", leagueError);
        throw leagueError;
    }

    if (!data || data.length === 0) {
        console.error("No data returned after league creation");
        throw new Error("League creation failed");
    }

    const new_league_id = data[0].id;

    // Create all teams in a single insert operation
    const teamsToCreate = [
        // Commissioner's team
        {
            name: 'Team 1',
            league_id: new_league_id,
            is_commish: true,
            user_id: user.id
        },
        // Other teams
        ...Array.from({length: num_teams - 1}, (_, i) => ({
            name: `Team ${i+2}`,
            league_id: new_league_id,
            is_commish: false
        }))
    ];

    const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .insert(teamsToCreate)
        .select('id');

    if (teamsError) {
        console.error("Error creating teams:", teamsError);
        throw teamsError;
    }

    // Handle draft settings if enabled
    const enableDraft = formData.get('EnableDraft') === 'true';
    
    if (enableDraft) {
        const draft_type = String(formData.get('DraftType'));
        
        // Convert draft date to UTC before storing
        let draft_date_utc = null;
        if (formData.get('DraftDate')) {
            const localDate = new Date(String(formData.get('DraftDate')));
            draft_date_utc = localDate.toISOString(); // Converts to UTC ISO format
        }
        
        const time_per_pick = parseInt(String(formData.get('TimePerPick')));
        const auto_pick_enabled = formData.get('AutoPickEnabled') === 'on';
        
        // Create the pick order based on team IDs (randomized)
        const teamIds = teamsData.map(team => team.id);
        const shuffledTeamIds = [...teamIds].sort(() => Math.random() - 0.5);
        
        const pick_order = {
            order: shuffledTeamIds,
            total_rounds: 15 // Default to 15 rounds for roster size
        };
        
        // Create draft settings
        const { error: draftError } = await supabase
            .from('draft_settings')
            .insert({
                league_id: new_league_id,
                draft_type: draft_type,
                draft_status: 'scheduled',
                draft_date: draft_date_utc,
                time_per_pick: time_per_pick,
                auto_pick_enabled: auto_pick_enabled,
                pick_order: pick_order,
                current_pick: 1,
                current_round: 1
            });
            
        if (draftError) {
            console.error("Error creating draft settings:", draftError);
            throw draftError;
        }
    }

    revalidatePath('/');
    redirect('/');
}