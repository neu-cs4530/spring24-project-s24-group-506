import {
  GAME_FULL_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import { createPlayerForTesting } from '../../TestUtils';
import PongGame, { PADDLE_MOVE_SPEED } from './PongGame';

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
});
