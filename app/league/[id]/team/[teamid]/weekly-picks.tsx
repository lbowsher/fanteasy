import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type WeeklyPicksProps = {
    team: TeamWithPlayers;
    currentWeek: number;
};

export default function WeeklyPicks({ team, currentWeek }: WeeklyPicksProps) {
    const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
    const [selectedPicks, setSelectedPicks] = useState<{[key: string]: Player | null}>({});
    const [previousPicks, setPreviousPicks] = useState<{[key: string]: Player[]}>({});
    const [error, setError] = useState<string | null>(null);
    const supabase = createClientComponentClient<Database>();

    // Required positions for NFL
    const REQUIRED_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K'];

    useEffect(() => {
        // Fetch available players and previous picks
        const fetchData = async () => {
            // Get all previous picks for this team
            const { data: picks, error: picksError } = await supabase
                .from('weekly_picks')
                .select('player_id, week_number')
                .eq('team_id', team.id);

            if (picksError) {
                setError('Error loading previous picks');
                return;
            }

            // Organize previous picks by week
            const picksByWeek: {[key: string]: Player[]} = {};
            picks?.forEach(pick => {
                if (!picksByWeek[pick.week_number]) {
                    picksByWeek[pick.week_number] = [];
                }
                picksByWeek[pick.week_number].push(pick.player_id);
            });
            setPreviousPicks(picksByWeek);

            // Get all NFL players
            const { data: players, error: playersError } = await supabase
                .from('players')
                .select('*')
                .eq('league', 'NFL');

            if (playersError) {
                setError('Error loading players');
                return;
            }

            // Filter out previously picked players
            const usedPlayerIds = new Set(picks?.map(p => p.player_id));
            const available = players?.filter(p => !usedPlayerIds.has(p.id)) || [];
            setAvailablePlayers(available);
        };

        fetchData();
    }, [team.id]);

    const handlePlayerSelect = async (position: string, player: Player) => {
        // Update selected picks
        setSelectedPicks(prev => ({
            ...prev,
            [position]: player
        }));
    };

    const submitPicks = async () => {
        // Verify all positions are filled
        const missingPositions = REQUIRED_POSITIONS.filter(pos => !selectedPicks[pos]);
        if (missingPositions.length > 0) {
            setError(`Missing picks for: ${missingPositions.join(', ')}`);
            return;
        }

        // Submit picks to database
        const picksToInsert = Object.values(selectedPicks).map(player => ({
            team_id: team.id,
            player_id: player?.id,
            week_number: currentWeek
        }));

        const { error: insertError } = await supabase
            .from('weekly_picks')
            .insert(picksToInsert);

        if (insertError) {
            setError('Error submitting picks');
            return;
        }

        // Reset form and refresh data
        setSelectedPicks({});
        setError(null);
    };

    return (
        <Card className="w-full bg-surface border-border">
            <CardHeader>
                <CardTitle className="text-primary-text">
                    Week {currentWeek} Picks
                </CardTitle>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert className="mb-4 border-red-500">
                        <AlertDescription className="text-red-500">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="space-y-4">
                    {REQUIRED_POSITIONS.map(position => (
                        <div key={position} className="p-4 border border-border rounded-lg">
                            <h3 className="text-primary-text font-bold mb-2">{position}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {availablePlayers
                                    .filter(p => p.position === position)
                                    .map(player => (
                                        <Button
                                            key={player.id}
                                            onClick={() => handlePlayerSelect(position, player)}
                                            className={`p-2 text-sm ${
                                                selectedPicks[position]?.id === player.id
                                                    ? 'bg-accent text-snow'
                                                    : 'bg-background text-primary-text hover:bg-accent/20'
                                            }`}
                                        >
                                            {player.name}
                                        </Button>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>

                <Button
                    onClick={submitPicks}
                    className="w-full mt-6 bg-accent text-snow hover:bg-accent/80"
                >
                    Submit Week {currentWeek} Picks
                </Button>
            </CardContent>
        </Card>
    );
}