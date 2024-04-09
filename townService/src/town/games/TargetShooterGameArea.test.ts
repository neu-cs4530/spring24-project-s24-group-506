import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { createPlayerForTesting } from '../../TestUtils';
import {
  GAME_ID_MISSMATCH_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import TargetShooterGameArea from './TargetShooterGameArea';
import {
  GameInstanceID,
  GameMove,
  TargetShooterGameState,
  TargetShooterMove,
  TownEmitter,
} from '../../types/CoveyTownSocket';
import Game from './Game';
import * as TargetShooterGameModule from './TargetShooterGame';

class TestingGame extends Game<TargetShooterGameState, TargetShooterMove> {
  public applyMove(move: GameMove<TargetShooterMove>): void {}

  protected _join(player: Player): void {
    if (this.state.player1 === null) {
      this.state.player1 = player.id;
    } else if (this.state.player2 === null) {
      this.state.player2 = player.id;
    }
    this._players.push(player);
  }

  protected _leave(player: Player): void {}

  public startGame(player: Player): void {
    if (this.state.player1 === player.id) this.state.player1Ready = true;
    if (this.state.player2 === player.id) this.state.player2Ready = true;
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
      status: 'WAITING_FOR_PLAYERS',
      currentTarget: { x: 100, y: 100 },
      player1Score: 0,
      player2Score: 0,
    });
  }
}

describe('TargetShooterGameArea', () => {
  let gameArea: TargetShooterGameArea;
  let player1: Player;
  let player2: Player;
  let interactableUpdateSpy: jest.SpyInstance;
  const gameConstructorSpy = jest.spyOn(TargetShooterGameModule, 'default');
  let game: TestingGame;

  beforeEach(() => {
    gameConstructorSpy.mockClear();
    game = new TestingGame();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Testing without using the real game class)
    gameConstructorSpy.mockReturnValue(game);

    player1 = createPlayerForTesting();
    player2 = createPlayerForTesting();
    gameArea = new TargetShooterGameArea(
      nanoid(),
      { x: 0, y: 0, width: 100, height: 100 },
      mock<TownEmitter>(),
    );
    gameArea.add(player1);
    game.join(player1);
    gameArea.add(player2);
    game.join(player2);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore (Test requires access to protected method)
    interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
  });

  describe('[T3.1] JoinGame command', () => {
    test('when there is no existing game, it should create a new game and call _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();
      const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(game.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
    });
    test('when there is a game that just ended, it should create a new game and call _emitAreaChanged', () => {
      expect(gameArea.game).toBeUndefined();

      gameConstructorSpy.mockClear();
      const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
      expect(gameArea.game).toBeDefined();
      expect(gameID).toEqual(game.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameConstructorSpy).toHaveBeenCalledTimes(1);
      game.endGame();

      gameConstructorSpy.mockClear();
      const { gameID: newGameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
      expect(gameArea.game).toBeDefined();
      expect(newGameID).toEqual(game.id);
      expect(interactableUpdateSpy).toHaveBeenCalled();
      expect(gameConstructorSpy).toHaveBeenCalledTimes(1);
    });
    describe('when there is a game in progress', () => {
      it('should call join on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);

        const joinSpy = jest.spyOn(game, 'join');
        const gameID2 = gameArea.handleCommand({ type: 'JoinGame' }, player2).gameID;
        expect(joinSpy).toHaveBeenCalledWith(player2);
        expect(gameID).toEqual(gameID2);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, player1);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();

        const joinSpy = jest.spyOn(game, 'join').mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() => gameArea.handleCommand({ type: 'JoinGame' }, player2)).toThrowError(
          'Test Error',
        );
        expect(joinSpy).toHaveBeenCalledWith(player2);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
  });
  describe('[T3.2] StartGame command', () => {
    it('when there is no game, it should throw an error and not call _emitAreaChanged', () => {
      expect(() =>
        gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, player1),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
    });
    describe('when there is a game in progress', () => {
      it('should call startGame on the game and call _emitAreaChanged', () => {
        const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
        interactableUpdateSpy.mockClear();
        gameArea.handleCommand({ type: 'StartGame', gameID }, player2);
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, player1);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        interactableUpdateSpy.mockClear();

        const startSpy = jest.spyOn(game, 'startGame').mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() =>
          gameArea.handleCommand({ type: 'StartGame', gameID: game.id }, player2),
        ).toThrowError('Test Error');
        expect(startSpy).toHaveBeenCalledWith(player2);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
      test('when the game ID mismatches, it should throw an error and not call _emitAreaChanged', () => {
        gameArea.handleCommand({ type: 'JoinGame' }, player1);
        if (!game) {
          throw new Error('Game was not created by the first call to join');
        }
        expect(() =>
          gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, player1),
        ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
      });
    });
  });
  describe('[T3.3] GameMove command', () => {
    it('should throw an error if there is no game in progress and not call _emitAreaChanged', () => {
      interactableUpdateSpy.mockClear();

      expect(() =>
        gameArea.handleCommand(
          {
            type: 'GameMove',
            move: { gamePiece: 'player1', position: { x: 0, y: 0 } },
            gameID: nanoid(),
          },
          player1,
        ),
      ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });
    describe('when there is a game in progress', () => {
      let gameID: GameInstanceID;
      beforeEach(() => {
        gameID = gameArea.handleCommand({ type: 'JoinGame' }, player1).gameID;
        gameArea.handleCommand({ type: 'JoinGame' }, player2);
        interactableUpdateSpy.mockClear();
      });
      it('should throw an error if the gameID does not match the game and not call _emitAreaChanged', () => {
        expect(() =>
          gameArea.handleCommand(
            { type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'Yellow' }, gameID: nanoid() },
            player1,
          ),
        ).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
      });
      it('should call applyMove on the game and call _emitAreaChanged', () => {
        const move: TargetShooterMove = { gamePiece: 'player1', position: { x: 0, y: 0 } };
        const applyMoveSpy = jest.spyOn(game, 'applyMove');
        gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
        expect(applyMoveSpy).toHaveBeenCalledWith({
          gameID: game.id,
          playerID: player1.id,
          move: {
            ...move,
            gamePiece: 'player1',
          },
        });
        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
      });
      it('should not call _emitAreaChanged if the game throws an error', () => {
        const move: TargetShooterMove = { gamePiece: 'player1', position: { x: 0, y: 0 } };
        const applyMoveSpy = jest.spyOn(game, 'applyMove');
        applyMoveSpy.mockImplementationOnce(() => {
          throw new Error('Test Error');
        });
        expect(() =>
          gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1),
        ).toThrowError('Test Error');
        expect(applyMoveSpy).toHaveBeenCalledWith({
          gameID: game.id,
          playerID: player1.id,
          move: {
            ...move,
            gamePiece: 'player1',
          },
        });
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
      });
    });
  });
});
