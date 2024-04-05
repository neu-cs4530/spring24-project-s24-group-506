import {
  TargetShooterGameState,
  TargetShooterMove,
  TargetShooterPlayer,
  GameMove,
  PlayerID,
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

export const SCREENWIDTH = 800;
export const SCREENHEIGHT = 640;

/**
 * A ConnectFourGame is a Game that implements the rules of Connect Four.
 * @see https://en.wikipedia.org/wiki/Connect_Four
 */
export default class TargetShooterGame extends Game<TargetShooterGameState, TargetShooterMove> {
  private _preferredPlayer1?: PlayerID;

  private _preferredPlayer2?: PlayerID;

  /**
   * Creates a new ConnectFourGame.
   * @param priorGame If provided, the new game will be created such that if either player
   * from the prior game joins, they will be the same color. When the game begins, the default
   * first player is red, but if either player from the prior game joins the new game
   * (and clicks "start"), the first player will be the other color.
   */
  public constructor(priorGame?: TargetShooterGame) {
    super({
      status: 'WAITING_FOR_PLAYERS',
      currentTarget: { x: 0, y: 0 },
      player1Score: 0,
      player2Score: 0,
      player1Cursor: { x: 0, y: 0 },
      player2Cursor: { x: 0, y: 0 },
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
   * The first player (red or yellow) is determined as follows:
   *   - If neither player was in the last game in this area (or there was no prior game), the first player is red.
   *   - If at least one player was in the last game in this area, then the first player will be the other color from last game.
   *   - If a player from the last game *left* the game and then joined this one, they will be treated as a new player (not given the same color by preference).   *
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
   * - Assigns the player to a color (red or yellow). If the player was in the prior game, then attempts
   * to reuse the same color if it is not in use. Otherwise, assigns the player to the first
   * available color (red, then yellow).
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
   * Uses the player's ID to determine which color they are playing as (ignores move.gamePiece).
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
   * @throws INvalidParametersError if the move is not the player's turn (MOVE_NOT_YOUR_TURN_MESSAGE)
   * @throws InvalidParametersError if the move is invalid per the rules of Connect Four (BOARD_POSITION_NOT_VALID_MESSAGE)
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
    } else if (move.playerID === this.state.player2) {
      gamePiece = 'player2';
    } else {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (gamePiece === 'player1') {
      this._checkTargetCollision('player1');
      newState.player1Cursor = move.move.position;
    } else if (gamePiece === 'player2') {
      this._checkTargetCollision('player2');
      newState.player2Cursor = move.move.position;
    }
    this.state = newState;
  }

  private _checkTargetCollision(player: TargetShooterPlayer): void {
    const cursorX = player === 'player1' ? this.state.player1Cursor.x : this.state.player2Cursor.x;
    const cursorY = player === 'player1' ? this.state.player1Cursor.y : this.state.player2Cursor.y;

    const distance = Math.sqrt(
      (this.state.currentTarget.x - cursorX) ** 2 + (this.state.currentTarget.y - cursorY) ** 2,
    );
    // arbitary value
    if (distance < 5) {
      this._incrementScore(player);
      this._spawnTarget();
    }
  }

  private _incrementScore(player: TargetShooterPlayer): void {
    if (player === 'player1') {
      this.state.player1Score++;
    } else {
      this.state.player2Score++;
    }
  }

  private _spawnTarget(): void {
    const newTargetPosition = {
      x: Math.random() * SCREENWIDTH,
      y: Math.random() * SCREENHEIGHT,
    };
    this.state.currentTarget.x = newTargetPosition.x;
    this.state.currentTarget.y = newTargetPosition.y;
  }
}
