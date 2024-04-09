import {
  GAME_FULL_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import { createPlayerForTesting } from '../../TestUtils';
import TargetShooterGame from './TargetShooterGame';

describe('TargetShooterGame', () => {
  let game: TargetShooterGame;
  beforeEach(() => {
    game = new TargetShooterGame();
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
  // check targetShooter that player 1 clicked on target and got a point
  it('Should check player1 apply the move and increase score clicking target within given range, and new target is spawned', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    // generate random number within the range of +- 15 of the target position
    const positionX = Math.floor(Math.random() * 31 + 85); // Generate a random number between 85 and 115
    const positionY = Math.floor(Math.random() * 31 + 85); // Generate a random number between 85 and 115

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.currentTarget).toEqual({ x: 100, y: 100 });
    game.applyMove({
      gameID: game.id,
      playerID: player1.id,
      // give the range within 15 of the target position
      move: { gamePiece: 'player1', position: { x: positionX, y: positionY } },
    }); // Updated line
    expect(game.state.player1Score).toEqual(1);
    expect(game.state.currentTarget).not.toEqual({ x: 100, y: 100 });
  });

  // check that player2 clicked on a target and got a point
  it('Should check player2 apply the move and increase score clicking target within given range, and new target is spawned', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    // generate random number within the range of +- 15 of the target position
    const positionX = Math.floor(Math.random() * 31 + 85);
    const positionY = Math.floor(Math.random() * 31 + 85);

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.currentTarget).toEqual({ x: 100, y: 100 });
    game.applyMove({
      gameID: game.id,
      playerID: player2.id,
      // give the range within 15 of the target position
      move: { gamePiece: 'player1', position: { x: positionX, y: positionY } },
    }); // Updated line
    expect(game.state.player2Score).toEqual(1);
    expect(game.state.currentTarget).not.toEqual({ x: 100, y: 100 });
  });

  // check that the game is over after 5 points
  it('Should check the game is over after 5 points player 1', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    // generate random number within the range of +- 15 of the target position
    const positionX = Math.floor(Math.random() * 31 + 85);
    const positionY = Math.floor(Math.random() * 31 + 85);

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.currentTarget).toEqual({ x: 100, y: 100 });
    // move 1
    game.applyMove({
      gameID: game.id,
      playerID: player1.id,
      // give the range within 15 of the target position
      move: { gamePiece: 'player1', position: { x: positionX, y: positionY } },
    });
    expect(game.state.player1Score).toEqual(1);
    expect(game.state.player2Score).toEqual(0);
    expect(game.state.currentTarget).not.toEqual({ x: 100, y: 100 });
    // move 2
    game.applyMove({
      gameID: game.id,
      playerID: player1.id,
      move: {
        gamePiece: 'player1',
        position: { x: game.state.currentTarget.x, y: game.state.currentTarget.y },
      },
    });
    expect(game.state.player1Score).toEqual(2);
    expect(game.state.player2Score).toEqual(0);
    // move 3
    game.applyMove({
      gameID: game.id,
      playerID: player1.id,
      move: {
        gamePiece: 'player1',
        position: { x: game.state.currentTarget.x, y: game.state.currentTarget.y },
      },
    });
    expect(game.state.player1Score).toEqual(3);
    expect(game.state.player2Score).toEqual(0);
    // move 4
    game.applyMove({
      gameID: game.id,
      playerID: player1.id,
      move: {
        gamePiece: 'player1',
        position: { x: game.state.currentTarget.x, y: game.state.currentTarget.y },
      },
    });
    expect(game.state.player1Score).toEqual(4);
    expect(game.state.player2Score).toEqual(0);
    // move 5
    game.applyMove({
      gameID: game.id,
      playerID: player1.id,
      move: {
        gamePiece: 'player1',
        position: { x: game.state.currentTarget.x, y: game.state.currentTarget.y },
      },
    });
    expect(game.state.player1Score).toEqual(5);
    expect(game.state.player2Score).toEqual(0);
    expect(game.state.status).toEqual('OVER');
    expect(game.state.winner).toEqual(player1.id);
  });

  it('Should check the game is over after 5 points, player 2', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    // generate random number within the range of +- 15 of the target position
    const positionX = Math.floor(Math.random() * 31 + 85);
    const positionY = Math.floor(Math.random() * 31 + 85);

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.currentTarget).toEqual({ x: 100, y: 100 });
    // move 1
    game.applyMove({
      gameID: game.id,
      playerID: player2.id,
      // give the range within 15 of the target position
      move: { gamePiece: 'player2', position: { x: positionX, y: positionY } },
    });
    expect(game.state.player2Score).toEqual(1);
    expect(game.state.currentTarget).not.toEqual({ x: 100, y: 100 });
    // move 2
    game.applyMove({
      gameID: game.id,
      playerID: player2.id,
      move: {
        gamePiece: 'player2',
        position: { x: game.state.currentTarget.x, y: game.state.currentTarget.y },
      },
    });
    expect(game.state.player2Score).toEqual(2);
    // move 3
    game.applyMove({
      gameID: game.id,
      playerID: player2.id,
      move: {
        gamePiece: 'player2',
        position: { x: game.state.currentTarget.x, y: game.state.currentTarget.y },
      },
    });
    expect(game.state.player2Score).toEqual(3);
    // move 4
    game.applyMove({
      gameID: game.id,
      playerID: player2.id,
      move: {
        gamePiece: 'player2',
        position: { x: game.state.currentTarget.x, y: game.state.currentTarget.y },
      },
    });
    expect(game.state.player2Score).toEqual(4);
    // move 5
    game.applyMove({
      gameID: game.id,
      playerID: player2.id,
      move: {
        gamePiece: 'player2',
        position: { x: game.state.currentTarget.x, y: game.state.currentTarget.y },
      },
    });
    expect(game.state.player2Score).toEqual(5);
    expect(game.state.status).toEqual('OVER');
    expect(game.state.winner).toEqual(player2.id);
  });

  // check that when someone clicks anywhere besides the target nothing happens
  it('Should check player1 apply the move and not increase score clicking target outside given range', () => {
    const player1 = createPlayerForTesting();
    const player2 = createPlayerForTesting();

    game.join(player1);
    game.join(player2);
    game.startGame(player1);
    game.startGame(player2);
    expect(game.state.currentTarget).toEqual({ x: 100, y: 100 });
    game.applyMove({
      gameID: game.id,
      playerID: player1.id,
      // give the range within 15 of the target position
      move: { gamePiece: 'player1', position: { x: 50, y: 50 } },
    });
    expect(game.state.player1Score).toEqual(0);
    expect(game.state.currentTarget).toEqual({ x: 100, y: 100 });
  });
});
