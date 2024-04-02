import ConnectFourAreaController, {
  ConnectFourCell,
} from '../../../../classes/interactable/ConnectFourAreaController';
import { Button, chakra, Container, useToast } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { ConnectFourColIndex, PongGameState, PongPlayer, PongScore, XY } from '../../../../types/CoveyTownSocket';
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

const useEventListener = (eventName: any, handler: any, element = window) => {
  const savedHandler = useRef();  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);  useEffect(() => {
    // @ts-ignore comment
    const eventListener = (event: any) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);
    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
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
  const [oppositePaddle, setOppositePaddle] = useState<XY>(gameAreaController.oppositePaddle);
  const [ballPosition, setBallPosition] = useState(gameAreaController.ballPosition);
  const [leftScore, setLeftScore] = useState<PongScore>(gameAreaController.leftScore);
  const [rightScore, setRightScore] = useState<PongScore>(gameAreaController.rightScore);
  const [ourPaddle, setOurPaddle] = useState<XY>({ x: 0, y: 0 });

  const toast = useToast();

  useEffect(() => {
    gameAreaController.addListener('oppositePaddleUpdated', setOppositePaddle);
    gameAreaController.addListener('ballPositionUpdated', setBallPosition);
    gameAreaController.addListener('leftScoreUpdated', setLeftScore);
    gameAreaController.addListener('rightScoreUpdated', setRightScore);
    return () => {
      gameAreaController.removeListener('oppositePaddleUpdated', setOppositePaddle);
      gameAreaController.removeListener('ballPositionUpdated', setBallPosition);
      gameAreaController.removeListener('leftScoreUpdated', setLeftScore);
      gameAreaController.removeListener('rightScoreUpdated', setRightScore);
    };
  }, [gameAreaController]);

  useEffect(() => {
    let updateBall: NodeJS.Timeout | undefined;
    if (gameAreaController.status === 'IN_PROGRESS' && gameAreaController.gamePiece === 'Left') {
      updateBall = setInterval(() => {
        gameAreaController.updatePhysics();
      }, 10);
    }
    return () => clearInterval(updateBall);
  }, [gameAreaController.status]);

  const I_KEYS = ["i", "I"];
  const O_KEYS = ["o", "O"];

  const handler = async ({ key }: {key: any}) => {
    if (I_KEYS.includes(String(key))) {
      console.log("I key pressed!");
      try {
        await gameAreaController.makeMove({x: ourPaddle.x, y: ourPaddle.y - 1});
        setOurPaddle(oldPaddle => ({ x: oldPaddle.x, y: oldPaddle.y - 1 }));
      }
      catch (e) {
        toast({
          title: 'Error making move',
          description: (e as Error).toString(),
          status: 'error',
        });
      }
    }
    else if (O_KEYS.includes(String(key))) {
      console.log("O key pressed!");
      try {
        await gameAreaController.makeMove({x: ourPaddle.x, y: ourPaddle.y + 1});
        setOurPaddle(oldPaddle => ({ x: oldPaddle.x, y: oldPaddle.y + 1 }));
      }
      catch (e) {
        toast({
          title: 'Error making move',
          description: (e as Error).toString(),
          status: 'error',
        });
      }
    }
  };  useEventListener("keydown", handler);

  return (
    <div>
      <h1>pong</h1>
      <h2>Left Score: {leftScore}</h2>
      <h2>Right Score: {rightScore}</h2>
      <h2>Our Paddle Position: {JSON.stringify(ourPaddle)}</h2>
      <h2>Opp Paddle Position: {JSON.stringify(oppositePaddle)}</h2>
      <h2>Ball Position: {JSON.stringify(ballPosition)}</h2>
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
      <div className="gamecontainer">
      <Paddle position={ourPaddle} />
      <Paddle position={oppositePaddle} />
      <Ball position={ballPosition} />
    </div>
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
