'use client';

import { User } from "@supabase/supabase-js";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Database } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Team = Database['public']['Tables']['teams']['Row'];

export default function AddToTeam({user, teams}: { user: User, teams: Team[]}) {
    const router = useRouter();
    const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedTeam = teams.find(t => t.id === selectedTeamId);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!selectedTeam) {
            setError("Please select a team");
            setIsSubmitting(false);
            return;
        }

        const formData = new FormData(e.currentTarget);
        const new_team_name = String(formData.get('TeamName')) || selectedTeam.name;

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('teams')
                .update({ user_id: user.id, name: new_team_name })
                .eq('id', selectedTeamId);

            if (error) {
                throw error;
            }

            console.log("Added user to team");
            router.push('/');
        } catch (err) {
            console.error("Error adding user to team:", err);
            setError("Failed to join team. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="TeamSelect" className="text-muted-foreground mb-1">
                        Select a team:
                    </Label>
                    <select
                        id="TeamSelect"
                        value={selectedTeamId}
                        onChange={(e) => setSelectedTeamId(e.target.value)}
                        className="w-full bg-card text-foreground border border-input rounded-md px-4 py-2 focus:border-accent focus:outline-none transition-colors"
                    >
                        {teams.map((team) => (
                            <option key={team.id} value={team.id}>
                                {team.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label htmlFor="TeamName" className="text-muted-foreground mb-1">
                        Customize your team name (optional):
                    </Label>
                    <Input
                        id="TeamName"
                        name="TeamName"
                        type="text"
                        placeholder={selectedTeam?.name || ''}
                    />
                </div>

                {error && (
                    <div className="text-red-500 text-sm p-2 bg-red-100/10 rounded">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    loading={isSubmitting}
                    className="w-full h-12 font-bold"
                >
                    {isSubmitting ? "Joining..." : "Join Team"}
                </Button>
            </form>
        </div>
    );
}
