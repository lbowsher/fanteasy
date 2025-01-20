import { Database as db } from '@/lib/database.types';

type League = DB['public']['Tables']['leagues']['Row']
type Team = DB['public']['Tables']['teams']['Row']
type Profile = DB['public']['Tables']['profiles']['Row']
type Player = DB['public']['Tables']['players']['Row']
type GameStats = Database['public']['Tables']['game_stats']['Row']
type WeeklyPick = Database['public']['Tables']['weekly_picks']['Row']

declare global {
    type Database = db;
    
    // Base types from database
    type LeagueID = League['id'];
    type LeagueSportsLeague = League['league'];
    type TeamID = Team['id'];
    type PlayerID = Player['id'];
    type UserID = Team['user_id'];
    
    // Enhanced types with relationships
    type TeamWithLeague = Team & {
        author: Profile;
        league: League;
    }
    
    type TeamWithOwner = Team & {
        owner: Profile;
        totalScore: number;
    }
    
    type TeamWithPlayers = Team & {
        players: Player[];
    }

    // New consolidated types for components
    type WeeklyPickWithPlayer = WeeklyPick & {
        player: Player;
    }

    type TeamWithRelations = Team & {
        owner: Pick<Profile, 'full_name'> | null;
        leagues: League | null;
    }

    // Update TeamData to use the new type
    type TeamData = {
        team: TeamWithRelations;
        weeklyPicks: WeeklyPickWithPlayer[];
        totalScore: number;
    }

    interface OneTeamProps {
        teamData: TeamData;
    }

    interface SearchPageProps {
        teamData: TeamData;
        sports_league: string;
    }

    // Base types (keep these if still needed)
    type Player = Player;
    type GameStats = GameStats;
    type League = League;
}