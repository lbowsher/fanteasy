"use client";
import { useState, useOptimistic, startTransition, useEffect } from 'react';
import { createClient } from "../../../../utils/supabase/client";
import { Edit2, Check, X, LogOut, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type TeamHeaderProps = {
    team: TeamWithRelations;
    isAuthorized: boolean;
    isOwner: boolean;
    isCommissioner: boolean;
};

export default function TeamHeader({ team, isAuthorized, isOwner, isCommissioner }: TeamHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleDeleteTeam = async () => {
        setIsDeleting(true);
        setDeleteError(null);

        const { error } = await supabase
            .from('teams')
            .delete()
            .eq('id', team.id);

        if (error) {
            console.error('Error deleting team:', error);
            setDeleteError(error.message);
            setIsDeleting(false);
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
                    <Input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSave}
                        className="text-green-500"
                        aria-label="Save team name"
                    >
                        <Check size={20} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancel}
                        className="text-red-500"
                        aria-label="Cancel editing"
                    >
                        <X size={20} />
                    </Button>
                </div>
            ) : (
                <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold text-foreground">{optimisticTeam.name}</h1>
                    {isAuthorized && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditing(true)}
                            className="text-accent"
                            aria-label="Edit team name"
                        >
                            <Edit2 size={16} />
                        </Button>
                    )}
                    {isOwner && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowLeaveConfirm(true)}
                            className="text-red-500 hover:text-red-400"
                            aria-label="Leave team"
                        >
                            <LogOut size={16} />
                        </Button>
                    )}
                    {isCommissioner && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="text-red-500 hover:text-red-400"
                            aria-label="Delete team"
                        >
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>
            )}

            <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leave Team?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to leave {team.name}? The team will become available for others to claim.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setShowLeaveConfirm(false)}
                            disabled={isLeaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLeaveTeam}
                            disabled={isLeaving}
                            loading={isLeaving}
                        >
                            {isLeaving ? 'Leaving...' : 'Leave Team'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showDeleteConfirm} onOpenChange={(open) => {
                setShowDeleteConfirm(open);
                if (!open) setDeleteError(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Team?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete {team.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteError && (
                        <div className="text-red-500 text-sm p-2 bg-red-100/10 rounded">
                            {deleteError}
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeleteError(null);
                            }}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteTeam}
                            disabled={isDeleting}
                            loading={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Team'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
