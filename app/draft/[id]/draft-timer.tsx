'use client';

import { useEffect, useState, useCallback } from 'react';
import { Progress } from "@/components/ui/progress";

interface DraftTimerProps {
    timePerPick: number;
    timerStartedAt: string | null;
    isMyTurn: boolean;
    isPaused?: boolean;
    onTimerExpired?: () => void;
}

export default function DraftTimer({ timePerPick, timerStartedAt, isMyTurn, isPaused = false, onTimerExpired }: DraftTimerProps) {
    const [timeLeft, setTimeLeft] = useState(timePerPick);
    const [hasExpired, setHasExpired] = useState(false);

    const computeTimeLeft = useCallback(() => {
        if (!timerStartedAt || isPaused) return timePerPick;
        const elapsed = (Date.now() - new Date(timerStartedAt).getTime()) / 1000;
        return Math.max(0, Math.ceil(timePerPick - elapsed));
    }, [timerStartedAt, timePerPick, isPaused]);

    // Reset expiry flag when timer restarts (new pick)
    useEffect(() => {
        setHasExpired(false);
        setTimeLeft(computeTimeLeft());
    }, [timerStartedAt, computeTimeLeft]);

    useEffect(() => {
        if (isPaused || !timerStartedAt) {
            setTimeLeft(timePerPick);
            return;
        }

        const tick = () => {
            const remaining = computeTimeLeft();
            setTimeLeft(remaining);

            if (remaining <= 0 && !hasExpired) {
                setHasExpired(true);
                if (onTimerExpired) {
                    onTimerExpired();
                }
            }
        };

        // Compute immediately
        tick();

        const timer = setInterval(tick, 1000);

        return () => clearInterval(timer);
    }, [timerStartedAt, timePerPick, isPaused, onTimerExpired, computeTimeLeft, hasExpired]);

    // Calculate percentage for visual timer
    const percentage = (timeLeft / timePerPick) * 100;

    // Determine color based on time left
    let indicatorColor = 'bg-green-500';
    if (timeLeft < timePerPick * 0.3) {
        indicatorColor = 'bg-red-500';
    } else if (timeLeft < timePerPick * 0.6) {
        indicatorColor = 'bg-yellow-500';
    }
    if (isPaused) {
        indicatorColor = 'bg-yellow-500';
    }

    return (
        <div className="w-32">
            <div className="flex justify-between mb-1">
                <span className="text-muted-foreground text-sm">
                    {isPaused ? "PAUSED" : "Time Left:"}
                </span>
                <span className={`text-sm font-bold ${
                    isPaused ? 'text-yellow-500' :
                    timeLeft < timePerPick * 0.3 ? 'text-red-500' : 'text-foreground'
                }`}>
                    {isPaused ? "\u23F8\uFE0F" : `${timeLeft}s`}
                </span>
            </div>

            <Progress
                value={isPaused ? 100 : percentage}
                className="h-2.5"
                indicatorClassName={`${indicatorColor} transition-all duration-1000 ease-linear`}
            />
        </div>
    );
}
