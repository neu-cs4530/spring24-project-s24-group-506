import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import PongGameArea from './PongGameArea';
import {
  GameInstanceID,
  GameMove,
  PongGameState,
  PongMove,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import Game from './Game';
import * as PongGameModule from './PongGame';

class TestingGame extends Game<PongGameState, PongMove> {
  public applyMove(move: GameMove<PongMove>): void {}

  protected _join(player: Player): void {
    if (this.state.leftPlayer === null) {
      this.state.leftPlayer = player.id;
    } else if (this.state.rightPlayer === null) {
      this.state.rightPlayer = player.id;
    }
    this._players.push(player);
  }

  protected _leave(player: Player): void {}

  public startGame(player: Player): void {
    if (this.state.leftPlayer === player.id) this.state.leftPlayerReady = true;
    if (this.state.rightPlayer === player.id) this.state.rightPlayerReady = true;
  }

  public endGame(winner?: string) {
    this.state = {
      ...this.state,
      status: 'OVER',
      winner,
    };
  }

  public constructor() {
    super({
      status: 'WAITING_TO_START', // Add the 'status' property with a value of 'InProgress'
      leftPaddle: { x: 0, y: 0 },
      leftPaddleDirection: 'Still',
      rightPaddle: { x: 0, y: 0 },
      rightPaddleDirection: 'Still',

      leftScore: 0,
      rightScore: 0,

      ballPosition: { x: 0, y: 0 },
      ballVelocity: { x: 0, y: 0 },
    });
  }
}

describe('PongGameArea', () => {
  let gameArea: PongGameArea;
  let left: Player;
  let right: Player;
  let interactableUpdateSpy: jest.SpyInstance;
  const gameConstructorSpy = jest.spyOn(PongGameModule, 'default');
  let game: TestingGame;

  beforeEach(() => {
    gameConstructorSpy.mockClear();
    game = new TestingGame();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    gameConstructorSpy.mockReturnValue(game);

    left = createPlayerForTesting();
    right = createPlayerForTesting();
    gameArea = new PongGameArea(
      nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
    );
    gameArea.add(left);
    game.join(left);
    gameArea.add(right);
    game.join(right);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Test requires access to protected method)
    interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
  });

  describe('[T3.1] JoinGame command', () => {
    test('when there is no existing game, it should create a new game and call _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();
      const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, left);
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(game.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
    test('when there is a game that just ended, it should create a new game and call _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();

      gameConstructorSpy.mockClear();
      const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, left);
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(game.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameConstructorSpy).toHaveBeenCalledTimes(1);
      game.endGame();

      gameConstructorSpy.mockClear();
      const { gameID: newGameID } = gameArea.handleCommand({ type: 'JoinGame' }, left);
      expect(gameArea.game).toBeDefined();
      expect(newGameID).toEqual(game.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameConstructorSpy).toHaveBeenCalledTimes(1);
    });
    describe('when there is a game in progress', () => {
      it('should call join on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, left);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);

        const joinSpy = jest.spyOn(game, 'join');
        const gameID2 = gameArea.handleCommand({ type: 'JoinGame' }, right).gameID;
        expect(joinSpy).toHaveBeenCalledWith(right);
        expect(gameID).toEqual(gameID2);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, left);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();

        const joinSpy = jest.spyOn(game, 'join').mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() => gameArea.handleCommand({ type: 'JoinGame' }, right)).toThrowError(
          'Test Error',
        );
        expect(joinSpy).toHaveBeenCalledWith(right);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
  });
  describe('[T3.2] StartGame command', () => {
    it('when there is no game, it should throw an error and not call _emitAreaChanged', () => {
      expect(() =>
        gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, left),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
    });
    describe('when there is a game in progress', () => {
      it('should call startGame on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, left);
        interactableUpdateSpy.mockClear();
        gameArea.handleCommand({ type: 'StartGame', gameID }, right);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, left);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();

        const startSpy = jest.spyOn(game, 'startGame').mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() =>
          gameArea.handleCommand({ type: 'StartGame', gameID: game.id }, right),
        ).toThrowError('Test Error');
        expect(startSpy).toHaveBeenCalledWith(right);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
      test('when the game ID mismatches, it should throw an error and not call _emitAreaChanged', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, left);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(() =>
          gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, left),
        ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
      });
    });
  });
  describe('[T3.3] GameMove command', () => {
    it('should throw an error if there is no game in progress and not call _emitAreaChanged', () => {
      interactableUpdateSpy.mockClear();

      expect(() =>
        gameArea.handleCommand(
          { type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'X' }, gameID: nanoid() },
          left,
        ),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });
    describe('when there is a game in progress', () => {
      let gameID: GameInstanceID;
      beforeEach(() => {
        gameID = gameArea.handleCommand({ type: 'JoinGame' }, left).gameID;
        gameArea.handleCommand({ type: 'JoinGame' }, right);
        interactableUpdateSpy.mockClear();
      });
      it('should throw an error if the gameID does not match the game and not call _emitAreaChanged', () => {
        expect(() =>
          gameArea.handleCommand(
            { type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'Yellow' }, gameID: nanoid() },
            left,
          ),
        ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
      });
      it('should call applyMove on the game and call _emitAreaChanged', () => {
        const move: PongMove = { direction: 'Up', gamePiece: 'Left' };
        const applyMoveSpy = jest.spyOn(game, 'applyMove');
        gameArea.handleCommand({ type: 'GameMove', move, gameID }, left);
        expect(applyMoveSpy).toHaveBeenCalledWith({
          gameID: game.id,
          playerID: left.id,
          move: {
            ...move,
            gamePiece: 'Left',
          },
        });
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        const move: PongMove = { direction: 'Up', gamePiece: 'Left' };
        const applyMoveSpy = jest.spyOn(game, 'applyMove');
        applyMoveSpy.mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() => gameArea.handleCommand({ type: 'GameMove', move, gameID }, left)).toThrowError(
          'Test Error',
        );
        expect(applyMoveSpy).toHaveBeenCalledWith({
          gameID: game.id,
          playerID: left.id,
          move: {
            ...move,
            gamePiece: 'Left',
          },
        });
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
  });
});
