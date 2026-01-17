"use server";

import { createClient } from '../utils/supabase/server';
import { redirect } from "next/navigation";
import { revalidatePath } from 'next/cache';
import { NFLScoringRules, NBAScoringRules } from '../utils/scoring';

// Function to get default scoring rules based on league type and scoring type
function getDefaultScoringRules(sportsLeague: string, scoringType: string) {
    if (sportsLeague === 'NFL') {
        // Default NFL scoring rules
        const nflRules: NFLScoringRules = {
            passing: {
                yards: 0.04,
                touchdown: 4,
                interception: -2,
                two_point_conversion: 2,
                bonus_300_yards: 3,
                bonus_400_yards: 5
            },
            rushing: {
                yards: 0.1,
                touchdown: 6,
                two_point_conversion: 2,
                bonus_100_yards: 3,
                bonus_200_yards: 5
            },
            receiving: {
                yards: 0.1,
                touchdown: 6,
                two_point_conversion: 2,
                bonus_100_yards: 3,
                bonus_200_yards: 5
            },
            kicking: {
                field_goal_0_39: 3,
                field_goal_40_49: 4,
                field_goal_50_59: 5,
                field_goal_60_plus: 6,
                extra_point: 1,
                missed_field_goal: -1,
                missed_extra_point: -1
            },
            defense: {
                sack: 1,
                interception: 2,
                fumble_recovery: 2,
                forced_fumble: 1,
                safety: 2,
                touchdown: 6,
                blocked_kick: 2,
                points_allowed_0: 10,
                points_allowed_1_10: 7,
                points_allowed_11_14: 4,
                points_allowed_15_17: 1,
                points_allowed_18_21: 0,
                points_allowed_22_30: -1,
                points_allowed_31_34: -2,
                points_allowed_35_41: -3,
                points_allowed_42_plus: -4
            },
            misc: {
                fumble_lost: -2,
                two_point_conversion: 2
            }
        };

        // Apply PPR or standard adjustments
        if (scoringType === 'PPR') {
            nflRules.receiving!.reception = 1;
        } else if (scoringType === 'HALF_PPR') {
            nflRules.receiving!.reception = 0.5;
        } else {
            // Standard scoring
            nflRules.receiving!.reception = 0;
        }

        return nflRules;
    } else if (sportsLeague === 'NBA') {
        // Default NBA scoring rules
        const nbaRules: NBAScoringRules = {
            points: 1,
            rebound: 1.2,
            assist: 1.5,
            steal: 2,
            block: 2,
            turnover: -1,
            double_double: 3,
            triple_double: 5
        };

        return nbaRules;
    } else if (sportsLeague === 'NCAAM') {
        return {
            points: 1
        }
    }

    // Default to empty rules if sport not supported
    return {};
}

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
    
    // Get default scoring rules based on sport and scoring type
    const defaultRules = getDefaultScoringRules(sports_league, scoring_type);
    
    // Debug log for development
    console.log(`Creating ${sports_league} league with ${scoring_type} scoring:`, defaultRules);
    
    const {data, error: leagueError} = await supabase.from('leagues').insert({
        name: league_name, 
        num_teams: num_teams, 
        scoring_type: scoring_type, 
        league: sports_league,
        commish: user.id,
        num_weeks: sports_league === 'NFL' ? 17 : 82, // Default season weeks based on sport
        default_scoring_rules: {
            scoring_type: scoring_type,
            rules: defaultRules
        },
        scoring_rules: {
            scoring_type: scoring_type,
            rules: defaultRules
        }
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
            total_rounds: 5 // Default to 5 rounds for roster size
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