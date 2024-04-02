import { Button, List, ListItem, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ConnectFourAreaController from '../../../../classes/interactable/ConnectFourAreaController';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import { GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import ConnectFourBoard from '../ConnectFour/ConnectFourBoard';
import { PongGame } from '../../../../classes/PongGame';
import PongAreaController from '../../../../classes/interactable/PongAreaController';
import PongDisplay from './PongDisplay';

/**
 * The ConnectFourArea component renders the Connect Four game area.
 * It renders the current state of the area, optionally allowing the player to join the game.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It uses the ConnectFourAreaController to get the current state of the game.
 * It listens for the 'gameUpdated' and 'gameEnd' events on the controller, and re-renders accordingly.
 * It subscribes to these events when the component mounts, and unsubscribes when the component unmounts. It also unsubscribes when the gameAreaController changes.
 *
 * It renders the following:
 * - A list of players' usernames (in a list with the aria-label 'list of players in the game', one item for leftPlayer and one for rightPlayer)
 *    - If there is no player in the game, the username is '(No player yet!)'
 *    - List the players as (exactly) `leftPlayer: ${username}` and `rightPlayer: ${username}`
 * - A message indicating the current game status:
 *    - If the game is in progress, the message is 'Game in progress, {moveCount} moves in, currently {whoseTurn}'s turn'. If it is currently our player's turn, the message is 'Game in progress, {moveCount} moves in, currently your turn'
 *    - If the game is in status WAITING_FOR_PLAYERS, the message is 'Waiting for players to join'
 *    - If the game is in status WAITING_TO_START, the message is 'Waiting for players to press start'
 *    - If the game is in status OVER, the message is 'Game over'
 * - If the game is in status WAITING_FOR_PLAYERS or OVER, a button to join the game is displayed, with the text 'Join New Game'
 *    - Clicking the button calls the joinGame method on the gameAreaController
 *    - Before calling joinGame method, the button is disabled and has the property isLoading set to true, and is re-enabled when the method call completes
 *    - If the method call fails, a toast is displayed with the error message as the description of the toast (and status 'error')
 *    - Once the player joins the game, the button dissapears
 * - If the game is in status WAITING_TO_START, a button to start the game is displayed, with the text 'Start Game'
 *    - Clicking the button calls the startGame method on the gameAreaController
 *    - Before calling startGame method, the button is disabled and has the property isLoading set to true, and is re-enabled when the method call completes
 *    - If the method call fails, a toast is displayed with the error message as the description of the toast (and status 'error')
 *    - Once the game starts, the button dissapears
 * - The ConnectFourBoard component, which is passed the current gameAreaController as a prop (@see ConnectFourBoard.tsx)
 *
 * - When the game ends, a toast is displayed with the result of the game:
 *    - Tie: description 'Game ended in a tie'
 *    - Our player won: description 'You won!'
 *    - Our player lost: description 'You lost :('
 *
 */
export default function PongArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<PongAreaController>(interactableID);
  const townController = useTownController();

  const [leftPlayer, setLeftPlayer] = useState<PlayerController | undefined>(gameAreaController.leftPlayer);
  const [rightPlayer, setRightPlayer] = useState<PlayerController | undefined>(gameAreaController.rightPlayer);
  const [joiningGame, setJoiningGame] = useState(false);

  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const toast = useToast();
  useEffect(() => {
    const updateGameState = () => {
      setLeftPlayer(gameAreaController.leftPlayer);
      setRightPlayer(gameAreaController.rightPlayer);
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
    };
    const onGameEnd = () => {
      const winner = gameAreaController.winner;
      if (!winner) {
        toast({
          title: 'Game over',
          description: 'Game ended in a tie',
          status: 'info',
        });
      } else if (winner === townController.ourPlayer) {
        toast({
          title: 'Game over',
          description: 'You won!',
          status: 'success',
        });
      } else {
        toast({
          title: 'Game over',
          description: `You lost :(`,
          status: 'error',
        });
      }
    };
    gameAreaController.addListener('gameUpdated', updateGameState);
    gameAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      gameAreaController.removeListener('gameUpdated', updateGameState);
      gameAreaController.removeListener('gameEnd', onGameEnd);
    };
  }, [townController, gameAreaController, toast]);
  let gameStatusText = <></>;
  if (gameStatus === 'IN_PROGRESS') {
    gameStatusText = (
      <>
        Game in progress{' '}
        {townController.ourPlayer === gameAreaController.rightPlayer
          ? "(You're on the right)"
          : "(You're on the left)"}
      </>
    );
  } else if (gameStatus == 'WAITING_TO_START') {
    const startGameButton = (
      <Button
        onClick={async () => {
          setJoiningGame(true);
          try {
            await gameAreaController.startGame();
          } catch (err) {
            toast({
              title: 'Error starting game',
              description: (err as Error).toString(),
              status: 'error',
            });
          }
          setJoiningGame(false);
        }}
        isLoading={joiningGame}
        disabled={joiningGame}>
        Start Game
      </Button>
    );
    gameStatusText = <b>Waiting for players to press start. {startGameButton}</b>;
  } else {
    const joinGameButton = (
      <Button
        onClick={async () => {
          setJoiningGame(true);
          try {
            await gameAreaController.joinGame();
          } catch (err) {
            toast({
              title: 'Error joining game',
              description: (err as Error).toString(),
              status: 'error',
            });
          }
          setJoiningGame(false);
        }}
        isLoading={joiningGame}
        disabled={joiningGame}>
        Join New Game
      </Button>
    );
    let gameStatusStr;
    if (gameStatus === 'OVER') gameStatusStr = 'over';
    else if (gameStatus === 'WAITING_FOR_PLAYERS') gameStatusStr = 'waiting for players to join';
    gameStatusText = (
      <b>
        Game {gameStatusStr}. {joinGameButton}
      </b>
    );
  }
  return (
    <>
      {gameStatusText}
      <List aria-label='list of players in the game'>
        <ListItem>leftPlayer: {leftPlayer?.userName || '(No player yet!)'}</ListItem>
        <ListItem>rightPlayer: {rightPlayer?.userName || '(No player yet!)'}</ListItem>
      </List>
      <PongDisplay gameAreaController={gameAreaController} />
    </>
  );
}
