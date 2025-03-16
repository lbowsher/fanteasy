import { createClient } from '@/app/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { draftId, teamId } = await req.json();
        
        if (!draftId || !teamId) {
            return NextResponse.json(
                { error: 'Missing required parameters: draftId and teamId' },
                { status: 400 }
            );
        }
        
        const supabase = await createClient();
        
        // Check if the team has auto-pick enabled
        const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('auto_pick_preference')
            .eq('id', teamId)
            .single();
            
        if (teamError) {
            return NextResponse.json(
                { error: 'Error fetching team data', details: teamError.message },
                { status: 500 }
            );
        }
        
        if (!teamData.auto_pick_preference) {
            return NextResponse.json(
                { success: false, message: 'Auto-pick is disabled for this team' },
                { status: 200 }
            );
        }
        
        // Get draft settings to make sure it's still this team's turn
        const { data: draftSettings, error: draftError } = await supabase
            .from('draft_settings')
            .select('*, leagues(*)')
            .eq('id', draftId)
            .single();
            
        if (draftError) {
            return NextResponse.json(
                { error: 'Error fetching draft settings', details: draftError.message },
                { status: 500 }
            );
        }
        
        // Get current team's ID from the pick order based on current pick
        const pickOrder = draftSettings.pick_order?.order || [];
        const totalTeams = pickOrder.length;
        
        if (totalTeams === 0) {
            return NextResponse.json(
                { error: 'Invalid pick order' },
                { status: 400 }
            );
        }
        
        const currentPickIndex = (draftSettings.current_pick - 1) % totalTeams;
        const currentTeamId = pickOrder[currentPickIndex];
        
        // Verify it's still this team's turn
        if (currentTeamId !== teamId) {
            return NextResponse.json(
                { success: false, message: 'Not this team\'s turn anymore' },
                { status: 200 }
            );
        }
        
        // Try to use the database function for auto-picking
        const { data: selectedPlayerId, error: functionError } = await supabase
            .rpc('auto_pick_player', { draft_id: draftId, team_id: teamId });
            
        if (functionError) {
            return NextResponse.json(
                { error: 'Error calling auto_pick_player function', details: functionError.message },
                { status: 500 }
            );
        }
        
        if (!selectedPlayerId) {
            return NextResponse.json(
                { error: 'No available player found for auto-pick' },
                { status: 404 }
            );
        }
        
        // Make the draft pick with is_auto_pick set to true
        const { error: pickError } = await supabase
            .from('draft_picks')
            .insert({
                draft_id: draftId,
                team_id: teamId,
                player_id: selectedPlayerId,
                pick_number: draftSettings.current_pick,
                round_number: draftSettings.current_round,
                is_auto_pick: true
            });
            
        if (pickError) {
            return NextResponse.json(
                { error: 'Error making auto-pick', details: pickError.message },
                { status: 500 }
            );
        }
        
        return NextResponse.json({ success: true, playerId: selectedPlayerId });
    } catch (error: any) {
        console.error('Auto-pick error:', error);
        return NextResponse.json(
            { error: 'Server error', details: error.message },
            { status: 500 }
        );
    }
}