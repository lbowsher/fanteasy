"use client";
import { useState, useOptimistic } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Edit2, Check, X } from "lucide-react";

type TeamHeaderProps = {
    team: TeamWithRelations;
    isAuthorized: boolean;
};

export default function TeamHeader({ team, isAuthorized }: TeamHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [optimisticTeam, updateOptimisticTeam] = useOptimistic<
        TeamWithRelations,
        { name: string }
    >(
        team,
        (state, newName) => ({ ...state, ...newName })
    );
    const [editingName, setEditingName] = useState(team.name);
    const supabase = createClientComponentClient<Database>();

    const handleSave = async () => {
        updateOptimisticTeam({ name: editingName });
        
        const { error } = await supabase
            .from('teams')
            .update({ name: editingName })
            .eq('id', team.id);

        if (error) {
            updateOptimisticTeam({ name: team.name });
        } else {
            setIsEditing(false);
        }
    };

    return (
        <div className="flex items-center justify-between">
            {isEditing ? (
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
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
                    <h1 className="text-2xl font-bold text-primary-text">{optimisticTeam.name}</h1>
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