import { Badge, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { usePlayers } from '../../../classes/TownController';
import PlayerController from '../../../classes/PlayerController';

/**
 * A generic component that renders a token leaderboard.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the UsePlayers hook to get the current players of the game. (@see usePlayers)
 *
 *
 */
export function TokenLeaderboard(): JSX.Element {
  const players = usePlayers();

  const mapFunction = (player: PlayerController, index: number) => {
    return (
      <Flex key={index} justify='space-between' align='center' p={2} borderBottomWidth='1px'>
        <Text>{index + 1}</Text>
        <Text>{player.userName}</Text>
        <Badge>{player.tokens}</Badge>
      </Flex>
    );
  };

  const sortedPlayers = players?.sort((a, b) => b.tokens - a.tokens).map(mapFunction);

  return (
    <>
      <Flex justify='space-between' align='center' p={2} borderBottomWidth='1px'>
        <Text fontWeight='bold'>Rank</Text>
        <Text fontWeight='bold'>Player Name</Text>
        <Text fontWeight='bold'>Tokens</Text>
      </Flex>
      {sortedPlayers}
    </>
  );
}
