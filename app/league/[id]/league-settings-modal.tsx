'use client';

import { useState } from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { updateLeagueSettings } from './league-settings-action';
import { useRouter } from 'next/navigation';

interface LeagueSettingsModalProps {
    league: League;
    draftSettings: DraftSettings | null;
    onClose: () => void;
}

interface ScoringRules {
    rules: {
        passing?: Record<string, number>;
        rushing?: Record<string, number>;
        receiving?: Record<string, number>;
        kicking?: Record<string, number>;
        defense?: Record<string, number>;
        misc?: Record<string, number>;
    };
    scoring_type?: string;
}

const CATEGORY_LABELS: Record<string, string> = {
    passing: 'Passing',
    rushing: 'Rushing',
    receiving: 'Receiving',
    kicking: 'Kicking',
    defense: 'Defense/Special Teams',
    misc: 'Misc',
};

const FIELD_LABELS: Record<string, string> = {
    // Passing
    yards: 'Yards',
    touchdown: 'Touchdown',
    interception: 'Interception',
    bonus_300_yards: '300+ Yard Bonus',
    bonus_400_yards: '400+ Yard Bonus',
    two_point_conversion: '2PT Conversion',
    // Rushing
    bonus_100_yards: '100+ Yard Bonus',
    bonus_200_yards: '200+ Yard Bonus',
    // Receiving
    reception: 'Reception (PPR)',
    // Kicking
    extra_point: 'Extra Point Made',
    missed_extra_point: 'Missed Extra Point',
    field_goal_0_39: 'FG 0-39 yards',
    field_goal_40_49: 'FG 40-49 yards',
    field_goal_50_59: 'FG 50-59 yards',
    field_goal_60_plus: 'FG 60+ yards',
    missed_field_goal: 'Missed Field Goal',
    // Defense
    sack: 'Sack',
    safety: 'Safety',
    blocked_kick: 'Blocked Kick',
    forced_fumble: 'Forced Fumble',
    fumble_recovery: 'Fumble Recovery',
    points_allowed_0: 'Points Allowed: 0',
    points_allowed_1_10: 'Points Allowed: 1-10',
    points_allowed_11_14: 'Points Allowed: 11-14',
    points_allowed_15_17: 'Points Allowed: 15-17',
    points_allowed_18_21: 'Points Allowed: 18-21',
    points_allowed_22_30: 'Points Allowed: 22-30',
    points_allowed_31_34: 'Points Allowed: 31-34',
    points_allowed_35_41: 'Points Allowed: 35-41',
    points_allowed_42_plus: 'Points Allowed: 42+',
    yards_allowed_0_199: 'Yards Allowed: 0-199',
    yards_allowed_200_249: 'Yards Allowed: 200-249',
    yards_allowed_250_299: 'Yards Allowed: 250-299',
    yards_allowed_300_349: 'Yards Allowed: 300-349',
    yards_allowed_350_399: 'Yards Allowed: 350-399',
    yards_allowed_400_449: 'Yards Allowed: 400-449',
    yards_allowed_450_499: 'Yards Allowed: 450-499',
    yards_allowed_500_plus: 'Yards Allowed: 500+',
    // Misc
    fumble_lost: 'Fumble Lost',
};

