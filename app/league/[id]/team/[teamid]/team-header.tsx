"use client";
import { useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Edit2, Check, X } from "lucide-react";

type TeamHeaderProps = {
    team: TeamWithRelations;
    isAuthorized: boolean;
};

export default function TeamHeader({ team, isAuthorized }: TeamHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [teamName, setTeamName] = useState(team.name);
    const supabase = createClientComponentClient<Database>();

    const handleSave = async () => {
        const { error } = await supabase
            .from('teams')
            .update({ name: teamName })
            .eq('id', team.id);

        if (!error) {
            setIsEditing(false);
        }
    };

    return (
        <div className="flex items-center justify-between">
            {isEditing ? (
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="bg-background border border-border rounded px-2 py-1"
                    />
                    <button onClick={handleSave} className="text-green-500">
                        <Check size={20} />
                    </button>
                    <button onClick={() => setIsEditing(false)} className="text-red-500">
                        <X size={20} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-primary-text">{team.name}</h1>
                    {isAuthorized && (
                        <button onClick={() => setIsEditing(true)} className="text-accent">
                            <Edit2 size={16} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}