
import { User, createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";



export default function AddToTeam({user, team_name, team_id}: { user: User, team_name: string, team_id: TeamID}) {//AddLeague: (formData: FormData) => Promise<void>) {  

    const AddUser = async (formData: FormData) => {
        "use server";
        const new_team_name = String(formData.get('TeamName'));
        const supabase = createServerActionClient<Database>({ cookies });
        await supabase.from('teams').update({ user_id: user.id, name: new_team_name }).eq('id', team_id);
        console.log("added user to team")
        redirect('/');
    }

    return ( 
    <form action={AddUser}>
        <input name="TeamName" type="text" placeholder={team_name}
        className="bg-inherit flex-1 ml-2 text-2xl placeholder-gray-500 px-2" />
        <button type="submit">Submit</button>
    </form>
    )

}