function ScoringCategoryEditor({
    category,
    rules,
    onChange,
}: {
    category: string;
    rules: Record<string, number>;
    onChange: (key: string, value: number) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-background hover:bg-background/80 transition-colors"
            >
                <span className="font-medium text-primary-text">
                    {CATEGORY_LABELS[category] || category}
                </span>
                {isExpanded ? (
                    <ChevronDown size={20} className="text-secondary-text" />
                ) : (
                    <ChevronRight size={20} className="text-secondary-text" />
                )}
            </button>
            {isExpanded && (
                <div className="p-4 space-y-3 bg-surface">
                    {Object.entries(rules).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between gap-4">
                            <label className="text-sm text-secondary-text flex-1">
                                {FIELD_LABELS[key] || key.replace(/_/g, ' ')}
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={value}
                                onChange={(e) => onChange(key, parseFloat(e.target.value) || 0)}
                                className="w-24 bg-background text-primary-text border border-border rounded px-3 py-1 text-right focus:border-accent focus:outline-none transition-colors"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function LeagueSettingsModal({ league, draftSettings, onClose }: LeagueSettingsModalProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // League settings state
    const [name, setName] = useState(league.name);
    const [numWeeks, setNumWeeks] = useState(league.num_weeks);
    const [scoringType, setScoringType] = useState(league.scoring_type);
    const [customScoringEnabled, setCustomScoringEnabled] = useState(league.custom_scoring_enabled || false);

    // Parse scoring rules from league
    const initialScoringRules = (league.scoring_rules as ScoringRules) || { rules: {} };
    const [scoringRules, setScoringRules] = useState<ScoringRules>(initialScoringRules);

    // Draft settings state
    const [draftType, setDraftType] = useState(draftSettings?.draft_type || 'snake');
    const [draftDate, setDraftDate] = useState(
        draftSettings?.draft_date ? new Date(draftSettings.draft_date).toISOString().slice(0, 16) : ''
    );
    const [timePerPick, setTimePerPick] = useState(draftSettings?.time_per_pick || 60);
    const [autoPickEnabled, setAutoPickEnabled] = useState(draftSettings?.auto_pick_enabled ?? true);

    const handleScoringRuleChange = (category: string, key: string, value: number) => {
        setScoringRules((prev) => ({
            ...prev,
            rules: {
                ...prev.rules,
                [category]: {
                    ...(prev.rules[category as keyof typeof prev.rules] || {}),
                    [key]: value,
                },
            },
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        const result = await updateLeagueSettings({
            leagueId: league.id,
            leagueSettings: {
                name,
                num_weeks: numWeeks,
                scoring_type: scoringType,
                custom_scoring_enabled: customScoringEnabled,
                scoring_rules: scoringRules,
            },
            draftSettings: draftSettings ? {
                draft_type: draftType,
                draft_date: draftDate || null,
                time_per_pick: timePerPick,
                auto_pick_enabled: autoPickEnabled,
            } : undefined,
        });

        setIsSaving(false);

        if (result.success) {
            router.refresh();
            onClose();
        } else {
            setError(result.error || 'Failed to save settings');
        }
    };

    const categoryOrder = ['passing', 'rushing', 'receiving', 'kicking', 'defense', 'misc'];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface border border-border rounded-lg p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-primary-text">League Settings</h2>
                    <button
                        onClick={onClose}
                        className="text-secondary-text hover:text-primary-text transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* League Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-secondary-text mb-1">
                            League Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-background text-primary-text border border-border rounded-lg px-4 py-2 focus:border-accent focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Scoring Type */}
                    <div>
                        <label htmlFor="scoringType" className="block text-sm font-medium text-secondary-text mb-1">
                            Scoring Type
                        </label>
                        <select
                            id="scoringType"
                            value={scoringType}
                            onChange={(e) => setScoringType(e.target.value)}
                            className="w-full bg-background text-primary-text border border-border rounded-lg px-4 py-2 focus:border-accent focus:outline-none transition-colors"
                        >
                            <option value="NFL Playoff Pickem">NFL Playoff Pickem</option>
                            <option value="BestBall">BestBall</option>
                        </select>
                    </div>

                    {/* Number of Weeks */}
                    <div>
                        <label htmlFor="numWeeks" className="block text-sm font-medium text-secondary-text mb-1">
                            Number of Weeks
                        </label>
                        <input
                            id="numWeeks"
                            type="number"
                            value={numWeeks}
                            onChange={(e) => setNumWeeks(parseInt(e.target.value) || 1)}
                            min={1}
                            className="w-full bg-background text-primary-text border border-border rounded-lg px-4 py-2 focus:border-accent focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Custom Scoring Enabled */}
                    <div className="flex items-center gap-3">
                        <input
                            id="customScoring"
                            type="checkbox"
                            checked={customScoringEnabled}
                            onChange={(e) => setCustomScoringEnabled(e.target.checked)}
                            className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                        />
                        <label htmlFor="customScoring" className="text-sm font-medium text-secondary-text">
                            Enable Custom Scoring Rules
                        </label>
                    </div>

                    {/* Scoring Rules Editor */}
                    <div className="border-t border-border pt-6">
                        <h3 className="text-lg font-semibold text-primary-text mb-4">Scoring Rules</h3>
                        <div className="space-y-2">
                            {categoryOrder.map((category) => {
                                const rules = scoringRules.rules[category as keyof typeof scoringRules.rules];
                                if (!rules || Object.keys(rules).length === 0) return null;
                                return (
                                    <ScoringCategoryEditor
                                        key={category}
                                        category={category}
                                        rules={rules}
                                        onChange={(key, value) => handleScoringRuleChange(category, key, value)}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Draft Settings Section */}
                    {draftSettings && (
                        <>
                            <div className="border-t border-border pt-6">
                                <h3 className="text-lg font-semibold text-primary-text mb-4">Draft Settings</h3>
                            </div>

                            {/* Draft Type */}
                            <div>
                                <label htmlFor="draftType" className="block text-sm font-medium text-secondary-text mb-1">
                                    Draft Type
                                </label>
                                <select
                                    id="draftType"
                                    value={draftType}
                                    onChange={(e) => setDraftType(e.target.value)}
                                    className="w-full bg-background text-primary-text border border-border rounded-lg px-4 py-2 focus:border-accent focus:outline-none transition-colors"
                                >
                                    <option value="snake">Snake</option>
                                    <option value="linear">Linear</option>
                                </select>
                            </div>

                            {/* Draft Date */}
                            <div>
                                <label htmlFor="draftDate" className="block text-sm font-medium text-secondary-text mb-1">
                                    Draft Date
                                </label>
                                <input
                                    id="draftDate"
                                    type="datetime-local"
                                    value={draftDate}
                                    onChange={(e) => setDraftDate(e.target.value)}
                                    className="w-full bg-background text-primary-text border border-border rounded-lg px-4 py-2 focus:border-accent focus:outline-none transition-colors"
                                />
                            </div>

                            {/* Time Per Pick */}
                            <div>
                                <label htmlFor="timePerPick" className="block text-sm font-medium text-secondary-text mb-1">
                                    Time Per Pick (seconds)
                                </label>
                                <input
                                    id="timePerPick"
                                    type="number"
                                    value={timePerPick}
                                    onChange={(e) => setTimePerPick(Math.min(600, Math.max(10, parseInt(e.target.value) || 60)))}
                                    min={10}
                                    max={600}
                                    className="w-full bg-background text-primary-text border border-border rounded-lg px-4 py-2 focus:border-accent focus:outline-none transition-colors"
                                />
                                <p className="text-xs text-secondary-text mt-1">Between 10 and 600 seconds</p>
                            </div>

                            {/* Auto-Pick Enabled */}
                            <div className="flex items-center gap-3">
                                <input
                                    id="autoPick"
                                    type="checkbox"
                                    checked={autoPickEnabled}
                                    onChange={(e) => setAutoPickEnabled(e.target.checked)}
                                    className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
                                />
                                <label htmlFor="autoPick" className="text-sm font-medium text-secondary-text">
                                    Auto-Pick When Time Expires
                                </label>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm p-3 bg-red-100/10 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2 text-secondary-text hover:text-primary-text transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-liquid-lava text-snow rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
