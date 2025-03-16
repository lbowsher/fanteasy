'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface DraftQueueProps {
    teamId: string;
    draftId: string;
}

export default function DraftQueue({ teamId, draftId }: DraftQueueProps) {
    const supabase = createClient();
    const [queuedPlayers, setQueuedPlayers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [draftedPlayerIds, setDraftedPlayerIds] = useState<string[]>([]);
    
    // Fetch queue items and drafted players
    useEffect(() => {
        const fetchQueueAndDraftedPlayers = async () => {
            setIsLoading(true);
            
            try {
                // Get the queue items
                const { data: queueData, error: queueError } = await supabase
                    .from('draft_queue')
                    .select('*, player:players(*)')
                    .eq('team_id', teamId)
                    .order('priority', { ascending: true });
                
                if (queueError) throw queueError;
                
                // Get the drafted players
                const { data: draftedPlayers, error: draftedError } = await supabase
                    .from('draft_picks')
                    .select('player_id')
                    .eq('draft_id', draftId);
                
                if (draftedError) throw draftedError;
                
                setQueuedPlayers(queueData || []);
                setDraftedPlayerIds((draftedPlayers || []).map(p => p.player_id));
            } catch (error) {
                console.error('Error fetching queue data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchQueueAndDraftedPlayers();
        
        // Subscribe to changes
        const queueChannel = supabase
            .channel('draft-queue-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'draft_queue',
                filter: `team_id=eq.${teamId}`
            }, () => {
                fetchQueueAndDraftedPlayers();
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'draft_picks',
                filter: `draft_id=eq.${draftId}`
            }, (payload) => {
                // Add the newly drafted player to the drafted list
                setDraftedPlayerIds(prev => [...prev, payload.new.player_id]);
            })
            .subscribe();
            
        return () => {
            supabase.removeChannel(queueChannel);
        };
    }, [draftId, teamId, supabase]);
    
    // Handle adding a player to the queue
    const addToQueue = async (playerId: string) => {
        try {
            // Get the highest priority value
            const maxPriority = queuedPlayers.length > 0 
                ? Math.max(...queuedPlayers.map(p => p.priority))
                : 0;
            
            const { error } = await supabase
                .from('draft_queue')
                .insert({
                    team_id: teamId,
                    player_id: playerId,
                    priority: maxPriority + 1
                });
                
            if (error) throw error;
        } catch (error) {
            console.error('Error adding player to queue:', error);
            alert('Failed to add player to queue.');
        }
    };
    
    // Handle removing a player from the queue
    const removeFromQueue = async (queueItemId: string) => {
        try {
            const { error } = await supabase
                .from('draft_queue')
                .delete()
                .eq('id', queueItemId);
                
            if (error) throw error;
        } catch (error) {
            console.error('Error removing player from queue:', error);
            alert('Failed to remove player from queue.');
        }
    };
    
    // Handle reordering the queue
    const handleDragEnd = async (result: any) => {
        if (!result.destination) return;
        
        const items = Array.from(queuedPlayers);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        
        // Update the state immediately for UI responsiveness
        setQueuedPlayers(items);
        
        // Update the priority values in the database
        try {
            // Create batch updates
            const updates = items.map((item, index) => ({
                id: item.id,
                priority: index + 1
            }));
            
            // Update each item with its new priority
            for (const update of updates) {
                const { error } = await supabase
                    .from('draft_queue')
                    .update({ priority: update.priority })
                    .eq('id', update.id);
                    
                if (error) throw error;
            }
        } catch (error) {
            console.error('Error updating queue priorities:', error);
            alert('Failed to update queue order.');
        }
    };
    
    // Filter out already drafted players
    const availableQueuedPlayers = queuedPlayers.filter(
        item => !draftedPlayerIds.includes(item.player_id)
    );
    
    return (
        <div>
            {isLoading ? (
                <p className="text-center py-4">Loading your queue...</p>
            ) : availableQueuedPlayers.length === 0 ? (
                <div className="text-center py-4">
                    <p className="text-secondary-text mb-2">Your queue is empty.</p>
                    <p className="text-sm">Add players from the available list to create your draft priorities.</p>
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="draftQueue">
                        {(provided) => (
                            <ul 
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-2 max-h-[400px] overflow-y-auto"
                            >
                                {availableQueuedPlayers.map((queueItem, index) => (
                                    <Draggable 
                                        key={queueItem.id} 
                                        draggableId={queueItem.id} 
                                        index={index}
                                    >
                                        {(provided) => (
                                            <li
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className="flex items-center p-2 border border-slate-grey rounded-lg bg-surface hover:bg-gluon-grey transition-colors"
                                            >
                                                <div className="flex-shrink-0 mr-3">
                                                    <div className="w-7 h-7 flex items-center justify-center bg-slate-grey text-primary-text rounded-full font-bold text-sm">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex justify-between items-center flex-grow">
                                                    <div>
                                                        <p className="font-medium text-sm">{queueItem.player?.name}</p>
                                                        <p className="text-xs text-secondary-text">
                                                            {queueItem.player?.position} - {queueItem.player?.team_name}
                                                        </p>
                                                    </div>
                                                    
                                                    <button
                                                        onClick={() => removeFromQueue(queueItem.id)}
                                                        className="flex-shrink-0 p-1 text-dusty-grey hover:text-liquid-lava transition-colors"
                                                        aria-label="Remove from queue"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </li>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
        </div>
    );
}