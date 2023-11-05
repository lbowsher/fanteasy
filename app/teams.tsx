'use client'

export default function Teams({ teams }: { teams: TeamWithLeague[] }){
    return teams.map(team => ( 
        <div>
            <div className="ml-4">
                <p>
                    <span className="font-bold"> {team.name} </span>
                </p>
                <p> {team.league.name}</p>
            </div>
        </div>
    ))

}