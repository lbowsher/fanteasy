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

    const { error: teamsError } = await supabase
        .from('teams')
        .insert(teamsToCreate);

    if (teamsError) {
        console.error("Error creating teams:", teamsError);
        throw teamsError;
    }

    revalidatePath('/');
    redirect('/');
}