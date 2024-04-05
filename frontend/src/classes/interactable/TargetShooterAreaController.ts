import _ from 'lodash';
import {
  GameArea,
  GameStatus,
  TargetShooterGameState,
  TargetShooterMove,
  TargetShooterPlayer,
  TargetShooterScore,
  XY,
} from '../../types/CoveyTownSocket';
import PlayerController from '../PlayerController';
import GameAreaController, {
  GameEventTypes,
  NO_GAME_IN_PROGRESS_ERROR,
  NO_GAME_STARTABLE,
  PLAYER_NOT_IN_GAME_ERROR,
} from './GameAreaController';

export const PADDLE_MOVE_SPEED = 8;
export const PONG_WIDTH = 400;
export const PONG_HEIGHT = 320;
export const PONG_PADDLE_WIDTH = 16;
export const PONG_PADDLE_HEIGHT = 64;
export const PONG_BALL_SIZE = 12;
export const PONG_BALL_STARTING_SPEED = 2;

export type TargetShooterEvents = GameEventTypes & {
  targetPositionUpdated: (position: XY) => void;
  leftScoreUpdated: (score: TargetShooterScore) => void;
  rightScoreUpdated: (score: TargetShooterScore) => void;
  player1CursorUpdated: (position: XY) => void;
  player2CursorUpdated: (position: XY) => void;
};

/**
 * This class is responsible for managing the state of the Pong game, and for sending commands to the server
 */
export default class PongAreaController extends GameAreaController<
  TargetShooterGameState,
  TargetShooterEvents
> {
  private _targetposition: XY = {
    x: this._model.game?.state.currentTarget.x ?? 0,
    y: this._model.game?.state.currentTarget.y ?? 0,
  };

  private _player1cursor: XY = {
    x: this._model.game?.state.player1Cursor.x ?? 0,
    y: this._model.game?.state.player1Cursor.y ?? 0,
  };

  private _player2cursor: XY = {
    x: this._model.game?.state.player2Cursor.x ?? 0,
    y: this._model.game?.state.player2Cursor.y ?? 0,
  };

  private _player1score: TargetShooterScore = 0;

  private _player2score: TargetShooterScore = 0;

  // returns the current position of the left paddle
  get player1cursor(): XY {
    return this._player1cursor;
  }

  // returns the current position of the right paddle
  get player2cursor(): XY {
    return this._player2cursor;
  }

  // returns the current position of the ball
  get ballPosition(): XY {
    return this._targetposition;
  }

  // returns the current score of the left player
  get leftScore(): TargetShooterScore {
    return this._player1score;
  }

  // returns the current score of the right player
  get rightScore(): TargetShooterScore {
    return this._player2score;
  }

  /**
   * Returns the player with the 'Player1' game piece, if there is one, or undefined otherwise
   */
  get player1(): PlayerController | undefined {
    const player1 = this._model.game?.state.player1;
    if (player1) {
      return this.occupants.find(eachOccupant => eachOccupant.id === player1);
    }
    return undefined;
  }

  /**
   * Returns the player with the 'Player2' game piece, if there is one, or undefined otherwise
   */
  get player2(): PlayerController | undefined {
    const player2 = this._model.game?.state.player2;
    if (player2) {
      return this.occupants.find(eachOccupant => eachOccupant.id === player2);
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
  get gamePiece(): TargetShooterPlayer {
    if (this.player1?.id === this._townController.ourPlayer.id) {
      return 'player1';
    } else if (this.player2?.id === this._townController.ourPlayer.id) {
      return 'player2';
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
    return !this.player1 && !this.player2 && this.occupants.length === 0;
  }

  /**
   * Returns true if the game is not empty and the game is not waiting for players
   */
  public isActive(): boolean {
    return !this.isEmpty() && this.status !== 'WAITING_FOR_PLAYERS';
  }

  /**
   * Updates the internal state of this PONGAreaController based on the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and other
   * common properties (including this._model)
   *
   * If the opposite paddle has changed, emits an oppositePaddleUpdated event with the new paddle location
   * If the our paddle has changed, emits an ourPaddleUpdated event with the new paddle location
   * If the ball position has changed, emits a ballPositionUpdated event with the new ball position
   * If the left score has changed, emits a leftScoreUpdated event with the new left score
   * If the right score has changed, emits a rightScoreUpdated event with the new right score
   *
   */
  protected _updateFrom(newModel: GameArea<TargetShooterGameState>): void {
    super._updateFrom(newModel);
    const newGame = newModel.game;
    if (newGame) {
      if (!_.isEqual(newGame.state.player1Cursor, this._player1cursor)) {
        this._player1cursor = newGame.state.player1Cursor;
        this.emit('player1CursorUpdated', this._player1cursor);
      }

      if (!_.isEqual(newGame.state.player2Cursor, this._player2cursor)) {
        this._player2cursor = newGame.state.player2Cursor;
        this.emit('player2CursorUpdated', this._player2cursor);
      }

      if (!_.isEqual(newGame.state.currentTarget, this._targetposition)) {
        this._targetposition = newGame.state.currentTarget;
        this.emit('targetPositionUpdated', this._targetposition);
      }

      if (newGame.state.player1Score !== this._player1score) {
        this._player1score = newGame.state.player1Score;
        this.emit('leftScoreUpdated', this._player1score);
      }

      if (newGame.state.player2Score !== this._player2score) {
        this._player2score = newGame.state.player2Score;
        this.emit('rightScoreUpdated', this._player2score);
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
  public async makeMove(position: XY): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
      throw new Error(NO_GAME_IN_PROGRESS_ERROR);
    }

    const gamePiece = this.gamePiece;
    const move: TargetShooterMove = {
      gamePiece,
      position,
    };
    await this._townController.sendInteractableCommand(this.id, {
      type: 'GameMove',
      gameID: instanceID,
      move,
    });
  }
}
