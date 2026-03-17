'use client';

import Image from 'next/image';
import { DraggableProvided } from '@hello-pangea/dnd';
import { getPositionBorderColor, getPositionTextColor } from '@/app/draft/[id]/utils';
import type { PlayerWithStats } from './utils';

interface PlayerRankingCardProps {
  player: PlayerWithStats;
  rank: number;
  expectedGames: number;
  provided: DraggableProvided;
  isDragging: boolean;
}

export default function PlayerRankingCard({
  player,
  rank,
  expectedGames,
  provided,
  isDragging,
}: PlayerRankingCardProps) {
  const borderColor = getPositionBorderColor(player.position, 'NCAAM');
  const posTextColor = getPositionTextColor(player.position, 'NCAAM');

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`flex items-center p-2 sm:p-3 rounded-lg border transition-colors ${
        isDragging
          ? 'bg-muted border-primary shadow-lg'
          : 'bg-card border-border hover:bg-muted/50'
      }`}
      style={{
        ...provided.draggableProps.style,
        borderLeftWidth: '3px',
        borderLeftColor: borderColor,
      }}
    >
      {/* Drag handle */}
      <div
        {...provided.dragHandleProps}
        className="flex-shrink-0 mr-2 sm:mr-3 cursor-grab active:cursor-grabbing"
      >
        <div className="flex flex-col gap-0.5">
          <div className="w-4 h-0.5 bg-muted-foreground/40 rounded" />
          <div className="w-4 h-0.5 bg-muted-foreground/40 rounded" />
          <div className="w-4 h-0.5 bg-muted-foreground/40 rounded" />
        </div>
      </div>

      {/* Rank number */}
      <div className="flex-shrink-0 mr-2 sm:mr-3">
        <div className="w-7 h-7 flex items-center justify-center bg-muted text-foreground rounded-full font-bold text-sm">
          {rank}
        </div>
      </div>

      {/* Player photo + name */}
      <div className="flex items-center min-w-0 flex-1 mr-2">
        <Image
          src={player.pic_url || '/default-player.png'}
          alt={player.name}
          className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0"
          width={32}
          height={32}
        />
        <div className="min-w-0">
          <p className="font-medium text-sm text-foreground truncate">{player.name}</p>
          <p className="text-xs text-muted-foreground">
            <span className={posTextColor}>{player.position}</span>
            {' - '}
            {player.team_name}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0 mr-3">
        <span className="w-16 text-right" title="Points Per Game">{player.averages.ppg} pts</span>
        <span className="w-16 text-right" title="Rebounds Per Game">{player.averages.rpg} reb</span>
        <span className="w-16 text-right" title="Assists Per Game">{player.averages.apg} ast</span>
      </div>

      {/* Expected games */}
      <div className="flex-shrink-0 text-right mr-3 w-12">
        <div className="text-sm font-semibold text-foreground">
          {expectedGames}
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">games</div>
      </div>

      {/* Projected total */}
      <div className="flex-shrink-0 text-right w-12">
        <div className="text-sm font-semibold text-primary">
          {player.projectedTotal}
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">proj</div>
      </div>
    </div>
  );
}
