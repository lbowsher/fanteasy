"use client";
import Link from 'next/link';
import { useState } from 'react';
import { addLeague } from './league-action';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LeagueCreator() {
    const [draftEnabled, setDraftEnabled] = useState(true);

    return (
        <div className="w-full max-w-xl mx-auto">
            <div className="flex justify-between px-4 py-6 border-slate-grey border border-t-0">
                <Link className="text-xl font-bold hover:text-liquid-lava transition-colors" href={'/'}>
                    Home
                </Link>
            </div>
            <div>
                <form className="flex-wrap border-slate-grey border border-t-0 p-6" action={addLeague}>
                    <fieldset className="flex flex-col space-y-4">
                        <legend className="text-2xl font-bold mb-6">Create a New League</legend>

                        <div className="space-y-2">
                            <Input
                                name="LeagueName"
                                className="h-12 text-xl"
                                placeholder="League Name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="NumTeams" className="text-muted-foreground">
                                Number of teams
                            </Label>
                            <div className="relative">
                                <select
                                    id="NumTeams"
                                    name="NumTeams"
                                    className="w-full bg-card text-foreground border border-input rounded-md px-4 py-2 appearance-none focus:border-accent focus:outline-none transition-colors cursor-pointer"
                                >
                                    {Array.from({length: 24}, (_, i) => i + 2).map((number) => (
                                        <option key={number} value={number}>{number}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="SportsLeague" className="text-muted-foreground">
                                Sports League
                            </Label>
                            <div className="relative">
                                <select
                                    id="SportsLeague"
                                    name="SportsLeague"
                                    className="w-full bg-card text-foreground border border-input rounded-md px-4 py-2 appearance-none focus:border-accent focus:outline-none transition-colors cursor-pointer"
                                >
                                    <option value="NFL">NFL</option>
                                    <option value="NBA">NBA</option>
                                    <option value="NCAAM">NCAAM</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ScoringType" className="text-muted-foreground">
                                Scoring Type
                            </Label>
                            <div className="relative">
                                <select
                                    id="ScoringType"
                                    name="ScoringType"
                                    className="w-full bg-card text-foreground border border-input rounded-md px-4 py-2 appearance-none focus:border-accent focus:outline-none transition-colors cursor-pointer"
                                >
                                    <option value="NFL Playoff Pickem">NFL Playoff Pickem</option>
                                    <option value="Best Ball Tournament">BestBall</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Draft Settings */}
                        <div className="mt-8 border-t border-slate-grey pt-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <input
                                    type="checkbox"
                                    id="EnableDraft"
                                    checked={draftEnabled}
                                    onChange={(e) => setDraftEnabled(e.target.checked)}
                                    className="h-4 w-4 text-liquid-lava rounded focus:ring-liquid-lava"
                                />
                                <Label htmlFor="EnableDraft" className="text-lg font-semibold">
                                    Enable Draft
                                </Label>
                            </div>

                            {/* Always send the current draft enabled state */}
                            <input
                                type="hidden"
                                name="EnableDraft"
                                value={draftEnabled ? "true" : "false"}
                            />

                            {draftEnabled && (
                                <div className="space-y-4">

                                    <div className="space-y-2">
                                        <Label htmlFor="DraftType" className="text-muted-foreground">
                                            Draft Type
                                        </Label>
                                        <div className="relative">
                                            <select
                                                id="DraftType"
                                                name="DraftType"
                                                className="w-full bg-card text-foreground border border-input rounded-md px-4 py-2 appearance-none focus:border-accent focus:outline-none transition-colors cursor-pointer"
                                            >
                                                <option value="snake">Snake Draft</option>
                                                <option value="linear">Linear Draft</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                                                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="DraftDate" className="text-muted-foreground">
                                            Draft Date (optional)
                                        </Label>
                                        <Input
                                            type="datetime-local"
                                            name="DraftDate"
                                            id="DraftDate"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="TimePerPick" className="text-muted-foreground">
                                            Time Per Pick (seconds)
                                        </Label>
                                        <Input
                                            type="number"
                                            name="TimePerPick"
                                            id="TimePerPick"
                                            defaultValue="60"
                                            min="10"
                                            max="600"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2 mt-2">
                                        <input
                                            type="checkbox"
                                            id="AutoPickEnabled"
                                            name="AutoPickEnabled"
                                            defaultChecked={true}
                                            className="h-4 w-4 text-liquid-lava rounded focus:ring-liquid-lava"
                                        />
                                        <Label htmlFor="AutoPickEnabled" className="text-muted-foreground">
                                            Enable Auto-Pick when time expires
                                        </Label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 font-bold mt-6"
                        >
                            Create League
                        </Button>
                    </fieldset>
                </form>
            </div>
        </div>
        );
}
