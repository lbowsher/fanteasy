// Shared helpers for draft components

export function getPositionColor(position: string, leagueType: string = 'NFL'): string {
    if (leagueType === 'NFL') {
        switch (position) {
            case 'QB': return 'bg-red-500';
            case 'RB': return 'bg-blue-500';
            case 'WR': return 'bg-green-500';
            case 'TE': return 'bg-yellow-500';
            case 'K': return 'bg-purple-500';
            case 'DEF': return 'bg-orange-500';
            default: return 'bg-gray-500';
        }
    }
    // NBA / NCAAM
    switch (position) {
        case 'PG': case 'SG': case 'G': return 'bg-green-500';
        case 'SF': case 'PF': case 'F': return 'bg-yellow-500';
        case 'C': return 'bg-blue-500';
        default: return 'bg-gray-500';
    }
}

export function getPositionTextColor(position: string, leagueType: string = 'NFL'): string {
    if (leagueType === 'NFL') {
        switch (position) {
            case 'QB': return 'text-red-400';
            case 'RB': return 'text-blue-400';
            case 'WR': return 'text-green-400';
            case 'TE': return 'text-yellow-400';
            case 'K': return 'text-purple-400';
            case 'DEF': return 'text-orange-400';
            default: return 'text-gray-400';
        }
    }
    switch (position) {
        case 'PG': case 'SG': case 'G': return 'text-green-400';
        case 'SF': case 'PF': case 'F': return 'text-yellow-400';
        case 'C': return 'text-blue-400';
        default: return 'text-gray-400';
    }
}

export function getPositionBorderColor(position: string, leagueType: string): string {
    if (leagueType === 'NFL') {
        switch (position) {
            case 'QB': return '#ef4444';
            case 'RB': return '#3b82f6';
            case 'WR': return '#22c55e';
            case 'TE': return '#eab308';
            case 'K': return '#a855f7';
            case 'DEF': return '#f97316';
            default: return '#6b7280';
        }
    }
    switch (position) {
        case 'PG': case 'SG': case 'G': return '#22c55e';
        case 'SF': case 'PF': case 'F': return '#eab308';
        case 'C': return '#3b82f6';
        default: return '#6b7280';
    }
}

export function computePickInfo(pickNumber: number, totalTeams: number, draftType: string) {
    const round = Math.ceil(pickNumber / totalTeams);
    const pickInRound = ((pickNumber - 1) % totalTeams) + 1;
    const isReversed = draftType === 'snake' && round % 2 === 0;
    return { round, pickInRound, overallPick: pickNumber, isReversed };
}

export function getTeamIdForPick(pickNumber: number, draftOrder: string[], draftType: string): string {
    const totalTeams = draftOrder.length;
    if (totalTeams === 0) return '';
    const { pickInRound, isReversed } = computePickInfo(pickNumber, totalTeams, draftType);
    const index = isReversed ? totalTeams - pickInRound : pickInRound - 1;
    return draftOrder[index] || '';
}

export function getPositionsForLeague(leagueType: string): string[] {
    switch (leagueType) {
        case 'NFL':
            return ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
        case 'NBA':
        case 'NCAAM':
            return ['G', 'F', 'C'];
        default:
            return [];
    }
}
