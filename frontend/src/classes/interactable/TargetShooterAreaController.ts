import _ from 'lodash';
import {
  GameArea,
  GameStatus,
  TargetShooterAccuracy,
  TargetShooterDifficulty,
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

const EASY_TARGET_SIZE = 40;
const MEDIUM_TARGET_SIZE = 30;
const HARD_TARGET_SIZE = 20;

export type TargetShooterEvents = GameEventTypes & {
  targetPositionUpdated: (position: XY) => void;
  leftScoreUpdated: (score: TargetShooterScore) => void;
  rightScoreUpdated: (score: TargetShooterScore) => void;
  difficultyUpdated: (difficulty: TargetShooterDifficulty) => void;
  targetSizeUpdated: (size: number) => void;
  player1AccuracyUpdated: (accuracy: TargetShooterAccuracy) => void;
  player2AccuracyUpdated: (accuracy: TargetShooterAccuracy) => void;
};

/**
 * This class is responsible for managing the state of the Target Shooter game, and for sending commands to the server
 */
export default class TargetShooterAreaController extends GameAreaController<
  TargetShooterGameState,
  TargetShooterEvents
> {
  private _targetposition: XY = {
    x: 0,
    y:0,
  };

  private _difficulty: TargetShooterDifficulty = 'Easy';

  private _targetSize: number = 40;

  private _player1score: TargetShooterScore = 0;

  private _player2score: TargetShooterScore = 0;

  private _player1Acccuracy: TargetShooterAccuracy = {
    hits: 0,
    shots: 0,
  };

  private _player2Acccuracy: TargetShooterAccuracy = {
    hits: 0,
    shots: 0,
  };

  // returns the current position of the target
  get targetPosition(): XY {
    return this._targetposition;
  }

  // returns the current score of player1
  get player1Score(): TargetShooterScore {
    return this._player1score;
  }

  // returns the current score of player2
  get player2Score(): TargetShooterScore {
    return this._player2score;
  }

  // returns the accuracy of player1
  get player1Accuracy(): TargetShooterAccuracy {
    return this._player1Acccuracy;
  }

  // returns the accuracy of player2
  get player2Accuracy(): TargetShooterAccuracy {
    return this._player2Acccuracy;
  }

  // returns what level of difficulty was selected
  get difficulty(): TargetShooterDifficulty {
    return this._difficulty;
  }

  // returns the size of the target
  get targetSize(): number {
    return this._targetSize;
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
   * Returns the player of the current player's game piece
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
   * If the target position has changed, emits an targetPositionUpdated event with the new target location
   * If the player1 score has changed, emits an player1Score event with the new player 1 score
   * If the player2 score has changed, emits an player2Score event with the new player 2 score
   * If the difficulty has changed, emits a difficultyUpdated event with the new difficulty
   * If the target size has changed, emits a targetSizeUpdated event with the new target size
   * If the player1 accuracy has changed, emits a player1AccuracyUpdated event with the new player1 accuracy
   * If the player2 accuracy has changed, emits a player1AccuracyUpdated event with the new player2 accuracy
   *
   */
  protected _updateFrom(newModel: GameArea<TargetShooterGameState>): void {
    super._updateFrom(newModel);
    const newGame = newModel.game;
    if (newGame) {
      if (!_.isEqual(newGame.state.currentTarget, this._targetposition)) {
        this._targetposition = newGame.state.currentTarget;
        this.emit('targetPositionUpdated', this._targetposition);
      }

      if (newGame.state.player1Score !== this._player1score) {
        this._player1score = newGame.state.player1Score;
        this.emit('player1ScoreUpdated', this._player1score);
      }

      if (newGame.state.player2Score !== this._player2score) {
        this._player2score = newGame.state.player2Score;
        this.emit('player2ScoreUpdated', this._player2score);
      }

      if (newGame.state.difficulty !== this._difficulty) {
        this._difficulty = newGame.state.difficulty;
        this.emit('difficultyUpdated', this._difficulty);
      }

      if (newGame.state.targetSize !== this._targetSize) {
        this._targetSize = newGame.state.targetSize;
        this.emit('targetSizeUpdated', this._targetSize);
      }

      if (!_.isEqual(newGame.state.player1Accuracy, this._player1Acccuracy)) {
        this._player1Acccuracy = newGame.state.player1Accuracy;
        this.emit('player1AccuracyUpdated', this._player1Acccuracy);
      }

      if (!_.isEqual(newGame.state.player2Accuracy, this._player2Acccuracy)) {
        this._player2Acccuracy = newGame.state.player2Accuracy;
        this.emit('player2AccuracyUpdated', this._player2Acccuracy);
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
   *
   * @param position XY where the player's position is
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

  private _getTargetSize(difficulty: TargetShooterDifficulty): number {
    switch (difficulty) {
      case 'Easy':
        return EASY_TARGET_SIZE;
      case 'Medium':
        return MEDIUM_TARGET_SIZE;
      case 'Hard':
        return HARD_TARGET_SIZE;
      default:
        return EASY_TARGET_SIZE;
    }
  }

  public async changeDifficulty(difficulty: TargetShooterDifficulty): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID) {
      throw new Error('No game');
    }
    await this._townController.sendInteractableCommand(this.id, {
      gameID: instanceID,
      type: 'ChangeDifficulty',
      difficulty,
    });
    this._difficulty = difficulty;
    this._targetSize = this._getTargetSize(difficulty);
    this.emit('difficultyUpdated', this._difficulty);
    this.emit('targetSizeUpdated', this._targetSize);
  }
}
