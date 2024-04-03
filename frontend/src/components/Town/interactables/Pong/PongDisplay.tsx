import ConnectFourAreaController, {
  ConnectFourCell,
} from '../../../../classes/interactable/ConnectFourAreaController';
import { Button, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectFourColIndex, PongGameState, PongPlayer, PongScore, XY } from '../../../../types/CoveyTownSocket';
import PongAreaController from '../../../../classes/interactable/PongAreaController';

export type PongGameProps = {
  gameAreaController: PongAreaController;
};

const Paddle = ({ position }: { position: XY }) => {
  const style = {
    left: position.x,
    top: position.y,
  };

  return <div className="paddle" style={style}></div>;
};

const Ball = ({ position }: { position: XY}) => {
  const style = {
    left: position.x,
    top: position.y,
  };

  return <div className="ball" style={style}></div>;
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
export default function PongDisplay({
  gameAreaController,
}: PongGameProps): JSX.Element {
  const [ballPosition, setBallPosition] = useState(gameAreaController.ballPosition);
  const [leftScore, setLeftScore] = useState<PongScore>(gameAreaController.leftScore);
  const [rightScore, setRightScore] = useState<PongScore>(gameAreaController.rightScore);
  const [leftPaddle, setLeftPaddle] = useState<XY>(gameAreaController.leftPaddle);
  const [rightPaddle, setRightPaddle] = useState<XY>(gameAreaController.rightPaddle);
  let iPressed = false;
  let oPressed = false;

  const toast = useToast();

  useEffect(() => {
    gameAreaController.addListener('ballPositionUpdated', setBallPosition);
    gameAreaController.addListener('leftScoreUpdated', setLeftScore);
    gameAreaController.addListener('rightScoreUpdated', setRightScore);
    gameAreaController.addListener('leftPaddleUpdated', setLeftPaddle);
    gameAreaController.addListener('rightPaddleUpdated', setRightPaddle);
    return () => {
      gameAreaController.removeListener('ballPositionUpdated', setBallPosition);
      gameAreaController.removeListener('leftScoreUpdated', setLeftScore);
      gameAreaController.removeListener('rightScoreUpdated', setRightScore);
      gameAreaController.removeListener('leftPaddleUpdated', setLeftPaddle);
      gameAreaController.removeListener('rightPaddleUpdated', setRightPaddle);
    };
  }, [gameAreaController]);

  useEffect(() => {
    let updateBall: NodeJS.Timeout | undefined;
    if (gameAreaController.status === 'IN_PROGRESS' && gameAreaController.isPlayer && gameAreaController.gamePiece === 'Left') {
      updateBall = setInterval(() => {
        gameAreaController.updatePhysics();
      }, 10);
    }
    return () => clearInterval(updateBall);
  }, [gameAreaController.status]);

  useEffect(() => {
    const handleKeyDown = async (event: any) => {
      if (event.key === 'i' && gameAreaController.isPlayer) {
        // Handle 'i' key press
        if (!iPressed && gameAreaController.status === 'IN_PROGRESS') {
          iPressed = true;
          console.log("Key 'i' pressed");
          if (gameAreaController.status !== 'IN_PROGRESS') return;
          try {
            await gameAreaController.makeMove('Up');
          }
          catch (e) {
            toast({
              title: 'Error making move',
              description: (e as Error).toString(),
              status: 'error',
            });
          }
        }
      } else if (event.key === 'o' && gameAreaController.isPlayer) {
        // Handle 'o' key press
        if (!oPressed && gameAreaController.status === 'IN_PROGRESS') {
          oPressed = true;
          console.log("Key 'o' pressed");
          if (gameAreaController.status !== 'IN_PROGRESS') return;
          try {
            await gameAreaController.makeMove('Down');
          }
          catch (e) {
            toast({
              title: 'Error making move',
              description: (e as Error).toString(),
              status: 'error',
            });
          }
        }
      }
    };

    const handleKeyUp = async (event: any) => {
      if (event.key === 'i' && gameAreaController.isPlayer) {
        // Handle 'i' key release
        if (iPressed) {
          iPressed = false;
          try {
            await gameAreaController.makeMove('Still');
          }
          catch (e) {
            toast({
              title: 'Error making move',
              description: (e as Error).toString(),
              status: 'error',
            });
          }
        }
        console.log("Key 'i' released");
      } else if (event.key === 'o' && gameAreaController.isPlayer) {
        // Handle 'o' key release
        if (oPressed) {
          oPressed = false;
          try {
            await gameAreaController.makeMove('Still');
          }
          catch (e) {
            toast({
              title: 'Error making move',
              description: (e as Error).toString(),
              status: 'error',
            });
          }
        }
        console.log("Key 'o' released");
      }
    };

    addEventListener('keydown', handleKeyDown);
    addEventListener('keyup', handleKeyUp);

    return () => {
      removeEventListener('keydown', handleKeyDown);
      removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div>
      <h1>pong</h1>
      <h2>Left Score: {leftScore}</h2>
      <h2>Right Score: {rightScore}</h2>
      <h2>Our Paddle Position: {JSON.stringify(leftPaddle)}</h2>
      <h2>Opp Paddle Position: {JSON.stringify(rightPaddle)}</h2>
      <h2>Ball Position: {JSON.stringify(ballPosition)}</h2>
      <div className="gamecontainer">
      <Paddle position={leftPaddle} />
      <Paddle position={rightPaddle} />
      <Ball position={ballPosition} />
    </div>
    </div>
  );
}
