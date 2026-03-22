'use client';

import { User } from "@supabase/supabase-js";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddToTeam({user, team_name, team_id}: { user: User, team_name: string, team_id: TeamID}) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const new_team_name = String(formData.get('TeamName')) || team_name;

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('teams')
                .update({ user_id: user.id, name: new_team_name })
                .eq('id', team_id);

            if (error) {
                throw error;
            }

            router.push('/');
        } catch (err) {
            console.error("Error adding user to team:", err);
            setError("Failed to join team. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Join Team</h2>
                <p className="text-muted-foreground">You&apos;re about to join as: {team_name}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="TeamName" className="text-muted-foreground mb-1">
                        Customize your team name (optional):
                    </Label>
                    <Input
                        id="TeamName"
                        name="TeamName"
                        type="text"
                        placeholder={team_name}
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
