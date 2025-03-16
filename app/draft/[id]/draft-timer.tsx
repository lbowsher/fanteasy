'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/app/utils/supabase/client';

interface DraftTimerProps {
    timePerPick: number;
    isMyTurn: boolean;
    isPaused?: boolean;
    onTimerExpired?: () => void;
}

export default function DraftTimer({ timePerPick, isMyTurn, isPaused = false, onTimerExpired }: DraftTimerProps) {
    const [timeLeft, setTimeLeft] = useState(timePerPick);
    const supabase = createClient();
    
    // Auto-pick function (when timer expires)
    const handleTimerExpired = useCallback(async () => {
        // If we have an external handler, call it
        if (onTimerExpired) {
            onTimerExpired();
            return;
        }
        
        // Otherwise, we're looking at a basic auto-pick scenario
        // The server should handle auto-picks through database triggers
        // But we can also implement client-side logic here if needed
        console.log('Timer expired - auto-pick will be triggered by server');
        
        // You could also implement direct auto-pick logic here if needed
        // For now we'll let the server handle it via the database trigger
    }, [onTimerExpired]);
    
    useEffect(() => {
        // Reset timer when it's a new turn
        setTimeLeft(timePerPick);
        
        // Don't start the timer if draft is paused
        if (isPaused) {
            return;
        }
        
        // Start countdown
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Call auto-pick function when timer reaches zero
                    handleTimerExpired();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => {
            clearInterval(timer);
        };
    }, [timePerPick, isMyTurn, isPaused, handleTimerExpired]);
    
    // Calculate percentage for visual timer
    const percentage = (timeLeft / timePerPick) * 100;
    
    // Determine color based on time left
    let timerColor = 'bg-green-500';
    if (timeLeft < timePerPick * 0.3) {
        timerColor = 'bg-red-500';
    } else if (timeLeft < timePerPick * 0.6) {
        timerColor = 'bg-yellow-500';
    }
    
    return (
        <div className="w-32">
            <div className="flex justify-between mb-1">
                <span className="text-secondary-text text-sm">
                    {isPaused ? "PAUSED" : "Time Left:"}
                </span>
                <span className={`text-sm font-bold ${
                    isPaused ? 'text-yellow-500' : 
                    timeLeft < timePerPick * 0.3 ? 'text-red-500' : 'text-primary-text'
                }`}>
                    {isPaused ? "⏸️" : `${timeLeft}s`}
                </span>
            </div>
            
            <div className="w-full bg-slate-grey rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full ${isPaused ? 'bg-yellow-500' : timerColor} transition-all duration-1000 ease-linear`}
                    style={{ width: isPaused ? '100%' : `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}