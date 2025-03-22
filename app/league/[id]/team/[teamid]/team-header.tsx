"use client";
import { useState, useOptimistic, startTransition, useEffect } from 'react';
import { createClient } from "../../../../utils/supabase/client";
import { Edit2, Check, X } from "lucide-react";
import { useRouter } from 'next/navigation';

type TeamHeaderProps = {
    team: TeamWithRelations;
    isAuthorized: boolean;
};

export default function TeamHeader({ team, isAuthorized }: TeamHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();
    const [optimisticTeam, updateOptimisticTeam] = useOptimistic<
        TeamWithRelations,
        { name: string }
    >(
        team,
        (state, newName) => ({ ...state, ...newName })
    );
    const [editingName, setEditingName] = useState(team.name);
    
    // Reset editing name when team prop changes
    useEffect(() => {
        setEditingName(team.name);
    }, [team.name]);

    const supabase = createClient();

    const handleSave = async () => {
        if (!editingName.trim()) {
            return; // Don't save empty team names
        }

        // Apply optimistic update immediately
        startTransition(() => {
            updateOptimisticTeam({ name: editingName });
        });

        const { error } = await supabase
            .from('teams')
            .update({ name: editingName })
            .eq('id', team.id);

        if (error) {
            console.error('Error updating team name:', error);
            // Revert to original name if there was an error
            startTransition(() => {
                updateOptimisticTeam({ name: team.name });
            });
        } else {
            setIsEditing(false);
            // Refresh the page data to ensure consistency
            router.refresh();
        }
    };

    const handleCancel = () => {
        setEditingName(team.name); // Reset to original name
        setIsEditing(false);
    };

    // Handle the Enter key press
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
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
                        onKeyDown={handleKeyDown}
                        className="bg-background border border-border rounded px-2 py-1"
                        autoFocus
                    />
                    <button 
                        onClick={handleSave} 
                        className="text-green-500"
                        aria-label="Save team name"
                    >
                        <Check size={20} />
                    </button>
                    <button 
                        onClick={handleCancel} 
                        className="text-red-500"
                        aria-label="Cancel editing"
                    >
                        <X size={20} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-primary-text">{optimisticTeam.name}</h1>
                    {isAuthorized && (
                        <button 
                            onClick={() => setIsEditing(true)} 
                            className="text-accent"
                            aria-label="Edit team name"
                        >
                            <Edit2 size={16} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}