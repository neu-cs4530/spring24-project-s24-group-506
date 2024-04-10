import {
  TargetShooterGameState,
  TargetShooterMove,
  TargetShooterPlayer,
  GameMove,
  PlayerID,
  XY,
  TargetShooterDifficulty,
} from '../../types/CoveyTownSocket';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import Game from './Game';

export const SCREENWIDTH = 400;
export const SCREENHEIGHT = 320;
export const EASY_TARGET_SIZE = 40;
export const MEDIUM_TARGET_SIZE = 30;
export const HARD_TARGET_SIZE = 20;

/**
 * A TargetShooterGame is a Game that implements the rules of Target Shooter.
 */
export default class TargetShooterGame extends Game<TargetShooterGameState, TargetShooterMove> {
  private _preferredPlayer1?: PlayerID;

  private _preferredPlayer2?: PlayerID;

  /**
   * Creates a new ConnectFourGame.
   * @param priorGame If provided, the new game will be created such that if either player
   * from the prior game joins, they will be the same player. When the game begins, the default
   * first player is player1, but if either player from the prior game joins the new game
   * (and clicks "start"), the first player will be the other player.
   */
  public constructor(priorGame?: TargetShooterGame) {
    super({
      status: 'WAITING_FOR_PLAYERS',
      currentTarget: { x: 100, y: 100 },
      player1Score: 0,
      player2Score: 0,
      difficulty: 'Easy',
      targetSize: 40,
      player1Accuracy: { hits: 0, shots: 0 },
      player2Accuracy: { hits: 0, shots: 0 },
    });
    this._preferredPlayer1 = priorGame?.state.player1;
    this._preferredPlayer2 = priorGame?.state.player2;
  }

