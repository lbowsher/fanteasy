'use client';

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import PlayerRankingCard from './player-ranking-card';
import type { PlayerWithStats } from './utils';

interface PlayerRankingsListProps {
  players: PlayerWithStats[];
  onReorder: (newOrder: PlayerWithStats[]) => void;
  expectedGames: Record<string, number>;
  rankMap?: Map<string, number>;
}

export default function PlayerRankingsList({
  players,
  onReorder,
  expectedGames,
  rankMap,
}: PlayerRankingsListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(players);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onReorder(items);
  };

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No players found matching your filters.
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="playerRankings">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-1"
          >
            {players.map((player, index) => (
              <Draggable key={player.id} draggableId={player.id} index={index}>
                {(provided, snapshot) => (
                  <PlayerRankingCard
                    player={player}
                    rank={rankMap?.get(player.id) ?? index + 1}
                    expectedGames={expectedGames[player.team_name] || 1}
                    provided={provided}
                    isDragging={snapshot.isDragging}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
