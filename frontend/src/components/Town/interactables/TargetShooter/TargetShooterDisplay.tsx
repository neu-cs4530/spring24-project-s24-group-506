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

const Cursor = ({ position }: { position: XY }) => {
  const style = {
    left: position.x,
    top: position.y,
  };

  return <div className='cursor' style={style}></div>;
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
}: TargetShooterGameProps): JSX.Element {
  const [targetPosition, setTargetPosition] = useState(gameAreaController.newTargetPosition);
  const [player1Score, setPlayer1Score] = useState<TargetShooterScore>(
    gameAreaController.player1Score,
  );
  const [player2Score, setPlayer2Score] = useState<TargetShooterScore>(
    gameAreaController.player2Score,
  );
  const [player1Cursor, setPlayer1Cursor] = useState<XY>(gameAreaController.player1Cursor);
  const [player2Cursor, setPlayer2Cursor] = useState<XY>(gameAreaController.player2Cursor);

  const toast = useToast();

  useEffect(() => {
    gameAreaController.addListener('targetPositionUpdated', setTargetPosition);
    gameAreaController.addListener('player1ScoreUpdated', setPlayer1Score);
    gameAreaController.addListener('player2ScoreUpdated', setPlayer2Score);
    gameAreaController.addListener('player1CursorUpdated', setPlayer1Cursor);
    gameAreaController.addListener('player2CursorUpdated', setPlayer2Cursor);
    return () => {
      gameAreaController.removeListener('targetPositionUpdated', setTargetPosition);
      gameAreaController.removeListener('player1ScoreUpdated', setPlayer1Score);
      gameAreaController.removeListener('player2ScoreUpdated', setPlayer2Score);
      gameAreaController.removeListener('player1CursorUpdated', setPlayer1Cursor);
      gameAreaController.removeListener('player2CursorUpdated', setPlayer2Cursor);
    };
  }, [gameAreaController]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const mouseX = clientX;
      const mouseY = clientY;

      if (gameAreaController.playerID === gameAreaController.player1) {
        // Update cursor positions based on mouse movement
        setPlayer1Cursor({ x: mouseX, y: mouseY });
      } else {
        // Update cursor positions based on mouse movement
        setPlayer2Cursor({ x: mouseX, y: mouseY });
      }
    };

    // should probably go to backend
    const handleTargetClick = () => {
      // pass handleTargetClick as function for onClick
      // Spawn a new target at a random location
      // need to call _spawnTarget so position is the same
      // get the values from the backend
      const newTargetPosition = {
        x: this._model.game?.state.currentTarget.x,
        y: this._model.game?.state.currentTarget.y,
      };
      setTargetPosition(newTargetPosition);
      return <Target {...{ position: newTargetPosition, onClick: handleTargetClick }} />;
    };

    // use onClick to call handleTargetClick
    // use onMouseMove to call handleMouseMove

    // Add event listeners for mouse movement and target click
    addEventListener('mousemove', handleMouseMove);
    addEventListener('click', handleTargetClick);
    // receive event
    // send event

    // Cleanup
    return () => {
      removeEventListener('mousemove', handleMouseMove);
      removeEventListener('click', handleTargetClick);
    };
  }, []);

  return (
    <div>
      <h1>targetShooter</h1>
      <h2>Player 1 Score: {player1Score}</h2>
      <h2>Player 2 Score: {player2Score}</h2>
      <h2>Player1 Position: {JSON.stringify(player1Cursor)}</h2>
      <h2>Player2 Position: {JSON.stringify(player2Cursor)}</h2>
      <h2>Target Position: {JSON.stringify(targetPosition)}</h2>
      <div className='gamecontainer'>
        <Cursor position={player1Cursor} />
        <Cursor position={player2Cursor} />
        <Target position={targetPosition} />
      </div>
    </div>
  );
}
