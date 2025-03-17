
'use client';

import { User } from "@supabase/supabase-js";
import { createClient } from "../../../utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Join Team</h2>
                <p className="text-secondary-text">You&apos;re about to join as: {team_name}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="TeamName" className="block text-sm text-secondary-text mb-1">
                        You can customize your team name (optional):
                    </label>
                    <input 
                        id="TeamName"
                        name="TeamName" 
                        type="text" 
                        placeholder={team_name}
                        className="w-full bg-surface text-primary-text border border-slate-grey rounded-lg px-4 py-2 focus:border-liquid-lava focus:outline-none transition-colors"
                    />
                </div>
                
                {error && (
                    <div className="text-red-500 text-sm p-2 bg-red-100/10 rounded">
                        {error}
                    </div>
                )}
                
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-liquid-lava text-snow font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isSubmitting ? "Joining..." : "Join Team"}
                </button>
            </form>
        </div>
    );
}