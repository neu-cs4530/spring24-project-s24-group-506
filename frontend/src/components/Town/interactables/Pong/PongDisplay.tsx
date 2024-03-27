import { Button, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ConnectFourColIndex, PongGameState } from '../../../../types/CoveyTownSocket';
import PongAreaController from '../../../../classes/interactable/PongAreaController';
import { StartingScene } from '../../../../classes/PongScenes/StartingScene';
import { PlayingScene } from '../../../../classes/PongScenes/PlayingScene';

const config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 640,
    scene: [StartingScene, PlayingScene],
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
  };
  
  export type PongGameProps = {
    gameAreaController: PongAreaController;
  };
  const StyledPongGame = chakra(Container, {
    baseStyle: {
      display: 'flex',
      width: '800px',
      height: '640px',
      padding: '5px',
      flexWrap: 'wrap',
    },
  });
  /**
   * A component that renders the ConnectFour board
   *
   * Renders the ConnectFour board as a "StyledConnectFourBoard", which consists of "StyledConnectFourSquare"s
   * (one for each cell in the board, starting from the top left and going left to right, top to bottom).
   *
   * Each StyledConnectFourSquare has an aria-label property that describes the cell's position in the board,
   * formatted as `Cell ${rowIndex},${colIndex} (Red|Yellow|Empty)`.
   *
   * The background color of each StyledConnectFourSquare is determined by the value of the cell in the board, either
   * 'red', 'yellow', or '' (an empty for an empty square).
   *
   * The board is re-rendered whenever the board changes, and each cell is re-rendered whenever the value
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
    const [state, setState] = useState<PongGameState>(gameAreaController.state);
    const toast = useToast();
    useEffect(() => {
        gameAreaController.addListener('stateUpdated', setState);
      return () => {
        gameAreaController.removeListener('stateUpdated', setState);
      };
    }, [gameAreaController]);

    useEffect(() => {
        const game = new Phaser.Game(config);
      }, []);

    return (
      <StyledPongGame aria-label='Connect Four Board' id='phaser-example'>
      </StyledPongGame>
    );
  }
  