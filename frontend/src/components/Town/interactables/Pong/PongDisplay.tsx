import ConnectFourAreaController, {
  ConnectFourCell,
} from '../../../../classes/interactable/ConnectFourAreaController';
import { Button, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { ConnectFourColIndex, PongGameState, PongPlayer, PongScore, XY } from '../../../../types/CoveyTownSocket';
import PongAreaController from '../../../../classes/interactable/PongAreaController';
import { PongGame } from '../../../../classes/PongGame';
import { set } from 'lodash';

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
  const [oppositeScore, setOppositeScore] = useState<PongScore>(gameAreaController.oppositeScore);
  const [oppositePaddle, setOppositePaddle] = useState<XY>(gameAreaController.oppositePaddle);
  const [ourScore, setOurScore] = useState<PongScore>(0);
  const [ourPaddle, setOurPaddle] = useState<XY>({ x: 0, y: 0 });
  //const [ballPosition, setBallPosition] = useState<XY>(gameAreaController.ballPosition);

  const toast = useToast();

  useEffect(() => {
    gameAreaController.addListener('oppositeScoreUpdated', setOppositeScore);
    gameAreaController.addListener('oppositePaddleUpdated', setOppositePaddle);
    //gameAreaController.addListener('ballPositionUpdated', setBallPosition);
    return () => {
      gameAreaController.removeListener('oppositeScoreUpdated', setOppositeScore);
      gameAreaController.removeListener('oppositePaddleUpdated', setOppositePaddle);
      //gameAreaController.removeListener('ballPositionUpdated', setBallPosition);
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
    ball: any;
    player1: any;
    player2: any;
    keys: { [key: string]: any };
    p1ScoreText: any;
    p2ScoreText: any;
    p1VictoryText: any;
    p2VictoryText: any;
    gameInitialized: boolean;
    winningScore: number;
    side: PongPlayer;

    initializeGame(direction = 1) {
      this.ball.setPosition(this.physics.world.bounds.width / 2, this.physics.world.bounds.height / 2);
      this.ball.setVelocity(125 * direction, 150);
      this.gameInitialized = true;
    }

    constructor() {
      super('playingScene');
      this.ball = null;
      this.player1 = null;
      this.player2 = null;
      this.keys = {};
      this.p1ScoreText = null;
      this.p2ScoreText = null;
      this.p1VictoryText = null;
      this.p2VictoryText = null;
      this.winningScore = 5;
      this.gameInitialized = false;
      console.log('constructor');
      this.side = 'Left'
    }

    preload() {
      this.load.image('ball', '/assets/pong_images/ball.png');
      this.load.image('paddle', '/assets/pong_images/paddle.png');
      console.log('preload');
    }

    createBall() {
      this.ball = this.physics.add.sprite(
        this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height / 2,
        'ball',
      );
      this.ball.setCollideWorldBounds(true);
      this.ball.setBounce(1, 1);
    }

    createPlayer1(x: number, y: number) {
      this.player1 = this.physics.add.sprite(x, y, 'paddle');
      this.player1.setCollideWorldBounds(true);
      this.player1.setBounce(1, 1);
      this.player1.setImmovable(true);
    }

    createPlayer2(x: number, y: number) {
      this.player2 = this.physics.add.sprite(x, y, 'paddle');
      this.player2.setCollideWorldBounds(true);
      this.player2.setBounce(1, 1);
      this.player2.setImmovable(true);
    }

    addKeyboardInput() {
      if (this.input.keyboard) {
        this.keys.i = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
        this.keys.o = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.O);
      }
    }

    initializeVictoryText() {
      this.p1VictoryText = this.add.text(
        this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height / 2,
        'Player 1 wins!',
        { fontSize: '16px', },
      );
      this.p2VictoryText = this.add.text(
        this.physics.world.bounds.width / 2,
        this.physics.world.bounds.height / 2,
        'Player 2 wins!',
        { fontSize: '16px', },
      );
      this.p1VictoryText.setOrigin(0.5, 0.5);
      this.p2VictoryText.setOrigin(0.5, 0.5);
      this.p1VictoryText.setVisible(false);
      this.p2VictoryText.setVisible(false);
    }

    ballCollision(ball: any, player: any) {
      ball.setVelocityX(ball.body.velocity.x + 25 * (ball.body.velocity.x > 0 ? 1 : -1));
    }

    async create() {
      this.side = gameAreaController.gamePiece;
      console.log(this.side);
      this.createBall();

      this.createPlayer1(this.ball.body.width / 2 + 1, this.physics.world.bounds.height / 2);
      this.createPlayer2(
        this.physics.world.bounds.width - (this.ball.body.width / 2 + 1),
        this.physics.world.bounds.height / 2,
      );
      if (this.side === 'Left') {
        setOurPaddle({ x: this.player1.body.x, y: this.player1.body.y });
        try {
          await gameAreaController.makeMove({ x: this.player1.body.x, y: this.player1.body.y });
        }
        catch (e) {
          toast({
            title: 'Error making move',
            description: (e as Error).toString(),
            status: 'error',
          });
        }
      } else {
        setOurPaddle({ x: this.player2.body.x, y: this.player2.body.y });
        try {
          await gameAreaController.makeMove({ x: this.player2.body.x, y: this.player2.body.y });
        }
        catch (e) {
          toast({
            title: 'Error making move',
            description: (e as Error).toString(),
            status: 'error',
          });
        }
      }
      if (this.side === 'Left') {
        this.player2.setPosition(oppositePaddle.x, oppositePaddle.y);
      } else {
        this.player1.setPosition(oppositePaddle.x, oppositePaddle.y);
      }

      this.physics.add.collider(this.ball, this.player1, this.ballCollision);
      this.physics.add.collider(this.ball, this.player2, this.ballCollision);

      this.addKeyboardInput();

      this.initializeVictoryText();

      this.p1ScoreText = this.add.text(0, 16, 'Player 1: 0', { fontSize: '16px' });
      this.p2ScoreText = this.add.text(this.physics.world.bounds.width, 16, 'Player 2: 0', {
        fontSize: '16px',
      });
      this.p2ScoreText.setOrigin(1, 0);

      this.initializeGame();
      console.log('create');
    }

    async update(time: number, delta: number) {
      if (gameAreaController.status === 'WAITING_TO_START' || gameAreaController.status === 'WAITING_FOR_PLAYERS') {
        this.scene.start('startingScene');
      } else if (gameAreaController.status === 'IN_PROGRESS') {
        if (this.side === 'Left') {
          this.p1ScoreText.setText(`Player 1: ${ourScore}`);
          this.p2ScoreText.setText(`Player 2: ${oppositeScore}`);
        }
        

        if (ourScore >= 5) {
          this.side === 'Left' ? this.endScene(1) : this.endScene(2);
        } else if (oppositeScore >= 5) {
          this.side === 'Left' ? this.endScene(2) : this.endScene(1);
        } else {
          if (this.ball.body.x < this.player1.body.x) {
            if (this.side === 'Right') {
              setOurScore(ourScore + 1 as PongScore);
              try {
                await gameAreaController.updateScore(ourScore as PongScore);
              }
              catch (e) {
                toast({
                  title: 'Error updating score',
                  description: (e as Error).toString(),
                  status: 'error',
                });
              }
            }
              this.initializeGame(1);
              return;
            } else if (this.ball.body.x > this.player2.body.x) {
              if (this.side === 'Left') {
                setOurScore(ourScore + 1 as PongScore);
                try {
                  await gameAreaController.updateScore(ourScore as PongScore);
                }
                catch (e) {
                  toast({
                    title: 'Error updating score',
                    description: (e as Error).toString(),
                    status: 'error',
                  });
                }
              }
              this.initializeGame(-1);
              return;
            }

            if (this.keys.i.isDown) {
              this.side === 'Left' ? this.player1.setVelocityY(-300) : this.player2.setVelocityY(-300);
              this.player1.setVelocityY(-300);
            } else if (this.keys.o.isDown) {
              this.side === 'Left' ? this.player1.setVelocityY(300) : this.player2.setVelocityY(300);
            } else {
              this.side === 'Left' ? this.player1.setVelocityY(0) : this.player2.setVelocityY(0);
            }

            if (this.side === 'Left') {
              setOurPaddle({ x: this.player1.body.x, y: this.player1.body.y });
              try {
                await gameAreaController.makeMove({ x: this.player1.body.x, y: this.player1.body.y });
              }
              catch (e) {
                toast({
                  title: 'Error making move',
                  description: (e as Error).toString(),
                  status: 'error',
                });
              }
            } else {
              setOurPaddle({ x: this.player2.body.x, y: this.player2.body.y });
              try {
                await gameAreaController.makeMove({ x: this.player2.body.x, y: this.player2.body.y });
              }
              catch (e) {
                toast({
                  title: 'Error making move',
                  description: (e as Error).toString(),
                  status: 'error',
                });
              }           
            }
            if (this.side === 'Left') {
              this.player2.setPosition(oppositePaddle.x, oppositePaddle.y);
            } else {
              this.player1.setPosition(oppositePaddle.x, oppositePaddle.y);
            }

            // if (this.side === 'Left') {
            //   try {
            //     await gameAreaController.moveBall({ x: this.ball.body.x, y: this.ball.body.y });
            //   }
            //   catch (e) {
            //     toast({
            //       title: 'Error moving ball',
            //       description: (e as Error).toString(),
            //       status: 'error',
            //     });
            //   }
            // } else {
            //   this.ball.setPosition(ballPosition.x, ballPosition.y);
            // }
          }
        }
      }

    endScene(winner: 1 | 2) {
      this.ball.setVelocity(0, 0);
      this.ball.setVisible(false);
      this.player1.setVelocity(0, 0);
      this.player2.setVelocity(0, 0);
      if (winner === 1) {
        this.p1VictoryText.setVisible(true);
      } else {
        this.p2VictoryText.setVisible(true);
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
      <h2>Our Score: {ourScore}</h2>
      <h2>Opposite Score: {oppositeScore}</h2>
      <h2>Our Paddle Position: {JSON.stringify(ourPaddle)}</h2>
      <h2>Opp Paddle Position: {JSON.stringify(oppositePaddle)}</h2>
      <Button onClick={async () => {
        try {
          await gameAreaController.makeMove({ x: 0, y: 0 });
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
          await gameAreaController.updateScore(oppositeScore + 1 as PongScore);
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
