"use client";
import Link from 'next/link';
import { useState } from 'react';
import { addLeague } from './league-action';

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
                            <input 
                                name="LeagueName" 
                                className="w-full bg-surface text-primary-text border border-slate-grey rounded-lg px-4 py-2 text-xl placeholder-dusty-grey focus:border-liquid-lava focus:outline-none transition-colors" 
                                placeholder="League Name" 
                                required
                            />
                        </div>
    
                        <div className="space-y-2">
                            <label htmlFor="NumTeams" className="block text-secondary-text">
                                Number of teams
                            </label>
                            <select 
                                name="NumTeams" 
                                className="w-full bg-surface text-primary-text border border-slate-grey rounded-lg px-4 py-2 focus:border-liquid-lava focus:outline-none transition-colors"
                            >
                                {Array.from({length: 24}, (_, i) => i + 2).map((number) => (
                                    <option key={number} value={number}>{number}</option>
                                ))}
                            </select>
                        </div>
    
                        <div className="space-y-2">
                            <label htmlFor="SportsLeague" className="block text-secondary-text">
                                Sports League
                            </label>
                            <select 
                                name="SportsLeague" 
                                className="w-full bg-surface text-primary-text border border-slate-grey rounded-lg px-4 py-2 focus:border-liquid-lava focus:outline-none transition-colors"
                            >
                                <option value="NFL">NFL</option>
                                <option value="NBA">NBA</option>
                                <option value="NCAAM">NCAAM</option>
                            </select>
                        </div>
    
                        <div className="space-y-2">
                            <label htmlFor="ScoringType" className="block text-secondary-text">
                                Scoring Type
                            </label>
                            <select 
                                name="ScoringType" 
                                className="w-full bg-surface text-primary-text border border-slate-grey rounded-lg px-4 py-2 focus:border-liquid-lava focus:outline-none transition-colors"
                            >
                                <option value="NFL Playoff Pickem">NFL Playoff Pickem</option>
                                <option value="Best Ball Tournament">BestBall</option>
                            </select>
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
                                <label htmlFor="EnableDraft" className="text-lg font-semibold text-primary-text">
                                    Enable Draft
                                </label>
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
                                        <label htmlFor="DraftType" className="block text-secondary-text">
                                            Draft Type
                                        </label>
                                        <select 
                                            name="DraftType" 
                                            className="w-full bg-surface text-primary-text border border-slate-grey rounded-lg px-4 py-2 focus:border-liquid-lava focus:outline-none transition-colors"
                                        >
                                            <option value="snake">Snake Draft</option>
                                            <option value="linear">Linear Draft</option>
                                        </select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label htmlFor="DraftDate" className="block text-secondary-text">
                                            Draft Date (optional)
                                        </label>
                                        <input 
                                            type="datetime-local" 
                                            name="DraftDate" 
                                            className="w-full bg-surface text-primary-text border border-slate-grey rounded-lg px-4 py-2 focus:border-liquid-lava focus:outline-none transition-colors"
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label htmlFor="TimePerPick" className="block text-secondary-text">
                                            Time Per Pick (seconds)
                                        </label>
                                        <input 
                                            type="number" 
                                            name="TimePerPick" 
                                            defaultValue="60"
                                            min="10" 
                                            max="600" 
                                            className="w-full bg-surface text-primary-text border border-slate-grey rounded-lg px-4 py-2 focus:border-liquid-lava focus:outline-none transition-colors"
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
                                        <label htmlFor="AutoPickEnabled" className="text-secondary-text">
                                            Enable Auto-Pick when time expires
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
    
                        <button 
                            type="submit" 
                            className="w-full bg-liquid-lava text-snow font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity mt-6"
                        >
                            Create League
                        </button>
                    </fieldset>
                </form>
            </div>
        </div>
        );
}