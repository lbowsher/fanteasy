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

        // Use auto_pick_player RPC to select best available player
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

        // Use atomic make_draft_pick RPC instead of direct insert
        const { data: result, error: rpcError } = await supabase.rpc('make_draft_pick', {
            p_draft_id: draftId,
            p_team_id: teamId,
            p_player_id: selectedPlayerId,
            p_is_auto_pick: true,
        });

        if (rpcError) {
            return NextResponse.json(
                { error: 'Error making auto-pick', details: rpcError.message },
                { status: 500 }
            );
        }

        const rpcResult = result as any;
        if (!rpcResult?.success) {
            return NextResponse.json(
                { error: rpcResult?.error || 'Auto-pick failed' },
                { status: 400 }
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
