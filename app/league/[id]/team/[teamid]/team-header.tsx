"use client";
import { useState, useOptimistic, startTransition, useEffect } from 'react';
import { createClient } from "../../../../utils/supabase/client";
import { Edit2, Check, X, LogOut } from "lucide-react";
import { useRouter } from 'next/navigation';

type TeamHeaderProps = {
    team: TeamWithRelations;
    isAuthorized: boolean;
    isOwner: boolean;
};

export default function TeamHeader({ team, isAuthorized, isOwner }: TeamHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
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

    const handleLeaveTeam = async () => {
        setIsLeaving(true);

        const { error } = await supabase
            .from('teams')
            .update({ user_id: null })
            .eq('id', team.id);

        if (error) {
            console.error('Error leaving team:', error);
            setIsLeaving(false);
            setShowLeaveConfirm(false);
        } else {
            router.push(`/league/${team.league_id}`);
        }
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
                    {isOwner && (
                        <button
                            onClick={() => setShowLeaveConfirm(true)}
                            className="text-red-500 hover:text-red-400 transition-colors"
                            aria-label="Leave team"
                        >
                            <LogOut size={16} />
                        </button>
                    )}
                </div>
            )}

            {showLeaveConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-surface border border-border rounded-lg p-6 max-w-sm mx-4">
                        <h3 className="text-lg font-bold text-primary-text mb-2">Leave Team?</h3>
                        <p className="text-secondary-text mb-4">
                            Are you sure you want to leave {team.name}? The team will become available for others to claim.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowLeaveConfirm(false)}
                                className="px-4 py-2 text-secondary-text hover:text-primary-text transition-colors"
                                disabled={isLeaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleLeaveTeam}
                                disabled={isLeaving}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                                {isLeaving ? 'Leaving...' : 'Leave Team'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}