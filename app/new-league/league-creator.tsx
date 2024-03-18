
import { User, createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";



export default function LeagueCreator({user}: {user: User}) {//AddLeague: (formData: FormData) => Promise<void>) {  

    const AddLeague = async (formData: FormData) => {
        "use server";
        const league_name = String(formData.get('LeagueName'));
        const num_teams = Number(formData.get('NumTeams'));
        const bestball = !!(String(formData.get('ScoringType')) === 'BestBall');
        const sports_league = String(formData.get('SportsLeague'));
        const supabase = createServerActionClient<Database>({ cookies });
        const {data} = await supabase.from('leagues').insert({
            name: league_name, 
            num_teams: num_teams, 
            is_bestball: bestball, 
            league: sports_league,
            commish: user.id, //todo update
        }).select('id');
        if (data) {
            console.log("league created");
            const new_leage_id = data[0].id;
            await supabase.from('teams').insert({name: 'Team 1', league_id: new_leage_id, is_commish: true, user_id: user.id});
            await Promise.all(Array.from({length: num_teams - 1}, (_, i) => supabase.from('teams').insert({name: `Team ${i+2}`, league_id: new_leage_id, is_commish: false})));
            console.log("new teams created")
            redirect('/');
        }
        else {
            console.log("ERROR, league not created correctly");
        }
    }

    //<button onClick={AddLeague} className="hover:bg-gray-800 p-8 rounded-xl">Submit</button>
    //<button onClick={handleCancel} className="hover:bg-gray-800 p-8 rounded-xl">Cancel</button>
    
    return ( 
    <form className="flex-wrap border border-gray-800 border-t-0" action={AddLeague}>
        <fieldset className="flex flex-col">
            <legend>Create a New League</legend>
            <input name="LeagueName" 
                    className="bg-inherit flex-1 ml-2 text-2xl placeholder-gray-500 px-2" 
                    placeholder="League Name" required/>
            <label htmlFor="NumTeams">Number of teams:</label>
            <select name="NumTeams" className="bg-inherit">
                {Array.from({length: 13}, (_, i) => i + 2).map((number) => (
                    <option key={number} value={number}>{number}</option>
                ))}
            </select>
            <label htmlFor="SportsLeague">Sports League:</label>
            <select name="SportsLeague" className="bg-inherit">
                <option value="NBA">NBA</option>
                <option value="NCAAM">NCAAM</option>
            </select>
            <label htmlFor="ScoringType">Scoring Type:</label>
            <select name="ScoringType" className="bg-inherit">
                <option value="BestBall">BestBall</option>
            </select>
            <input type="submit" value="Submit"></input>
        </fieldset>
    </form>
    )

}