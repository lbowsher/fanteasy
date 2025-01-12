//TODO: add team image in

import Link from 'next/link';

export default async function LeagueHome({ teams, league_id }: { teams: TeamWithOwner[], league_id: LeagueID}) {
    const sortedTeams = teams.sort((a, b) => b.totalScore - a.totalScore);

    return (
        <div className="space-y-1">
            {sortedTeams.map(team => (
                <div 
                    key={team.id} 
                    className="border border-slate-grey bg-surface hover:bg-gluon-grey transition-colors duration-200 rounded-lg px-6 py-6"
                >
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <Link 
                                href={`${league_id}/team/${team.id}`}
                                className="text-lg font-bold text-primary-text hover:text-liquid-lava transition-colors"
                            >
                                {team.name}
                            </Link>
                            <p className="text-dusty-grey text-sm">
                                {team.owner}
                            </p>
                        </div>
                        <div className="flex items-center">
                            <span className="text-secondary-text mr-2">Total Score:</span>
                            <span className="text-liquid-lava font-bold text-lg">
                                {team.totalScore}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}