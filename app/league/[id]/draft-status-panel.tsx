'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import Link from 'next/link';

interface DraftStatusPanelProps {
    league_id: string;
}

// Helper function to format the draft date correctly
const formatDraftDate = (dateString: string) => {
    const date = new Date(dateString);
    
    // Format the date and time in a user-friendly way
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    };
    
    return date.toLocaleString(undefined, options);
};

export default function DraftStatusPanel({ league_id }: DraftStatusPanelProps) {
    const supabase = createClient();
    const [draftSettings, setDraftSettings] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchDraftSettings = async () => {
            setIsLoading(true);
            try {
                const { data, error } = await supabase
                    .from('draft_settings')
                    .select('*')
                    .eq('league_id', league_id)
                    .single();
                
                if (error) {
                    if (error.code !== 'PGRST116') { // Not a "no rows returned" error
                        console.error('Error fetching draft settings:', error);
                    }
                    // No draft settings found, which is fine
                } else {
                    setDraftSettings(data);
                }
            } catch (error) {
                console.error('Error in fetchDraftSettings:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchDraftSettings();
        
        // Subscribe to draft settings changes
        const draftChannel = supabase
            .channel('draft-settings-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'draft_settings',
                filter: `league_id=eq.${league_id}`
            }, (payload) => {
                setDraftSettings(payload.new);
            })
            .subscribe();
            
        return () => {
            supabase.removeChannel(draftChannel);
        };
    }, [league_id, supabase]);
    
    if (isLoading) {
        return <div className="h-12 bg-surface border border-border animate-pulse rounded-lg"></div>;
    }
    
    if (!draftSettings) {
        return null; // No draft settings, don't show anything
    }
    
    const getDraftStatusText = () => {
        switch (draftSettings.draft_status) {
            case 'scheduled':
                return {
                    title: 'Draft Scheduled',
                    description: draftSettings.draft_date 
                        ? `The draft is scheduled for ${formatDraftDate(draftSettings.draft_date)}`
                        : 'The draft is scheduled to begin soon'
                };
            case 'in_progress':
                return {
                    title: 'Draft In Progress',
                    description: `Round ${draftSettings.current_round}, Pick ${draftSettings.current_pick}`
                };
            case 'completed':
                return {
                    title: 'Draft Completed',
                    description: 'The draft has been completed'
                };
            default:
                return {
                    title: 'Draft',
                    description: 'No information available'
                };
        }
    };
    
    const status = getDraftStatusText();
    
    return (
        <div className="p-4 bg-surface rounded-lg border border-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <h3 className="text-lg font-semibold text-primary-text">{status.title}</h3>
                    <p className="text-secondary-text">{status.description}</p>
                </div>
                
                <Link 
                    href={`/draft/${draftSettings.id}`}
                    className="mt-3 sm:mt-0 px-4 py-2 bg-liquid-lava text-snow rounded-lg hover:opacity-80 transition-opacity"
                >
                    {draftSettings.draft_status === 'completed' ? 'View Results' : 'Enter Draft Room'}
                </Link>
            </div>
        </div>
    );
}