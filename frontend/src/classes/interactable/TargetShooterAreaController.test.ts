import { mock } from 'jest-mock-extended';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import { nanoid } from 'nanoid';
import assert from 'assert';
import TargetShooterAreaController from './TargetShooterAreaController';
import {
  GameArea,
  GameResult,
  GameStatus,
  TargetShooterGameState,
} from '../../types/CoveyTownSocket';
import GameAreaController, { NO_GAME_IN_PROGRESS_ERROR } from './GameAreaController';

describe('[T1] TargetShooterAreaController', () => {
  const ourPlayer = new PlayerController(nanoid(), nanoid(), {
    x: 0,
    y: 0,
    moving: false,
    rotation: 'front',
  });
  const otherPlayers = [
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
    new PlayerController(nanoid(), nanoid(), { x: 0, y: 0, moving: false, rotation: 'front' }),
  ];

  const mockTownController = mock<TownController>();
  Object.defineProperty(mockTownController, 'ourPlayer', {
    get: () => ourPlayer,
  });
  Object.defineProperty(mockTownController, 'players', {
    get: () => [ourPlayer, ...otherPlayers],
  });
  mockTownController.getPlayer.mockImplementation(playerID => {
    const p = mockTownController.players.find(player => player.id === playerID);
    assert(p);
    return p;
  });

  function targetShooterAreaControllerWithProp({
    _id,
    history,
    player1,
    player2,
    undefinedGame,
    status,
    winner,
  }: {
    _id?: string;
    history?: GameResult[];
    player1?: string;
    player2?: string;
    undefinedGame?: boolean;
    status?: GameStatus;
    winner?: string;
  }) {
    const id = _id || nanoid();
    const players = [];
    if (player1) players.push(player1);
    if (player2) players.push(player2);
    const ret = new TargetShooterAreaController(
      id,
      {
        id,
        occupants: players,
        history: history || [],
        type: 'TargetShooterArea',
        game: undefinedGame
          ? undefined
          : {
              id,
              players: players,
              state: {
                status: status || 'WAITING_FOR_PLAYERS',
                player1,
                player2,
                player1Score: 0,
                player2Score: 0,
                currentTarget: { x: 0, y: 0 },
                difficulty: 'Easy',
                targetSize: 1,
                player1Accuracy: { hits: 0, shots: 0 },
                player2Accuracy: { hits: 0, shots: 0 },
                winner,
              },
            },
      },
      mockTownController,
    );
    if (players) {
      ret.occupants = players
        .map(eachID => mockTownController.players.find(eachPlayer => eachPlayer.id === eachID))
        .filter(eachPlayer => eachPlayer) as PlayerController[];
    }
    return ret;
  }
  describe('[T1.1]', () => {
    describe('isActive', () => {
      it('should return true if the game is in progress and there is a player in the area', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          status: 'IN_PROGRESS',
        });
        expect(targetShooterAreaController.isActive()).toBe(true);
      });
      it('should return false if the game is not in progress or if there are no players in the area', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          status: 'WAITING_FOR_PLAYERS',
        });
        expect(targetShooterAreaController.isActive()).toBe(false);
        const targetShooterAreaController2 = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(targetShooterAreaController2.isActive()).toBe(false);
      });
    });
    describe('isPlayer', () => {
      it('should return true if the current player is in the game', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          player1: ourPlayer.id,
        });
        expect(targetShooterAreaController.isPlayer).toBe(true);
      });
      it('should return false if the current player is not in the game', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({});
        expect(targetShooterAreaController.isPlayer).toBe(false);
      });
    });
    describe('gamePiece', () => {
      it('should return the game piece of the current player', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
        });
        expect(targetShooterAreaController.gamePiece).toBe('player1');

        const targetShooterAreaController2 = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player2: ourPlayer.id,
        });
        expect(targetShooterAreaController2.gamePiece).toBe('player2');
      });
      it('should throw an error if the current player is not in the game', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: otherPlayers[0].id,
          player2: otherPlayers[1].id,
        });
        expect(() => targetShooterAreaController.gamePiece).toThrowError();
      });
    });
    describe('status', () => {
      it('should return the status of the game', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(targetShooterAreaController.status).toBe('IN_PROGRESS');
      });
      it('should return WAITING_FOR_PLAYERS if there is no game', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          undefinedGame: true,
        });
        expect(targetShooterAreaController.status).toBe('WAITING_FOR_PLAYERS');
      });
    });
    describe('isEmpty', () => {
      it('should return true if the game is empty', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({});
        expect(targetShooterAreaController.isEmpty()).toBe(true);
      });
      it('should return false if the game is not empty', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          player1: ourPlayer.id,
        });
        expect(targetShooterAreaController.isEmpty()).toBe(false);
      });
    });
    describe('target position', () => {
      it('should return the position of the current target', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
        });
        expect(targetShooterAreaController.targetPosition).toStrictEqual({ x: 0, y: 0 });
      });
    });
    describe('scores', () => {
      it('should return the score of player1', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
        });
        expect(targetShooterAreaController.player1Score).toBe(0);
      });
      it('should return the score of player2', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: otherPlayers[0].id,
          player2: ourPlayer.id,
        });
        expect(targetShooterAreaController.player2Score).toBe(0);
      });
    });
    describe('accuracy', () => {
      it('should return the accuracy of player1', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
        });
        expect(targetShooterAreaController.player1Accuracy).toStrictEqual({ hits: 0, shots: 0 });
      });
      it('should return the accuracy of player2', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: otherPlayers[0].id,
          player2: ourPlayer.id,
        });
        expect(targetShooterAreaController.player2Accuracy).toStrictEqual({ hits: 0, shots: 0 });
      });
    });
    describe('difficulty', () => {
      it('should return the difficulty of the game', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
        });
        expect(targetShooterAreaController.difficulty).toBe('Easy');
      });
    });
    describe('target size', () => {
      it('should return the size of the target', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
        });
        expect(targetShooterAreaController.targetSize).toBe(1);
      });
    });
    describe('winner', () => {
      it('should return the winner of the game if there is one', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
          winner: ourPlayer.id,
        });
        expect(targetShooterAreaController.winner).toBe(ourPlayer);
      });
      it('should return undefined if there is no winner', () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
        });
        expect(targetShooterAreaController.winner).toBe(undefined);
      });
    });
    describe('makeMove', () => {
      it('should throw an error if the game is not in progress', async () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({});
        await expect(async () =>
          targetShooterAreaController.makeMove({ x: 0, y: 0 }),
        ).rejects.toEqual(new Error(NO_GAME_IN_PROGRESS_ERROR));
      });
      it('should send a command to the server to make a move', async () => {
        const targetShooterAreaController = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
        });
        const instanceID = nanoid();
        mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
          return { gameID: instanceID };
        });
        await targetShooterAreaController.joinGame();
        mockTownController.sendInteractableCommand.mockReset();
        await targetShooterAreaController.makeMove({ x: 0, y: 0 });
        expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(
          targetShooterAreaController.id,
          {
            type: 'GameMove',
            gameID: instanceID,
            move: { gamePiece: 'player1', position: { x: 0, y: 0 } },
          },
        );
      });
    });
  });
  describe('[T1.2] _updateFrom', () => {
    describe('if the game is in progress', () => {
      let controller: TargetShooterAreaController;
      beforeEach(() => {
        controller = targetShooterAreaControllerWithProp({
          status: 'IN_PROGRESS',
          player1: ourPlayer.id,
          player2: otherPlayers[0].id,
        });
      });
      it('should emit targetPositionUpdated if the target position has changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        const newModel: GameArea<TargetShooterGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game.state,
              currentTarget: { x: 1, y: 1 },
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const positionChangeCall = emitSpy.mock.calls.find(
          call => call[0] === 'targetPositionUpdated',
        );
        expect(positionChangeCall).toBeTruthy();
      });
      it('should emit player1ScoreUpdated if the player1 score has changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        const newModel: GameArea<TargetShooterGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game.state,
              player1Score: 1,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const scoreChangeCall = emitSpy.mock.calls.find(call => call[0] === 'player1ScoreUpdated');
        expect(scoreChangeCall).toBeTruthy();
      });
      it('should emit player2ScoreUpdated if the player2 score has changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        const newModel: GameArea<TargetShooterGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game.state,
              player2Score: 1,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const scoreChangeCall = emitSpy.mock.calls.find(call => call[0] === 'player2ScoreUpdated');
        expect(scoreChangeCall).toBeTruthy();
      });
      it('should emit difficultyUpdated if the difficulty has changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        const newModel: GameArea<TargetShooterGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game.state,
              difficulty: 'Medium',
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const difficultyChangeCall = emitSpy.mock.calls.find(
          call => call[0] === 'difficultyUpdated',
        );
        expect(difficultyChangeCall).toBeTruthy();
      });
      it('should emit targetSizeUpdated if the target size has changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        const newModel: GameArea<TargetShooterGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game.state,
              targetSize: 2,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const targetSizeChangeCall = emitSpy.mock.calls.find(
          call => call[0] === 'targetSizeUpdated',
        );
        expect(targetSizeChangeCall).toBeTruthy();
      });
      it('should emit player1AccuracyUpdated if the player1 accuracy has changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        const newModel: GameArea<TargetShooterGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game.state,
              player1Accuracy: { hits: 1, shots: 2 },
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const accuracyChangeCall = emitSpy.mock.calls.find(
          call => call[0] === 'player1AccuracyUpdated',
        );
        expect(accuracyChangeCall).toBeTruthy();
      });
      it('should emit player2AccuracyUpdated if the player2 accuracy has changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        const newModel: GameArea<TargetShooterGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game.state,
              player2Accuracy: { hits: 1, shots: 2 },
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const accuracyChangeCall = emitSpy.mock.calls.find(
          call => call[0] === 'player2AccuracyUpdated',
        );
        expect(accuracyChangeCall).toBeTruthy();
      });
      it('should call super._updateFrom', () => {
        const spy = jest.spyOn(GameAreaController.prototype, 'updateFrom');
        const model = controller.toInteractableAreaModel();
        controller.updateFrom(model, otherPlayers.concat(ourPlayer));
        expect(spy).toHaveBeenCalled();
      });
    });
  });
  describe('[T1.3] _startGame', () => {
    it('should throw an error if the game is not waiting to start', async () => {
      const controller = targetShooterAreaControllerWithProp({
        status: 'IN_PROGRESS',
      });
      await expect(async () => controller.startGame()).rejects.toEqual(
        new Error('No game startable'),
      );
    });
    it('should throw an error if there is no game', async () => {
      const controller = targetShooterAreaControllerWithProp({
        undefinedGame: true,
      });
      await expect(async () => controller.startGame()).rejects.toEqual(
        new Error('No game startable'),
      );
    });
    it('should send a command to the server to start the game after join', async () => {
      const controller = targetShooterAreaControllerWithProp({
        status: 'WAITING_TO_START',
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();
      mockTownController.sendInteractableCommand.mockReset();
      await controller.startGame();
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        gameID: instanceID,
        type: 'StartGame',
      });
    });
  });
  describe('[T1.4] change difficulty', () => {
    it('should send a command to the server to change the difficulty', async () => {
      const controller = targetShooterAreaControllerWithProp({
        status: 'IN_PROGRESS',
        player1: ourPlayer.id,
        player2: otherPlayers[0].id,
      });
      const instanceID = nanoid();
      mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
        return { gameID: instanceID };
      });
      await controller.joinGame();
      mockTownController.sendInteractableCommand.mockReset();
      await controller.changeDifficulty('Medium');
      expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
        gameID: instanceID,
        type: 'ChangeDifficulty',
        difficulty: 'Medium',
      });
    });
  });
});
