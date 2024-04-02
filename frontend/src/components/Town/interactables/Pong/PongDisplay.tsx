import ConnectFourAreaController, {
    ConnectFourCell,
  } from '../../../../classes/interactable/ConnectFourAreaController';
  import { Button, chakra, Container, useToast } from '@chakra-ui/react';
  import React, { useEffect, useState } from 'react';
  import { ConnectFourColIndex, PongGameState, PongScore, XY } from '../../../../types/CoveyTownSocket';
import PongAreaController from '../../../../classes/interactable/PongAreaController';
import { PongGame } from '../../../../classes/PongGame';

  export type PongGameProps = {
    gameAreaController: PongAreaController;
  };
  const StyledConnectFourstate = chakra(Container, {
    baseStyle: {
      display: 'flex',
      width: '350px',
      height: '350px',
      padding: '5px',
      flexWrap: 'wrap',
    },
  });
  const StyledConnectFourSquare = chakra(Button, {
    baseStyle: {
      justifyContent: 'center',
      alignItems: 'center',
      flexBasis: '14%',
      border: '1px solid black',
      height: '14%',
      fontSize: '50px',
      _disabled: {
        opacity: '100%',
      },
    },
  });
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
    const [leftScore, setLeftScore] = useState<PongScore>(gameAreaController.leftScore);
    const [leftPaddle, setLeftPaddle] = useState<XY>(gameAreaController.leftPaddle);
    const [rightScore, setRightScore] = useState<PongScore>(gameAreaController.rightScore);
    const [rightPaddle, setRightPaddle] = useState<XY>(gameAreaController.rightPaddle);

    const toast = useToast();

    useEffect(() => {
      gameAreaController.addListener('leftScoreUpdated', setLeftScore);
      gameAreaController.addListener('leftPaddleUpdated', setLeftPaddle);
      gameAreaController.addListener('rightScoreUpdated', setRightScore);
      gameAreaController.addListener('rightPaddleUpdated', setRightPaddle);
      return () => {
        gameAreaController.removeListener('leftScoreUpdated', setLeftScore);
        gameAreaController.removeListener('leftPaddleUpdated', setLeftPaddle);
        gameAreaController.removeListener('rightScoreUpdated', setRightScore);
        gameAreaController.removeListener('rightPaddleUpdated', setRightPaddle);
      };
    }, [gameAreaController]);

    class StartingScene extends Phaser.Scene {
      constructor() {
        super('startingScene');
      }

      create() {
        this.add.text(100, 100, 'Starting Scene');
      }

      update() {
        if (gameAreaController.status === 'IN_PROGRESS') {
          this.scene.start('playingScene');
        }
      }
    }

    class PlayingScene extends Phaser.Scene {
      constructor() {
        super('playingScene');
      }

      create() {
        this.add.text(100, 100, 'Playing Scene');
      }

      update(time: number, delta: number): void {
        if (gameAreaController.status === 'WAITING_TO_START' || gameAreaController.status === 'WAITING_FOR_PLAYERS') {
          this.scene.start('startingScene');
        }
      }
    }

    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-example',
      width: 400,
      height: 320,
      scene: [StartingScene, PlayingScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
    };

    useEffect(() => {
        const game = new Phaser.Game(config);
      }, []);
      
    return (
        <div>
            <h1>pong</h1>
            <h2>Left Score: {leftScore}</h2>
            <h2>Right Score: {rightScore}</h2>
            <h2>Left Paddle Position: {JSON.stringify(leftPaddle)}</h2>
            <h2>Right Paddle Position: {JSON.stringify(rightPaddle)}</h2>
            <Button onClick={async () => {
              try {
                await gameAreaController.makeMove({x: 0, y: 0});
              }
              catch (e) {
                toast({
                  title: 'Error making move',
                  description: (e as Error).toString(),
                  status: 'error',
                });
              }
            }}>Move</Button>
            <Button onClick={async () => {
              try {
                await gameAreaController.updateScore(1);
              }
              catch (e) {
                toast({
                  title: 'Error making move',
                  description: (e as Error).toString(),
                  status: 'error',
                });
              }
            }
            }>Update Score</Button>
            <div id="phaser-example"></div>
        </div>
    );
    // return (
    //   <StyledConnectFourstate aria-label='Connect Four state'>
    //     {state.map((row, rowIndex) => {
    //       return row.map((cell, colIndex) => {
    //         return (
    //           <StyledConnectFourSquare
    //             key={`${rowIndex}.${colIndex}`}
    //             onClick={async () => {
    //               try {
    //                 await gameAreaController.makeMove(colIndex as ConnectFourColIndex);
    //               } catch (e) {
    //                 toast({
    //                   title: 'Error making move',
    //                   description: (e as Error).toString(),
    //                   status: 'error',
    //                 });
    //               }
    //             }}
    //             disabled={!isOurTurn}
    //             backgroundColor={cell}
    //             aria-label={`Cell ${rowIndex},${colIndex} (${
    //               cell || 'Empty'
    //             })`}></StyledConnectFourSquare>
    //         );
    //       });
    //     })}
    //   </StyledConnectFourstate>
    // );
  }
  