'use client'

import { Team } from "./global";

export default function Teams({ teams }: { teams: TeamWithLeague[] }){
    console.log(teams);
    return teams.map(team => ( 
        <div>
            <h1>My Teams</h1>
            <div className="ml-4">
                <p>
                    <span className="font-bold"> {team.name} </span>
                </p>
                <p> {team.league.name}</p>
            </div>
        </div>
    ))

}