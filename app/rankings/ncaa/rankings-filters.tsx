'use client';

import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getPositionsForLeague } from '@/app/draft/[id]/utils';

interface RankingsFiltersProps {
  positionFilter: string;
  onPositionChange: (position: string) => void;
  teamFilter: string;
  onTeamChange: (team: string) => void;
  teams: string[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function RankingsFilters({
  positionFilter,
  onPositionChange,
  teamFilter,
  onTeamChange,
  teams,
  searchTerm,
  onSearchChange,
}: RankingsFiltersProps) {
  const positions = ['All', ...getPositionsForLeague('NCAAM')];

  return (
    <div className="flex flex-col gap-3 mt-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs value={positionFilter} onValueChange={onPositionChange}>
          <TabsList>
            {positions.map((pos) => (
              <TabsTrigger key={pos} value={pos}>
                {pos}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select value={teamFilter} onValueChange={onTeamChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team} value={team}>
                {team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <Input
          type="text"
          className="pl-10"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}
