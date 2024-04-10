import assert from 'assert';
import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import {
  GameArea,
  GameResult,
  GameStatus,
  PongGameState,
  PongMove,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import TownController from '../TownController';
import GameAreaController, { NO_GAME_IN_PROGRESS_ERROR } from './GameAreaController';
import PongAreaController from './PongAreaController';

describe('[T1] PongAreaController', () => {
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

  function pongAreaControllerWithProp({
    _id,
    history,
    left,
    right,
    undefinedGame,
    status,
    winner,
  }: {
    _id?: string;
    history?: GameResult[];
    left?: string;
    right?: string;
    undefinedGame?: boolean;
    status?: GameStatus;
    moves?: PongMove[];
    winner?: string;
  }) {
    const id = _id || nanoid();
    const players = [];
    if (left) players.push(left);
    if (right) players.push(right);
    const ret = new PongAreaController(
      id,
      {
        id,
        occupants: players,
        history: history || [],
        type: 'PongArea',
        game: undefinedGame
          ? undefined
          : {
              id,
              players: players,
              state: {
                status: status || 'IN_PROGRESS',
                leftPlayer: left,
                rightPlayer: right,
                leftPaddle: { x: 0, y: 0 },
                leftPaddleDirection: 'Still',
                rightPaddle: { x: 0, y: 0 },
                rightPaddleDirection: 'Still',
                leftScore: 0,
                rightScore: 0,
                ballPosition: { x: 0, y: 0 },
                ballVelocity: { x: 0, y: 0 },
                winner: winner,
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
        const controller = pongAreaControllerWithProp({
          status: 'IN_PROGRESS',
          left: ourPlayer.id,
        });
        expect(controller.isActive()).toBe(true);
      });
      it('should return false if the game is not in progress', () => {
        const controller = pongAreaControllerWithProp({
          status: 'OVER',
        });
        expect(controller.isActive()).toBe(false);
      });
    });
    describe('isPlayer', () => {
      it('should return true if the current player is a player in this game', () => {
        const controller = pongAreaControllerWithProp({
          status: 'IN_PROGRESS',
          left: ourPlayer.id,
        });
        expect(controller.isPlayer).toBe(true);
      });
      it('should return false if the current player is not a player in this game', () => {
        const controller = pongAreaControllerWithProp({
          status: 'IN_PROGRESS',
          left: otherPlayers[0].id,
          right: otherPlayers[1].id,
        });
        expect(controller.isPlayer).toBe(false);
      });
    });
    describe('gamePiece', () => {
      it('should return the game piece of the current player if the current player is a player in this game', () => {
        const controller = pongAreaControllerWithProp({
          status: 'IN_PROGRESS',
          left: ourPlayer.id,
        });
        expect(controller.gamePiece).toBe('Left');

        //check O
        const controller2 = pongAreaControllerWithProp({
          status: 'IN_PROGRESS',
          right: ourPlayer.id,
        });
        expect(controller2.gamePiece).toBe('Right');
      });
      it('should throw an error if the current player is not a player in this game', () => {
        const controller = pongAreaControllerWithProp({
          status: 'IN_PROGRESS',
          left: otherPlayers[0].id,
          right: otherPlayers[1].id,
        });
        expect(() => controller.gamePiece).toThrowError();
      });
    });
    describe('status', () => {
      it('should return the status of the game', () => {
        const controller = pongAreaControllerWithProp({
          status: 'IN_PROGRESS',
        });
        expect(controller.status).toBe('IN_PROGRESS');
      });
      it('should return WAITING_TO_START if the game is not defined', () => {
        const controller = pongAreaControllerWithProp({
          undefinedGame: true,
        });
        expect(controller.status).toBe('WAITING_FOR_PLAYERS');
      });
    });
    describe('o', () => {
      it('should return the o player if there is one', () => {
        const controller = pongAreaControllerWithProp({
          status: 'IN_PROGRESS',
          left: otherPlayers[0].id,
          right: ourPlayer.id,
        });
        expect(controller.rightPlayer).toBe(ourPlayer);
      });
      it('should return undefined if there is no o player and the game is waiting to start', () => {
        const controller = pongAreaControllerWithProp({
          status: 'WAITING_TO_START',
        });
        expect(controller.rightPlayer).toBe(undefined);
      });
      it('should return undefined if there is no o player', () => {
        const controller = pongAreaControllerWithProp({
          status: 'IN_PROGRESS',
          left: otherPlayers[0].id,
        });
        expect(controller.rightPlayer).toBe(undefined);
      });
    });
    describe('winner', () => {
      it('should return the winner if there is one', () => {
        const controller = pongAreaControllerWithProp({
          status: 'OVER',
          left: otherPlayers[0].id,
          right: ourPlayer.id,
          winner: ourPlayer.id,
        });
        expect(controller.winner).toBe(ourPlayer);
      });
      it('should return undefined if there is no winner', () => {
        const controller = pongAreaControllerWithProp({
          status: 'OVER',
          left: otherPlayers[0].id,
          right: ourPlayer.id,
        });
        expect(controller.winner).toBe(undefined);
      });
    });
    describe('makeMove', () => {
      it('should throw an error if the game is not in progress', async () => {
        const controller = pongAreaControllerWithProp({});
        await expect(async () => controller.makeMove('Down')).rejects.toEqual(
          new Error(NO_GAME_IN_PROGRESS_ERROR),
        );
      });
      it('Should call townController.sendInteractableCommand', async () => {
        const controller = pongAreaControllerWithProp({
          status: 'IN_PROGRESS',
          left: ourPlayer.id,
          right: otherPlayers[0].id,
        });
        // Simulate joining the game for real
        const instanceID = nanoid();
        mockTownController.sendInteractableCommand.mockImplementationOnce(async () => {
          return { gameID: instanceID };
        });
        await controller.joinGame();
        mockTownController.sendInteractableCommand.mockReset();
        await controller.makeMove('Down');
        expect(mockTownController.sendInteractableCommand).toHaveBeenCalledWith(controller.id, {
          type: 'GameMove',
          gameID: instanceID,
          move: {
            direction: 'Down',
            gamePiece: 'Left',
          },
        });
      });
    });
  });
  describe('[T1.2] _updateFrom', () => {
    describe('if the game is in progress', () => {
      let controller: PongAreaController;
      beforeEach(() => {
        controller = pongAreaControllerWithProp({
          status: 'IN_PROGRESS',
          left: ourPlayer.id,
          right: otherPlayers[0].id,
        });
      });
      it('should emit a boardChanged event with the new board', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        const newModel: GameArea<PongGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const boardChangedCall = emitSpy.mock.calls.find(call => call[0] === 'boardChanged');
        expect(boardChangedCall).toBeUndefined();
      });
      it('should emit a turnChanged event with true if it is our turn', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        const newModel: GameArea<PongGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const testModel: GameArea<PongGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(testModel, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'turnChanged');
        expect(turnChangedCall).toBeUndefined();
        if (turnChangedCall) expect(turnChangedCall[1]).toEqual(true);
      });
      it('should emit a turnChanged event with false if it is not our turn', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        const newModel: GameArea<PongGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'turnChanged');
        expect(turnChangedCall).toBeUndefined();
        if (turnChangedCall) expect(turnChangedCall[1]).toEqual(false);
      });
      it('should not emit a turnChanged event if the turn has not changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(model, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'turnChanged');
        expect(turnChangedCall).not.toBeDefined();
      });
      it('should not emit a boardChanged event if the board has not changed', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);

        const newModel: GameArea<PongGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));

        const newModelWithSuffle: GameArea<PongGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
            },
          },
        };
        const emitSpy = jest.spyOn(controller, 'emit');
        controller.updateFrom(newModelWithSuffle, otherPlayers.concat(ourPlayer));
        const turnChangedCall = emitSpy.mock.calls.find(call => call[0] === 'boardChanged');
        expect(turnChangedCall).not.toBeDefined();
      });
      it('should update the board returned by the board property', () => {
        const model = controller.toInteractableAreaModel();
        assert(model.game);
        const newModel: GameArea<PongGameState> = {
          ...model,
          game: {
            ...model.game,
            state: {
              ...model.game?.state,
            },
          },
        };
        controller.updateFrom(newModel, otherPlayers.concat(ourPlayer));
      });
    });
    it('should call super._updateFrom', () => {
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore - we are testing spying on a private method
      const spy = jest.spyOn(GameAreaController.prototype, '_updateFrom');
      const controller = pongAreaControllerWithProp({});
      const model = controller.toInteractableAreaModel();
      controller.updateFrom(model, otherPlayers.concat(ourPlayer));
      expect(spy).toHaveBeenCalled();
    });
  });
});
