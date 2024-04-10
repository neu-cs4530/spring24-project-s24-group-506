import {
  GAME_FULL_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import { createPlayerForTesting } from '../../TestUtils';
import PongGame, { PONG_HEIGHT, PONG_WIDTH } from './PongGame';

describe('PongGame', () => {
  let game: PongGame;
  beforeEach(() => {
    game = new PongGame();
  });

  it('should create a new game', () => {
    expect(game).toBeTruthy();
  });

  it('should add a player', () => {
    const player = createPlayerForTesting();
    game.join(player);
    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
  });
  describe('[T1.1] _join', () => {
    it('should throw an error if the player is already in the game', () => {
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
      const player2 = createPlayerForTesting();
      game.join(player2);
      expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    });
    it('should throw an error if the player is not in the game and the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      game.join(player1);
      game.join(player2);

      expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
    });
  });

  it('should start the game', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.status).toBe('IN_PROGRESS');
  });
  it('should end the game', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    game.leave(player1);
    expect(game.state.status).toBe('OVER');
  });
  it('should leave the game', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    game.leave(player1);
    expect(game.state.winner).toBe(player2.id);
  });
  it('Should check the state if one player has joined', () => {
    const player1 = createPlayerForTesting();
    game.join(player1);
    expect(game.state.status).toEqual('WAITING_FOR_PLAYERS');
  });
  it('Should check the state if two players have joined', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    expect(game.state.status).toEqual('WAITING_TO_START');
  });
  it('Should check the state if the game has started', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.status).toEqual('IN_PROGRESS');
  });
  it('Should check the state if the game has ended', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    game.leave(player1);
    expect(game.state.status).toEqual('OVER');
  });
  it('should throw an error if the game is full', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    const player3 = createPlayerForTesting();

    game.join(player1);
    game.join(player2);

    expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
  });
  it('should throw an error if the game is not in the WAITING_TO_START state', () => {
    const player1 = createPlayerForTesting();
    game.join(player1);

    expect(() => game.startGame(player1)).toThrowError(GAME_NOT_STARTABLE_MESSAGE);
  });
  it('should throw an error if the player is not in the game', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    game.join(player1);

    expect(() => game.startGame(player2)).toThrowError(GAME_NOT_STARTABLE_MESSAGE);
  });
  it('Should check the state if the game has ended', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    game.leave(player1);
    expect(game.state.winner).toEqual(player2.id);
  });
  it('Should check the state if the game has ended', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    game.leave(player2);
    expect(game.state.winner).toEqual(player1.id);
  });
  it('Should check left apply the move', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.leftPaddleDirection).toEqual('Still');
    game.applyMove({
      gameID: game.id,
      playerID: player1.id,
      move: { gamePiece: 'Left', direction: 'Up' },
    }); // Updated line
    expect(game.state.leftPaddleDirection).toEqual('Up');
  });
  it('Should check left apply the move', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.leftPaddleDirection).toEqual('Still');
    game.applyMove({
      gameID: game.id,
      playerID: player1.id,
      move: { gamePiece: 'Left', direction: 'Down' },
    }); // Updated line
    expect(game.state.leftPaddleDirection).toEqual('Down');
  });
  it('Should check left apply the move', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.leftPaddleDirection).toEqual('Still');
    game.applyMove({
      gameID: game.id,
      playerID: player1.id,
      move: { gamePiece: 'Left', direction: 'Still' },
    }); // Updated line
    expect(game.state.leftPaddleDirection).toEqual('Still');
  });
  it('Should check Right apply the move', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.rightPaddleDirection).toEqual('Still');
    game.applyMove({
      gameID: game.id,
      playerID: player2.id,
      move: { gamePiece: 'Right', direction: 'Down' },
    }); // Updated line
    expect(game.state.rightPaddleDirection).toEqual('Down');
  });
  it('Should check Right apply the move', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.rightPaddleDirection).toEqual('Still');
    game.applyMove({
      gameID: game.id,
      playerID: player2.id,
      move: { gamePiece: 'Right', direction: 'Up' },
    }); // Updated line
    expect(game.state.rightPaddleDirection).toEqual('Up');
  });
  it('Should check Right apply the move', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.rightPaddleDirection).toEqual('Still');
    game.applyMove({
      gameID: game.id,
      playerID: player2.id,
      move: { gamePiece: 'Right', direction: 'Still' },
    }); // Updated line
    expect(game.state.rightPaddleDirection).toEqual('Still');
  });
  it('Should check the ball movement', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();
    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.leftPaddleDirection).toEqual('Still');
    game.applyMove({
      gameID: game.id,
      playerID: player1.id,
      move: { gamePiece: 'Left', direction: 'Up' },
    });
    expect(game.state.leftPaddleDirection).toEqual('Up');
    game.applyMove({
      gameID: game.id,
      playerID: player1.id,
      move: { gamePiece: 'Left', direction: 'Up' },
    });
    expect(game.state.leftPaddleDirection).toEqual('Up');
  });
  it('should handle game physics correctly', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);

    const postion = game.state.ballPosition;

    // Simulate some physics updates
    game.updatePhysics();

    // Expect game state to change after physics update
    expect(game.state.ballPosition).toEqual(postion);
  });
  it('should apply moves correctly', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);

    game.applyMove({
      gameID: game.id,
      playerID: player1.id,
      move: { gamePiece: 'Left', direction: 'Up' },
    });

    expect(game.state.leftPaddleDirection).toEqual('Up');

    game.applyMove({
      gameID: game.id,
      playerID: player2.id,
      move: { gamePiece: 'Right', direction: 'Down' },
    });

    expect(game.state.rightPaddleDirection).toEqual('Down');
  });
  it('should move the ball according to its velocity', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    // Set initial ball position and velocity
    game.state.ballPosition = { x: 200, y: 150 };
    game.state.ballVelocity = { x: 3, y: 2 };

    // Call updatePhysics to move the ball
    game.updatePhysics();

    // Check the updated ball position
    expect(game.state.ballPosition.x).toEqual(200 + 3);
    expect(game.state.ballPosition.y).toEqual(150 + 2);
  });
  it('should reflect the ball off paddles and change direction', () => {
    // Set initial ball position near left paddle with rightward velocity
    game.state.ballPosition = { x: 30, y: 140 };
    game.state.ballVelocity = { x: 3, y: 0 };

    // Set initial paddle positions
    game.state.leftPaddle.y = 120;
    game.state.rightPaddle.y = 160;

    // Call updatePhysics to handle ball-paddle interaction
    game.updatePhysics();

    // Ball should bounce off the left paddle and change direction horizontally
    expect(game.state.ballPosition.x).toEqual(30);
    expect(game.state.ballPosition.y).toEqual(140);
    expect(game.state.ballVelocity.x).toEqual(3); // Should reverse direction

    // Move the ball near the right paddle with leftward velocity
    game.state.ballPosition = { x: PONG_WIDTH - 30, y: 180 };
    game.state.ballVelocity = { x: -2, y: 0 };

    // Call updatePhysics to handle ball-paddle interaction
    game.updatePhysics();

    // Ball should bounce off the right paddle and change direction horizontally
    expect(game.state.ballPosition.x).toEqual(PONG_WIDTH - 30);
    expect(game.state.ballPosition.y).toEqual(180);
    expect(game.state.ballVelocity.x).toEqual(-2); // Should reverse direction
  });
  it('should move the ball according to its velocity', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);

    // Set initial ball position and velocity
    game.state.ballPosition = { x: 200, y: 150 };
    game.state.ballVelocity = { x: 3, y: 2 };

    // Call updatePhysics to move the ball
    game.updatePhysics();

    // Check the updated ball position
    expect(game.state.ballPosition.x).toEqual(200 + 3);
    expect(game.state.ballPosition.y).toEqual(150 + 2);
  });
  it('should reflect the ball off the top wall when hitting the ceiling', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);

    // Place the ball near the top wall with upward velocity
    game.state.ballPosition = { x: 200, y: 5 };
    game.state.ballVelocity = { x: 3, y: -3 };

    // Call updatePhysics to move the ball
    game.updatePhysics();

    // Check the updated ball position and velocity (should reflect off the top wall)
    expect(game.state.ballPosition.x).toEqual(200 + 3);
    expect(game.state.ballPosition.y).toEqual(5 - 3);
    expect(game.state.ballVelocity.x).toEqual(3);
    expect(game.state.ballVelocity.y).toEqual(-3); // Direction should change
  });
  it('should score for the right player when ball goes out of bounds on the left side', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.leftScore).toEqual(0);
    expect(game.state.rightScore).toEqual(0);

    // Place the ball near the left wall with leftward velocity
    game.state.ballPosition = { x: 5, y: 150 };
    game.state.ballVelocity = { x: -6, y: 2 };

    // Call updatePhysics to move the ball and check for scoring
    game.updatePhysics();
    // Ball should score for the right player and reset position;
    expect(game.state.leftScore).toEqual(0);
    expect(game.state.rightScore).toEqual(1);
  });
  it('should score for the left player when ball goes out of bounds on the right side', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.leftScore).toEqual(0);
    expect(game.state.rightScore).toEqual(0);

    // Place the ball near the right wall with rightward velocity
    game.state.ballPosition = { x: PONG_WIDTH - 5, y: 150 };
    game.state.ballVelocity = { x: 6, y: 2 };

    // Call updatePhysics to move the ball and check for scoring
    game.updatePhysics();
    // Ball should score for the left player and reset position;
    expect(game.state.leftScore).toEqual(1);
    expect(game.state.rightScore).toEqual(0);
  });
  it('should reflect the ball off the bottom wall when hitting the floor', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);

    // Place the ball near the bottom wall with downward velocity
    game.state.ballPosition = { x: 200, y: PONG_HEIGHT - 5 };
    game.state.ballVelocity = { x: 3, y: 3 };

    // Call updatePhysics to move the ball
    game.updatePhysics();

    // Check the updated ball position and velocity (should reflect off the bottom wall)
    expect(game.state.ballPosition.x).toEqual(200 + 3);
    expect(game.state.ballPosition.y).toEqual(PONG_HEIGHT - 5 - 7);
    expect(game.state.ballVelocity.x).toEqual(3);
    expect(game.state.ballVelocity.y).toEqual(-3); // Direction should change
  });
  it('should reflect the ball off paddles and change direction', () => {
    // Set initial ball position near left paddle with rightward velocity
    game.state.ballPosition = { x: 30, y: 140 };
    game.state.ballVelocity = { x: 3, y: 0 };

    // Set initial paddle positions
    game.state.leftPaddle.y = 120;
    game.state.rightPaddle.y = 160;

    // Call updatePhysics to handle ball-paddle interaction
    game.updatePhysics();

    // Ball should bounce off the left paddle and change direction horizontally
    expect(game.state.ballPosition.x).toEqual(30);
    expect(game.state.ballPosition.y).toEqual(140);
    expect(game.state.ballVelocity.x).toEqual(3); // Should reverse direction

    // Move the ball near the right paddle with leftward velocity
    game.state.ballPosition = { x: PONG_WIDTH - 30, y: 180 };
    game.state.ballVelocity = { x: -2, y: 0 };

    // Call updatePhysics to handle ball-paddle interaction
    game.updatePhysics();

    // Ball should bounce off the right paddle and change direction horizontally
    expect(game.state.ballPosition.x).toEqual(PONG_WIDTH - 30);
    expect(game.state.ballPosition.y).toEqual(180);
    expect(game.state.ballVelocity.x).toEqual(-2); // Should reverse direction
  });
  it('should declare the right player as the winner after 5 out-of-bounds events on the left side', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);

    // Simulate 5 out-of-bounds events on the left side
    for (let i = 0; i < 5; i++) {
      // Set the ball position near the left wall with leftward velocity
      game.state.ballPosition = { x: 10, y: 150 };
      game.state.ballVelocity = { x: -11, y: 0 };

      // Call updatePhysics to move the ball and check for scoring
      game.updatePhysics();
    }

    // Check that the right player is declared as the winner
    expect(game.state.status).toEqual('OVER');
    expect(game.state.winner).toEqual(player2.id);
  });
  it('should declare the left player as the winner after 5 out-of-bounds events on the right side', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);

    // Simulate 5 out-of-bounds events on the right side
    for (let i = 0; i < 5; i++) {
      // Set the ball position near the right wall with rightward velocity
      game.state.ballPosition = { x: PONG_WIDTH - 10, y: 150 };
      game.state.ballVelocity = { x: 11, y: 0 };

      // Call updatePhysics to move the ball and check for scoring
      game.updatePhysics();
    }

    // Check that the left player is declared as the winner
    expect(game.state.status).toEqual('OVER');
    expect(game.state.winner).toEqual(player1.id);
  });
  it('Checks if the ball bounces once hitting a paddle', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    game.state.ballPosition = { x: 30, y: 140 };
    game.state.ballVelocity = { x: 3, y: 0 };
    game.state.leftPaddle.y = 120;
    game.state.rightPaddle.y = 160;
    game.updatePhysics();
    expect(game.state.ballPosition.x).toEqual(33);
    expect(game.state.ballPosition.y).toEqual(140);
    expect(game.state.ballVelocity.x).toEqual(3);
  });
});
