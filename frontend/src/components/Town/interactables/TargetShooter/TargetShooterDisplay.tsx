import ConnectFourAreaController, {
  ConnectFourCell,
} from '../../../../classes/interactable/ConnectFourAreaController';
import { Button, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import {
  ConnectFourColIndex,
  TargetShooterGameState,
  TargetShooterPlayer,
  TargetShooterScore,
  XY,
} from '../../../../types/CoveyTownSocket';
import TargetShooterAreaController from '../../../../classes/interactable/TargetShooterAreaController';
import { on } from 'events';

export type TargetShooterProps = {
  gameAreaController: TargetShooterAreaController;
};

const Target = ({ position }: { position: XY }) => {
  const style = {
    left: position.x,
    top: position.y,
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
  const toast = useToast();

  useEffect(() => {
    gameAreaController.addListener('targetPositionUpdated', setTargetPosition);
    gameAreaController.addListener('player1ScoreUpdated', setPlayer1Score);
    gameAreaController.addListener('player2ScoreUpdated', setPlayer2Score);
    return () => {
      gameAreaController.removeListener('targetPositionUpdated', setTargetPosition);
      gameAreaController.removeListener('player1ScoreUpdated', setPlayer1Score);
      gameAreaController.removeListener('player2ScoreUpdated', setPlayer2Score);
    };
  }, [gameAreaController]);

  const handleMouseClick = async (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY } = event;
    const div = document.getElementById('targetshoot');
    const rect = div?.getBoundingClientRect();
    if (gameAreaController.status === 'IN_PROGRESS' && rect) {
      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;

      // subtract the size of the target from relativeX and relativeY to get the center of the target
      // get the size of the target from the controller
      const target = gameAreaController.targetSize;

      // const target = 20;
      //   const targetX = targetPosition.x;
      //   const targetY = targetPosition.y;
      //   const targetCenterX = targetX + target / 2;
      //   const targetCenterY = targetY + target / 2;

      const targetCenterX = relativeX - target / 2;
      const targetCenterY = relativeY - target / 2;

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

  return (
    <div>
      <h1>targetShooter</h1>
      <h2>Player 1 Score: {player1Score}</h2>
      <h2>Player 2 Score: {player2Score}</h2>
      <div className='gamecontainer' id='targetshoot' onClick={handleMouseClick}>
        <Target position={targetPosition} />
      </div>
    </div>
  );
}
