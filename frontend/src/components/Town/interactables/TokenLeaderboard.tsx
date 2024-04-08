import { Badge, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { usePlayers } from '../../../classes/TownController';
import PlayerController from '../../../classes/PlayerController';

/**
 * A generic component that renders a game area.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the TicketBoothAreaController corresponding to the provided interactableID to get the current state of the game. (@see useInteractableAreaController)
 *
 * It renders the following:
 *  - A leaderboard of the game results
 *  - A list of occupants' usernames (in a list with the aria-label 'list of occupants in the game')
 *  - The game area component (either ConnectFourArea or TicTacToeArea). If the game area is NOT a ConnectFourArea or TicTacToeArea, then the message INVALID_GAME_AREA_TYPE_MESSAGE appears within the component
 *  - A chat channel for the game area (@see ChatChannel.tsx), with the property interactableID set to the interactableID of the game area
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
