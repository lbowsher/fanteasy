
import { User } from '@supabase/supabase-js'
import { createClient } from '../utils/supabase/server'
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
//import AuthButtonServer from '../../auth-button-server'
import Link from 'next/link';



export default function LeagueCreator({user}: {user: User}) {//AddLeague: (formData: FormData) => Promise<void>) {  

    const AddLeague = async (formData: FormData) => {
        "use server";
        const league_name = String(formData.get('LeagueName'));
        const num_teams = parseInt(String(formData.get('NumTeams')));
        const scoring_type = String(formData.get('ScoringType'));
        const sports_league = String(formData.get('SportsLeague'));
        const supabase = await createClient();
        const {data, error} = await supabase.from('leagues').insert({
            name: league_name, 
            num_teams: num_teams, 
            scoring_type: scoring_type, 
            league: sports_league,
            commish: user.id, //todo update
        }).select('id');

        if (error) {
            console.error("League creation error:", error);
            throw error;
        }

        if (!data || data.length === 0) {
            console.error("No data returned after league creation");
            throw new Error("League creation failed");
        }

        const new_league_id = data[0].id;
        console.log("League created with ID:", new_league_id);

        // Create all teams in a single insert operation
        const teamsToCreate = [
            // Commissioner's team
            {
                name: 'Team 1',
                league_id: new_league_id,
                is_commish: true,
                user_id: user.id
            },
            // Other teams
            ...Array.from({length: num_teams - 1}, (_, i) => ({
                name: `Team ${i+2}`,
                league_id: new_league_id,
                is_commish: false
            }))
        ];

        const { error: teamsError } = await supabase
            .from('teams')
            .insert(teamsToCreate);

        if (teamsError) {
            console.error("Error creating teams:", teamsError);
            throw teamsError;
            }

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/');
        return redirect('/');

        }
    return ( 
        <div className="w-full max-w-xl mx-auto">
            <div className="flex justify-between px-4 py-6 border-slate-grey border border-t-0">
                <Link className="text-xl font-bold hover:text-liquid-lava transition-colors" href={'/'}>
                    Home
                </Link>
            </div>
            <div>
                <form className="flex-wrap border-slate-grey border border-t-0 p-6" action={AddLeague}>
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