  /**
   * Indicates that a player is ready to start the game.
   *
   * Updates the game state to indicate that the player is ready to start the game.
   *
   * If both players are ready, the game will start.
   *
   * The first player (player1 or player2) is determined as follows:
   *   - If neither player was in the last game in this area (or there was no prior game), the first player is player1.
   *   - If at least one player was in the last game in this area, then the first player will be the other player from last game.
   *   - If a player from the last game *left* the game and then joined this one, they will be treated as a new player (not given the same player by preference).   *
   *
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if the game is not in the WAITING_TO_START state (GAME_NOT_STARTABLE_MESSAGE)
   *
   * @param player The player who is ready to start the game
   */
  public startGame(player: Player): void {
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
    }
    if (this.state.player1 !== player.id && this.state.player2 !== player.id) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.player1 === player.id) {
      this.state.player1Ready = true;
    }
    if (this.state.player2 === player.id) {
      this.state.player2Ready = true;
    }
    this.state = {
      ...this.state,
      status:
        this.state.player1Ready && this.state.player2Ready ? 'IN_PROGRESS' : 'WAITING_TO_START',
    };
  }

  /**
   * Joins a player to the game.
   * - Assigns the player to a player (player1 or player2). If the player was in the prior game, then attempts
   * to reuse the same player if it is not in use. Otherwise, assigns the player to the first
   * available player (player1, then player2).
   * - If both players are now assigned, updates the game status to WAITING_TO_START.
   *
   * @throws InvalidParametersError if the player is already in the game (PLAYER_ALREADY_IN_GAME_MESSAGE)
   * @throws InvalidParametersError if the game is full (GAME_FULL_MESSAGE)
   *
   * @param player the player to join the game
   */
  protected _join(player: Player): void {
    if (this.state.player2 === player.id || this.state.player1 === player.id) {
      throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (this._preferredPlayer1 === player.id && !this.state.player1) {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
        player1: player.id,
      };
    } else if (this._preferredPlayer2 === player.id && !this.state.player2) {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
        player2: player.id,
      };
    } else if (!this.state.player1) {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
        player1: player.id,
      };
    } else if (!this.state.player2) {
      this.state = {
        ...this.state,
        status: 'WAITING_FOR_PLAYERS',
        player2: player.id,
      };
    } else {
      throw new InvalidParametersError(GAME_FULL_MESSAGE);
    }
    if (this.state.player1 && this.state.player2) {
      this.state.status = 'WAITING_TO_START';
    }
  }

  /**
   * Removes a player from the game.
   * Updates the game's state to reflect the player leaving.
   *
   * If the game state is currently "IN_PROGRESS", updates the game's status to OVER and sets the winner to the other player.
   *
   * If the game state is currently "WAITING_TO_START", updates the game's status to WAITING_FOR_PLAYERS.
   *
   * If the game state is currently "WAITING_FOR_PLAYERS" or "OVER", the game state is unchanged.
   *
   * @param player The player to remove from the game
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   */
  protected _leave(player: Player): void {
    if (this.state.status === 'OVER') {
      return;
    }
    const removePlayer = (playerID: string): TargetShooterPlayer => {
      if (this.state.player1 === playerID) {
        this.state = {
          ...this.state,
          player1: undefined,
          player1Ready: false,
        };
        return 'player1';
      }
      if (this.state.player2 === playerID) {
        this.state = {
          ...this.state,
          player2: undefined,
          player2Ready: false,
        };
        return 'player2';
      }
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    };
    const side = removePlayer(player.id);
    switch (this.state.status) {
      case 'WAITING_TO_START':
      case 'WAITING_FOR_PLAYERS':
        // no-ops: nothing needs to happen here
        this.state.status = 'WAITING_FOR_PLAYERS';
        break;
      case 'IN_PROGRESS':
        this.state = {
          ...this.state,
          status: 'OVER',
          winner: side === 'player1' ? this.state.player2 : this.state.player1,
        };
        break;
      default:
        // This behavior can be undefined :)
        throw new Error(`Unexpected game status: ${this.state.status}`);
    }
  }

  /**
   * Applies a move to the game.
   * Uses the player's ID to determine which player they are playing as (ignores move.gamePiece).
   *
   * Validates the move, and if it is valid, applies it to the game state.
   *
   * If the move ends the game, updates the game state to reflect the end of the game,
   * setting the status to "OVER" and the winner to the player who won (or "undefined" if it was a tie)
   *
   * @param move The move to attempt to apply
   *
   * @throws InvalidParametersError if the game is not in progress (GAME_NOT_IN_PROGRESS_MESSAGE)
   * @throws InvalidParametersError if the player is not in the game (PLAYER_NOT_IN_GAME_MESSAGE)
   *
   */

  public applyMove(move: GameMove<TargetShooterMove>): void {
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }

    let gamePiece: TargetShooterPlayer;
    const newState = { ...this.state };

    if (move.playerID === this.state.player1) {
      gamePiece = 'player1';
      newState.player1Accuracy.shots++;
    } else if (move.playerID === this.state.player2) {
      gamePiece = 'player2';
      newState.player2Accuracy.shots++;
    } else {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this._checkTargetHit(gamePiece, move.move.position, newState);
    this.state = newState;
  }

  public changeDifficulty(difficulty: TargetShooterDifficulty): void {
    const newState = { ...this.state };
    if (!(newState.status === 'WAITING_FOR_PLAYERS' || newState.status === 'WAITING_TO_START')) {
      throw new InvalidParametersError(
        'Cannot change difficulty while game is in progress or over',
      );
    }
    if (difficulty === newState.difficulty) {
      return;
    }
    newState.difficulty = difficulty;
    if (difficulty === 'Easy') {
      newState.targetSize = EASY_TARGET_SIZE;
    } else if (difficulty === 'Medium') {
      newState.targetSize = MEDIUM_TARGET_SIZE;
    } else {
      newState.targetSize = HARD_TARGET_SIZE;
    }
    this.state = newState;
  }

  // checks if player clicks within the boundaries of the target
  private _checkTargetHit(
    player: TargetShooterPlayer,
    position: XY,
    newState: TargetShooterGameState,
  ): void {
    const deltaX = newState.currentTarget.x - position.x;
    const deltaY = newState.currentTarget.y - position.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // arbitary value
    if (distance < newState.targetSize / 2) {
      this._incrementScore(player, newState);
      this._spawnTarget(newState);
    }
  }

  // increases the score to the corresponding player once they click on a target and checks if they have reached the max score
  // sets game to over and declares winner once max score is reached
  private _incrementScore(player: TargetShooterPlayer, newState: TargetShooterGameState): void {
    if (player === 'player1') {
      newState.player1Score++;
      newState.player1Accuracy.hits++;
    } else {
      newState.player2Score++;
      newState.player2Accuracy.hits++;
    }
    if (newState.player1Score === 10 || newState.player2Score === 10) {
      newState.status = 'OVER';
      newState.winner = newState.player1Score === 10 ? newState.player1 : newState.player2;
    }
  }

  // spawns a new target within the boundaries of the screen once the previous target has been clicked
  private _spawnTarget(newState: TargetShooterGameState): void {
    // tighten the boundaries of the targets spawned

    const newTargetPosition = {
      x: Math.random() * (SCREENWIDTH - 2 * newState.targetSize) + newState.targetSize,
      y: Math.random() * (SCREENHEIGHT - 2 * newState.targetSize) + newState.targetSize,
    };
    newState.currentTarget.x = newTargetPosition.x;
    newState.currentTarget.y = newTargetPosition.y;
  }
}
