'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { updateLeagueSettings } from './league-settings-action';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

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
        kicking?: Record<string, number | null>;
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

// Additional fields to always show in each category (even if not in stored rules)
const ADDITIONAL_CATEGORY_FIELDS: Record<string, Record<string, number | null>> = {
    kicking: {
        missed_field_goal_max_distance: null,
    },
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
    missed_field_goal_max_distance: 'Missed FG Max Distance (yards)',
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
    rules: Record<string, number | null>;
    onChange: (key: string, value: number | null) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="border border-border rounded-lg overflow-hidden">
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-background hover:bg-background/80 transition-colors"
            >
                <span className="font-medium text-foreground">
                    {CATEGORY_LABELS[category] || category}
                </span>
                {isExpanded ? (
                    <ChevronDown size={20} className="text-muted-foreground" />
                ) : (
                    <ChevronRight size={20} className="text-muted-foreground" />
                )}
            </button>
            {isExpanded && (
                <div className="p-4 space-y-3 bg-card">
                    {Object.entries(rules).map(([key, value]) => {
                        const isMaxDistanceField = key === 'missed_field_goal_max_distance';
                        return (
                            <div key={key} className="flex items-center justify-between gap-4">
                                <Label className="text-muted-foreground flex-1 font-normal">
                                    {FIELD_LABELS[key] || key.replace(/_/g, ' ')}
                                </Label>
                                <Input
                                    type="number"
                                    step={isMaxDistanceField ? "1" : "0.01"}
                                    value={value === null ? '' : value}
                                    placeholder={isMaxDistanceField ? 'All distances' : undefined}
                                    onChange={(e) => {
                                        if (isMaxDistanceField) {
                                            const val = e.target.value === '' ? null : parseInt(e.target.value);
                                            onChange(key, val);
                                        } else {
                                            onChange(key, parseFloat(e.target.value) || 0);
                                        }
                                    }}
                                    className="w-24 text-right"
                                />
                            </div>
                        );
                    })}
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

    const handleScoringRuleChange = (category: string, key: string, value: number | null) => {
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
        <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>League Settings</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* League Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">League Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Scoring Type */}
                    <div className="space-y-2">
                        <Label htmlFor="scoringType">Scoring Type</Label>
                        <select
                            id="scoringType"
                            value={scoringType}
                            onChange={(e) => setScoringType(e.target.value)}
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            <option value="NFL Playoff Pickem">NFL Playoff Pickem</option>
                            <option value="BestBall">BestBall</option>
                        </select>
                    </div>

                    {/* Number of Weeks */}
                    <div className="space-y-2">
                        <Label htmlFor="numWeeks">Number of Weeks</Label>
                        <Input
                            id="numWeeks"
                            type="number"
                            value={numWeeks}
                            onChange={(e) => setNumWeeks(parseInt(e.target.value) || 1)}
                            min={1}
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
                        <Label htmlFor="customScoring" className="font-normal text-muted-foreground">
                            Enable Custom Scoring Rules
                        </Label>
                    </div>

                    {/* Scoring Rules Editor */}
                    <Separator />
                    <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4">Scoring Rules</h3>
                        <div className="space-y-2">
                            {categoryOrder.map((category) => {
                                const storedRules = scoringRules.rules[category as keyof typeof scoringRules.rules];
                                if (!storedRules || Object.keys(storedRules).length === 0) return null;
                                // Merge stored rules with additional fields that should always be shown
                                const additionalFields = ADDITIONAL_CATEGORY_FIELDS[category] || {};
                                const rules = { ...additionalFields, ...storedRules };
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
                            <Separator />
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4">Draft Settings</h3>
                            </div>

                            {/* Draft Type */}
                            <div className="space-y-2">
                                <Label htmlFor="draftType">Draft Type</Label>
                                <select
                                    id="draftType"
                                    value={draftType}
                                    onChange={(e) => setDraftType(e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="snake">Snake</option>
                                    <option value="linear">Linear</option>
                                </select>
                            </div>

                            {/* Draft Date */}
                            <div className="space-y-2">
                                <Label htmlFor="draftDate">Draft Date</Label>
                                <Input
                                    id="draftDate"
                                    type="datetime-local"
                                    value={draftDate}
                                    onChange={(e) => setDraftDate(e.target.value)}
                                />
                            </div>

                            {/* Time Per Pick */}
                            <div className="space-y-2">
                                <Label htmlFor="timePerPick">Time Per Pick (seconds)</Label>
                                <Input
                                    id="timePerPick"
                                    type="number"
                                    value={timePerPick}
                                    onChange={(e) => setTimePerPick(Math.min(600, Math.max(10, parseInt(e.target.value) || 60)))}
                                    min={10}
                                    max={600}
                                />
                                <p className="text-xs text-muted-foreground">Between 10 and 600 seconds</p>
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
                                <Label htmlFor="autoPick" className="font-normal text-muted-foreground">
                                    Auto-Pick When Time Expires
                                </Label>
                            </div>
                        </>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm p-3 bg-red-100/10 rounded-lg">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        loading={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
