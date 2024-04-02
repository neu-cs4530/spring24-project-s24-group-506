import _ from 'lodash';
import {
  ConnectFourColIndex,
  ConnectFourColor,
  ConnectFourGameState,
  ConnectFourMove,
  ConnectFourRowIndex,
  GameArea,
  GameStatus,
  PongGameState,
  PongMove,
  PongPlayer,
  PongScore,
  PongScoreUpdate,
  XY,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, {
  GameEventTypes,
  NO_GAME_IN_PROGRESS_ERROR,
  NO_GAME_STARTABLE,
  PLAYER_NOT_IN_GAME_ERROR,
} from './GameAreaController';

export type PongEvents = GameEventTypes & {
    ballPositionUpdated: (position: XY) => void;
    leftScoreUpdated: (score: PongScore) => void;
    rightScoreUpdated: (score: PongScore) => void;
    oppositePaddleUpdated: (location: XY) => void;
};

/**
 * This class is responsible for managing the state of the Connect Four game, and for sending commands to the server
 */
export default class PongAreaController extends GameAreaController<
  PongGameState,
  PongEvents
> {
    private _ballPosition: XY = { x: 200, y: 120 };
    private _oppositePaddle: XY = { x: 0, y: 0 };
    private _leftScore: PongScore = 0;
    private _rightScore: PongScore = 0;

    get oppositePaddle(): XY {
        return this._oppositePaddle;
    }

    get ballPosition(): XY {
        return this._ballPosition;
    }

    get leftScore(): PongScore {
        return this._leftScore;
    }

    get rightScore(): PongScore {
        return this._rightScore;
    }

  /**
   * Returns the player with the 'leftPlayer' game piece, if there is one, or undefined otherwise
   */
  get leftPlayer(): PlayerController | undefined {
    const leftPlayer = this._model.game?.state.leftPlayer;
    if (leftPlayer) {
      return this.occupants.find(eachOccupant => eachOccupant.id === leftPlayer);
    }
    return undefined;
  }

  /**
   * Returns the player with the 'rightPlayer' game piece, if there is one, or undefined otherwise
   */
  get rightPlayer(): PlayerController | undefined {
    const rightPlayer = this._model.game?.state.rightPlayer;
    if (rightPlayer) {
      return this.occupants.find(eachOccupant => eachOccupant.id === rightPlayer);
    }
    return undefined;
  }

  /**
   * Returns the player who won the game, if there is one, or undefined otherwise
   */
  get winner(): PlayerController | undefined {
    const winner = this._model.game?.state.winner;
    if (winner) {
      return this.occupants.find(eachOccupant => eachOccupant.id === winner);
    }
    return undefined;
  }

  /**
   * Returns true if the current player is in the game, false otherwise
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) ?? false;
  }

  /**
   * Returns the color of the current player's game piece
   * @throws an error with message PLAYER_NOT_IN_GAME_ERROR if the current player is not in the game
   */
  get gamePiece(): PongPlayer {
    if (this.leftPlayer?.id === this._townController.ourPlayer.id) {
      return 'Left';
    } else if (this.rightPlayer?.id === this._townController.ourPlayer.id) {
      return 'Right';
    }
    throw new Error(PLAYER_NOT_IN_GAME_ERROR);
  }

  /**
   * Returns the status of the game
   * If there is no game, returns 'WAITING_FOR_PLAYERS'
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_FOR_PLAYERS';
    }
    return status;
  }

  /**
   * Returns true if the game is empty - no players AND no occupants in the area
   *
   */
  isEmpty(): boolean {
    return !this.leftPlayer && !this.rightPlayer && this.occupants.length === 0;
  }

  /**
   * Returns true if the game is not empty and the game is not waiting for players
   */
  public isActive(): boolean {
    return !this.isEmpty() && this.status !== 'WAITING_FOR_PLAYERS';
  }

  /**
   * Updates the internal state of this ConnectFourAreaController based on the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and other
   * common properties (including this._model)
   *
   * If the board has changed, emits a boardChanged event with the new board.
   * If the board has not changed, does not emit a boardChanged event.
   *
   * If the turn has changed, emits a turnChanged event with the new turn (true if our turn, false otherwise)
   * If the turn has not changed, does not emit a turnChanged event.
   */
  protected _updateFrom(newModel: GameArea<PongGameState>): void {
    super._updateFrom(newModel);
    const newGame = newModel.game;
    if (newGame) {
      if (this.gamePiece === 'Left') {
        if (!_.isEqual(newGame.state.rightPaddle, this._oppositePaddle)) {
          this._oppositePaddle = newGame.state.rightPaddle;
          this.emit('oppositePaddleUpdated', this._oppositePaddle);
        }
      } else {
        if (!_.isEqual(newGame.state.leftPaddle, this._oppositePaddle)) {
          this._oppositePaddle = newGame.state.leftPaddle;
          this.emit('oppositePaddleUpdated', this._oppositePaddle);
        }
      }

      if (!_.isEqual(newGame.state.ballPosition, this._ballPosition)) {
        this._ballPosition = newGame.state.ballPosition;
        this.emit('ballPositionUpdated', this._ballPosition);
      }

      if (newGame.state.leftScore !== this._leftScore) {
        this._leftScore = newGame.state.leftScore;
        this.emit('leftScoreUpdated', this._leftScore);
      }

      if (newGame.state.rightScore !== this._rightScore) {
        this._rightScore = newGame.state.rightScore;
        this.emit('rightScoreUpdated', this._rightScore);
      }
    }
  }

  /**
   * Sends a request to the server to start the game.
   *
   * If the game is not in the WAITING_TO_START state, throws an error.
   *
   * @throws an error with message NO_GAME_STARTABLE if there is no game waiting to start
   */
  public async startGame(): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'WAITING_TO_START') {
      throw new Error(NO_GAME_STARTABLE);
    }
    await this._townController.sendInteractableCommand(this.id, {
      gameID: instanceID,
      type: 'StartGame',
    });
  }

  /**
   * Sends a request to the server to place the current player's game piece in the given column.
   * Calculates the row to place the game piece in based on the current state of the board.
   * Does not check if the move is valid.
   *
   * @throws an error with message NO_GAME_IN_PROGRESS_ERROR if there is no game in progress
   * @throws an error with message COLUMN_FULL_MESSAGE if the column is full
   *
   * @param col Column to place the game piece in
   */
  public async makeMove(location: XY): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }

    const gamePiece = this.gamePiece;
    const move: PongMove = {
      gamePiece,
      location,
    };
    await this._townController.sendInteractableCommand(this.id, {
      type: 'GameMove',
      gameID: instanceID,
      move,
    });
  }

  public async updatePhysics(): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
      return;
    }

    await this._townController.sendInteractableCommand(this.id, {
      type: 'UpdatePhysics',
      gameID: instanceID,
    });
  }
}
