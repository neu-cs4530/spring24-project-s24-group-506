import ConnectFourAreaController, {
  ConnectFourCell,
} from '../../../../classes/interactable/ConnectFourAreaController';
import { Button, ButtonGroup, chakra, Container, Flex, useToast, Text } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import {
  ConnectFourColIndex,
  TargetShooterAccuracy,
  TargetShooterDifficulty,
  TargetShooterGameState,
  TargetShooterPlayer,
  TargetShooterScore,
  XY,
} from '../../../../types/CoveyTownSocket';
import TargetShooterAreaController from '../../../../classes/interactable/TargetShooterAreaController';

export type TargetShooterProps = {
  gameAreaController: TargetShooterAreaController;
};

const Target = ({ position, size }: { position: XY, size: number }) => {
  const style = {
    left: position.x,
    top: position.y,
    width: size,
    height: size,
  };

  return <div className='target' style={style}></div>;
};

/**
 * A component that renders the ConnectFour state
 *
 * Renders the ConnectFour state as a "StyledConnectFourstate", which consists of "StyledConnectFourSquare"s
 * (one for each cell in the state, starting from the top left and going left to right, top to bottom).
 *
 * Each StyledConnectFourSquare has an aria-label property that describes the cell's position in the state,
 * formatted as `Cell ${rowIndex},${colIndex} (Red|Yellow|Empty)`.
 *
 * The background color of each StyledConnectFourSquare is determined by the value of the cell in the state, either
 * 'red', 'yellow', or '' (an empty for an empty square).
 *
 * The state is re-rendered whenever the state changes, and each cell is re-rendered whenever the value
 * of that cell changes.
 *
 * If the current player is in the game, then each StyledConnectFourSquare is clickable, and clicking
 * on it will make a move in that column. If there is an error making the move, then a toast will be
 * displayed with the error message as the description of the toast. If it is not the current player's
 * turn, then the StyledConnectFourSquare will be disabled.
 *
 * @param gameAreaController the controller for the ConnectFour game
 */
export default function TargetShooterDisplay({
  gameAreaController,
}: TargetShooterProps): JSX.Element {
  const [targetPosition, setTargetPosition] = useState(gameAreaController.targetPosition);
  const [player1Score, setPlayer1Score] = useState<TargetShooterScore>(
    gameAreaController.player1Score,
  );
  const [player2Score, setPlayer2Score] = useState<TargetShooterScore>(
    gameAreaController.player2Score,
  );
  const [targetSize, setTargetSize] = useState<number>(gameAreaController.targetSize);
  const [player1Accuracy, setPlayer1Accuracy] = useState<TargetShooterAccuracy>(gameAreaController.player1Accuracy);
  const [player2Accuracy, setPlayer2Accuracy] = useState<TargetShooterAccuracy>(gameAreaController.player2Accuracy);
  const toast = useToast();

  useEffect(() => {
    gameAreaController.addListener('targetPositionUpdated', setTargetPosition);
    gameAreaController.addListener('player1ScoreUpdated', setPlayer1Score);
    gameAreaController.addListener('player2ScoreUpdated', setPlayer2Score);
    gameAreaController.addListener('targetSizeUpdated', setTargetSize);
    gameAreaController.addListener('player1AccuracyUpdated', setPlayer1Accuracy);
    gameAreaController.addListener('player2AccuracyUpdated', setPlayer2Accuracy);
    return () => {
      gameAreaController.removeListener('targetPositionUpdated', setTargetPosition);
      gameAreaController.removeListener('player1ScoreUpdated', setPlayer1Score);
      gameAreaController.removeListener('player2ScoreUpdated', setPlayer2Score);
      gameAreaController.removeListener('targetSizeUpdated', setTargetSize);
      gameAreaController.removeListener('player1AccuracyUpdated', setPlayer1Accuracy);
      gameAreaController.removeListener('player2AccuracyUpdated', setPlayer2Accuracy);
    };
  }, [gameAreaController]);

  const handleMouseClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event;
    const div = document.getElementById('targetshoot');
    const rect = div?.getBoundingClientRect();
    if (gameAreaController.status === 'IN_PROGRESS' && rect) {
      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;

      const target = gameAreaController.targetSize;

      const targetCenterX = relativeX - target / 2;
      const targetCenterY = relativeY - target / 2;

      // console log click position
      console.log(`Clicked at ${targetCenterX}, ${targetCenterY}`);
      // console log target position
      console.log(`Target at ${targetPosition.x}, ${targetPosition.y}`);

      try {
        await gameAreaController.makeMove({ x: targetCenterX, y: targetCenterY });
      } catch (e) {
        toast({
          title: 'Error making move',
          description: (e as Error).toString(),
          status: 'error',
        });
      }
    }
  };

  const player1AccuracyPercent = (player1Accuracy.shots === 0 ? 0 : (player1Accuracy.hits / player1Accuracy.shots) * 100);
  const player2AccuracyPercent = (player2Accuracy.shots === 0 ? 0 : (player2Accuracy.hits / player2Accuracy.shots) * 100);

  const p1red = 255 - (player1AccuracyPercent * 2.55);
  const p1green = player1AccuracyPercent * 2.55;
  const p1rgb = `rgb(${p1red}, ${p1green}, ${0})`;
  const p2red = 255 - (player2AccuracyPercent * 2.55);
  const p2green = player2AccuracyPercent * 2.55;
  const p2rgb = `rgb(${p2red}, ${p2green}, ${0})`;

  const player1AccuracyText = player1Accuracy.shots === 0 ? '0.00%' : `${player1AccuracyPercent.toFixed(2)}%`;
  const player2AccuracyText = player2Accuracy.shots === 0 ? '0.00%' : `${player2AccuracyPercent.toFixed(2)}%`;


  return (
    <div>
      <Flex justifyContent={'space-between'}>
        <Text>Player 1 Score: {player1Score}</Text>
        <Text>Player 2 Score: {player2Score}</Text>
      </Flex>
      
      <div className='gamecontainer' id='targetshoot' onClick={handleMouseClick}>
        <Target position={targetPosition} size={targetSize} />
      </div>

      <Flex justifyContent={'space-between'}>
        <Text color={p1rgb}>Player 1 Accuracy: {player1AccuracyText}</Text>
        <Text color={p2rgb}>Player 2 Accuracy: {player2AccuracyText}</Text>
      </Flex>
    </div>
  );
}
