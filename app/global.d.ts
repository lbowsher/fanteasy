import { Database as db } from '@/lib/database.types';

type League = DB['public']['Tables']['leagues']['Row']
type Team = DB['public']['Tables']['teams']['Row']
type Profile = DB['public']['Tables']['profiles']['Row']

declare global {
    type Database = db;
    type TeamWithLeague = Team & {
        author: Profiler;
        league: League;
    }
}