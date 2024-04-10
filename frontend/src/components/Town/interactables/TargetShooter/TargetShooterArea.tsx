import {
  Box,
  Button,
  ButtonGroup,
  Center,
  List,
  ListItem,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import PlayerController from '../../../../classes/PlayerController';
import { useInteractableAreaController } from '../../../../classes/TownController';
import useTownController from '../../../../hooks/useTownController';
import {
  GameStatus,
  InteractableID,
  TargetShooterDifficulty,
} from '../../../../types/CoveyTownSocket';
import TargetAreaController from '../../../../classes/interactable/TargetShooterAreaController';
import TargetShooterDisplay from './TargetShooterDisplay';

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
export default function TargetShooterArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const gameAreaController = useInteractableAreaController<TargetAreaController>(interactableID);
  const townController = useTownController();

  const [player1, setPlayer1] = useState<PlayerController | undefined>(gameAreaController.player1);
  const [player2, setPlayer2] = useState<PlayerController | undefined>(gameAreaController.player2);
  const [joiningGame, setJoiningGame] = useState(false);

  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [difficulty, setDifficulty] = useState<TargetShooterDifficulty>(
    gameAreaController.difficulty,
  );
  const toast = useToast();
  useEffect(() => {
    const updateGameState = () => {
      setPlayer1(gameAreaController.player1);
      setPlayer2(gameAreaController.player2);
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
        gameAreaController.addToken(10);
        toast({
          title: 'Game over',
          description: 'You won!',
          status: 'success',
        });
      } else if (gameAreaController.isPlayer) {
        toast({
          title: 'Game over',
          description: `You lost :(`,
          status: 'error',
        });
      } else {
        toast({
          title: 'Game over',
          description: `${winner.userName} won!`,
          status: 'info',
        });
      }
    };
    gameAreaController.addListener('gameUpdated', updateGameState);
    gameAreaController.addListener('gameEnd', onGameEnd);
    gameAreaController.addListener('difficultyUpdated', setDifficulty);
    return () => {
      gameAreaController.removeListener('gameUpdated', updateGameState);
      gameAreaController.removeListener('gameEnd', onGameEnd);
      gameAreaController.removeListener('difficultyUpdated', setDifficulty);
    };
  }, [townController, gameAreaController, toast]);
  let gameStatusText = <></>;
  if (gameStatus === 'IN_PROGRESS') {
    gameStatusText = (
      <>
        Game in progress{' '}
        {townController.ourPlayer === gameAreaController.player1
          ? "(You're player 1)"
          : townController.ourPlayer === gameAreaController.player2
          ? "(You're player 2)"
          : 'You are observing'}
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

  const difficultyButton = (btnDifficulty: TargetShooterDifficulty) => {
    return (
      <Button
        size='sm'
        disabled={gameAreaController.status === 'IN_PROGRESS' || difficulty === btnDifficulty}
        onClick={async () => {
          try {
            await gameAreaController.changeDifficulty(btnDifficulty);
          } catch (e) {
            toast({
              title: 'Error changing difficulty',
              description: (e as Error).toString(),
              status: 'error',
            });
          }
        }}>
        {btnDifficulty}
      </Button>
    );
  };

  const difficultyButtons = (
    <ButtonGroup isAttached>
      {difficultyButton('Easy')}
      {difficultyButton('Medium')}
      {difficultyButton('Hard')}
    </ButtonGroup>
  );

  return (
    <>
      {gameStatusText}
      <List aria-label='list of players in the game'>
        <ListItem>player1: {player1?.userName || '(No player yet!)'}</ListItem>
        <ListItem>player2: {player2?.userName || '(No player yet!)'}</ListItem>
      </List>
      <Center marginTop={2} marginBottom={2}>
        <VStack>
          <Text size='md' as='b'>
            Difficulty
          </Text>
          <Box>{difficultyButtons}</Box>
          <Text fontSize='large' as='b' align='center'></Text>
          {gameAreaController.status !== 'IN_PROGRESS' ? (
            <Center>
              <Text align={'center'} as='b'>
                Shoot the targets faster than your opponent by clicking on them. Score 10 points to
                win!
              </Text>
            </Center>
          ) : (
            <></>
          )}
        </VStack>
      </Center>
      <TargetShooterDisplay gameAreaController={gameAreaController} />
    </>
  );
}
